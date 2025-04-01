from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
from django.core.exceptions import FieldError
from rest_framework import status

from .utils.et0_data import get_et0_data
from .utils.data_process import data_process
from .utils.calendar_generate import calendar_generate
from mesurements.models import (
    Project,
    Task,
    SensorData,
    Alert,
    
)

from django.core.mail import send_mail, EmailMultiAlternatives
import json
from django.contrib.gis.geos import Point


from .models import IrrigationCalendarRequest, IrrigationCalendarData

from mesurements.serializers import (
    TaskSerializer
)



def emailToGrant(user,task_id):
    
    firstname = user.firstname
    lastname = user.lastname
    company = user.company
    email = user.email
    phone = user.phone
    
    # html_message = render_to_string(
    #     "emails/notifRequest.html", context=context_email
    # )
    try:
        text_content = (
        "Salem,\r\r"
        "An irrigation calendar request has been submitted by:\r"
        f"{firstname} {lastname}\r"
        f"email: {email}\r"
        f"phone: {phone}\r"
        f"from: {company}\r"
        f"To grant this feature for the user please click on the following activation link:\n"
        f"https://dev.satellite.robocare.tn/irrigation/calendar/grant_feature/{task_id}/\r"
        f"After granting the feature you can generate and review the irrigation calendar by following this link:\r"
        f"https://dev.satellite.robocare.tn/irrigation/calendar/process/{task_id}/\r"
        f"If generated calendar data approved for delivery after review, please submit your approval by following this link:\r"
        f"https://dev.satellite.robocare.tn/irrigation/calendar/approve_data/{task_id}/\r\r"
        "Thanks"
        )
        message = EmailMultiAlternatives(
            subject="New request for irrigation calendar",
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=["blmailadd@gmail.com","kadrimarwa.1999@gmail.com"],
        )
        message.attach_alternative(text_content, "text/plain")
        message.send()
        
    except Exception as e:
        print(e)


