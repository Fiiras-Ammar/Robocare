from django.urls import path
from . import views

urlpatterns = [
        path("calendar/add", views.addCalendarRequest),
        path("calendar/process/<str:task_id>/", views.processCalendar),
        path("calendar/get/<str:task_id>/", views.getCalendar),
        path("calendar/check_request/<str:task_id>/", views.checkRequest),
        path("calendar/grant_feature/<str:task_id>/", views.grantFeature),
        path("calendar/approve_data/<str:task_id>/", views.approveData),
        
]