@api_view(["POST"])
@permission_classes([AllowAny])
def addCalendarRequest(request):
    
    task_id = request.data.get("task_id")
    calendar_data = request.data.get("formData")
    
    try:
        task = Task.objects.get(id=task_id)
        project = task.project
        user = project.user
        task_name = task.task_name
        
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except Project.DoesNotExist:
        return Response(
            {"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND
        )
   
    geo_point = Point(task.area_of_interest[0][0])
    saving_request_to_db_error = None
    mailing_admin_error = None
    
    try:
            
        irrigation_calendar_request = IrrigationCalendarRequest(
            task = task,
            plot_central_point = geo_point,
            foliage_diameter = float(calendar_data["foliage_diameter"]),
            source_rate_l_second = float(calendar_data["source_rate"]),
            dripper_rate_liter_hour = float(calendar_data["dripper_rate"]),
            number_drippers_plant = int(calendar_data["drippers_number"]),
            inter_line = float(calendar_data["inter_line"]),
            intra_line = float(calendar_data["intra_line"]),
        )
        irrigation_calendar_request.save()
        
    except Exception as e:
        saving_request_to_db_error = e
        
    try:
        emailToGrant(user,task_id)
    except Exception as e:
        mailing_admin_error = e
        
    if (saving_request_to_db_error or mailing_admin_error):
        print("saving_request_to_db_error", saving_request_to_db_error)
        print("mailing_admin_error", mailing_admin_error)
        return Response(
                {"message", "Irrigation calendar request failed"},
                status=status.HTTP_408_REQUEST_TIMEOUT
            )
    
    return Response(
        {"message", "Irrigation calendar request submitted"},
        status=status.HTTP_200_OK
    )

    
@api_view(["GET"])
@permission_classes([AllowAny])
def processCalendar(request,task_id):
    
    # task_id = request.data.get("task_id")
    
    # calendar_data = request.data.get("formData")
    try:
        task = Task.objects.get(id=task_id)
        taskSerializer = TaskSerializer(task)
  
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

        
    try:
        calendar_request = IrrigationCalendarRequest.objects.filter(task_id=task_id).first()
        
    except IrrigationCalendarRequest.DoesNotExist:
        return Response({"message": "Irrigation calendar request not found"}, status=status.HTTP_404_NOT_FOUND)

    if (calendar_request.feature_granted == True):
        coordinates = calendar_request.plot_central_point
        data_list = get_et0_data(coordinates)
        if(data_list):
            by_10_days_data = data_process(data_list)
            generated_calendar_raw_data, generated_calendar_display_data = calendar_generate(task,by_10_days_data,calendar_request)
            
            irrigation_calendar_data = IrrigationCalendarData(
                calendar_request = calendar_request,
                calendar_year = 2024,
                raw_data = generated_calendar_raw_data,
                display_data = generated_calendar_display_data,
            )
            
            irrigation_calendar_data.save()
                
            return Response(
                    {"calendar_display_data": generated_calendar_display_data},
                    #  , "calendar_raw_data":generated_calendar_raw_data},
                    status=status.HTTP_200_OK
                )
        else:
            return Response(
                {"message": "could not fetch ET0 data from API"},
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        print(f"calendar request not approved for {task_id}")
        return Response(
            {"message": f"calendar request not yet approved for task {task_id}"},
            status=status.HTTP_403_FORBIDDEN
        )
    


@api_view(["GET"])
@permission_classes([AllowAny])
def getCalendar(request, task_id):
    
    # task_id = request.data.get("task_id")
    
    # calendar_data = request.data.get("formData")
    try:
        task = Task.objects.get(id=task_id)
        taskSerializer = TaskSerializer(task)
  
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        calendar_req = IrrigationCalendarRequest.objects.get(task__id=task_id)
        taskSerializer = TaskSerializer(task)
  
    except IrrigationCalendarRequest.DoesNotExist:
        return Response({"message": "Irrigation Calendar Request not found"}, status=status.HTTP_404_NOT_FOUND)
        
    
    try:
        # calendar_data = IrrigationCalendarData.objects.filter(irrigationcalendarrequest__task__id=task_id).first()
        calendar_data = IrrigationCalendarData.objects.get(calendar_request__id=calendar_req.id)
  
    except IrrigationCalendarData.DoesNotExist:
        return Response({"message": "Irrigation calendar data not found"}, status=status.HTTP_404_NOT_FOUND)
       
    
    if(calendar_data.approved == True):
        return Response(
                {"data": json.loads(calendar_data.display_data.replace("'",'"'))},
                status=status.HTTP_200_OK
            )
    else:
        return Response(
            {"message": "could not retireve calendar data"},
            status=status.HTTP_404_NOT_FOUND
        )
    


@api_view(["GET"])
@permission_classes([AllowAny])
def grantFeature(request, task_id):
    
    # task_id = request.data.get("task_id")
    
    # calendar_data = request.data.get("formData")
    try:
        task = Task.objects.get(id=task_id)
        taskSerializer = TaskSerializer(task)
  
    except Task.DoesNotExist:
        return Response({"message": f"Task not found {task_id}"}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        calendar_request = IrrigationCalendarRequest.objects.get(task__id=task_id)
  
    except IrrigationCalendarRequest.DoesNotExist:
        return Response({"message": "Irrigation Calendar Request not found"}, status=status.HTTP_404_NOT_FOUND)
        
    
    try:
        calendar_request.feature_granted = True
        calendar_request.save()
        return Response(
                {"message": f"Feature granted for task {task_id}"},
                status=status.HTTP_200_OK
            )
    except Exception as e:
        return Response(
                {"error": e},
                status=status.HTTP_304_NOT_MODIFIED
            )
        
@api_view(["GET"])
@permission_classes([AllowAny])
def approveData(request, task_id):
    
    # task_id = request.data.get("task_id")
    
    try:
        task = Task.objects.get(id=task_id)
        taskSerializer = TaskSerializer(task)
  
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        calendar_request = IrrigationCalendarRequest.objects.get(task__id=task_id)
  
    except IrrigationCalendarRequest.DoesNotExist:
        return Response({"message": "Irrigation Calendar Request not found"}, status=status.HTTP_404_NOT_FOUND)
    
    
    try:
        calendar_data = IrrigationCalendarData.objects.get(calendar_request__id=calendar_request.id)
  
    except IrrigationCalendarData.DoesNotExist:
        return Response({"message": "Irrigation calendar data not found"}, status=status.HTTP_404_NOT_FOUND)
       
    try:
        calendar_data.approved = True
        calendar_data.save()
        return Response(
                {"message": "Irrigation calendar data approved"},
                status=status.HTTP_200_OK
            )
    except Exception as e:
        return Response(
            {"message": "Could not update irrigation calendar data state\n{e}"},
            status=status.HTTP_304_NOT_MODIFIED
        )
        
        
        
        


@api_view(["GET"])
@permission_classes([AllowAny])
def checkRequest(request, task_id):
    
    try:
        task = Task.objects.get(id=task_id)
        taskSerializer = TaskSerializer(task)
  
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        calendar_req = IrrigationCalendarRequest.objects.get(task__id=task_id)
        taskSerializer = TaskSerializer(task)
        return Response({"message": "Irrigation Calendar Request already submitted"}, status=status.HTTP_200_OK)
        
  
    except IrrigationCalendarRequest.DoesNotExist:
        return Response({"message": "Irrigation Calendar Request not found"}, status=status.HTTP_404_NOT_FOUND)