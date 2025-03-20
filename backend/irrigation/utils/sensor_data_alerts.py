from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings

from rest_framework import status

from mesurements.models import (
    SensorHumidityAlert,
    SensorBatteryLevelAlert,
    Sensor,
    
)


def create_mv_alert(task, sensor_data_instance, description, alert_index, measured_value, threshold, difference ):
    
    SensorHumidityAlert.objects.create(
    task = task,
    time = sensor_data_instance.time,
    viewed = False,
    description = description,
    context = sensor_data_instance,
    index = alert_index,
    measured_value = measured_value,
    reference_value = threshold,
    difference = difference,
    )

def create_battery_charge_alert(task,sensor, sensor_data_instance, description, alert_index, level, critical ):
    
    try:
        alert, created = SensorBatteryLevelAlert.objects.get_or_create(
            task=task,
            sensor=sensor,
            defaults={
                        "time" : sensor_data_instance.time,
                        "viewed" : False,
                        "description" : description,
                        "context" : sensor_data_instance,
                        "index" : alert_index,
                        "level" : level,
                        "is_critical" : critical
                    }
        )

        if not created:
            alert.update_alert(level)
    except Exception as e:
        print(e)
        
    
def delete_battery_charge_alert(task, sensor):
    try:
        alert = SensorBatteryLevelAlert.objects.get(task=task, sensor=sensor)
        if alert:
            alert.delete()
    except Exception as e:
        print(e)
        
    
    
    # SensorBatteryLevelAlert.objects.create(
    # task = task,
    # time = sensor_data_instance.time,
    # viewed = False,
    # description = description,
    # context = sensor_data_instance,
    # sensor = sensor,
    # index = alert_index,
    # measured_value = measured_value,
    # is_critical = critical
    # )

    
def generate_mv_alerts(sensor_data_instance):

    try:
        # allSensorsData = SensorData.objects.all()
        # for sensor_data in allSensorsData:
        print(sensor_data_instance)
        task = sensor_data_instance.task
        threshold = 50
        description = ""
        
        if (sensor_data_instance.mv1 <= threshold):   
            
            alert_index = "mv1"
            difference = sensor_data_instance.mv1 - threshold
            description = "Soil humidity at 20 cm has reached the critical value" if (difference == 0)  else "Soil humidity at 20 cm is below the critical value"
            measured_value = sensor_data_instance.mv1
            
            create_mv_alert(task, sensor_data_instance, description, alert_index, measured_value, threshold, difference )
            
        if (sensor_data_instance.mv2 <= threshold):
            alert_index = "mv2"
            difference = sensor_data_instance.mv2 - threshold 
            description = "Soil humidity at 40 cm has reached the critical value" if (difference == 0)  else "Soil humidity at 40 cm is below the critical value"
            measured_value = sensor_data_instance.mv2   
            
            create_mv_alert(task, sensor_data_instance, description, alert_index, measured_value, threshold, difference )
            
        if (sensor_data_instance.mv3 <= threshold):     
            alert_index = "mv3"
            difference = sensor_data_instance.mv3 - threshold 
            description = "Soil humidity at 60 cm has reached the critical value" if (difference == 0)  else "Soil humidity at 60 cm is below the critical value"
            measured_value = sensor_data_instance.mv3
            
            create_mv_alert(task, sensor_data_instance, description, alert_index, measured_value, threshold, difference )



    except Exception as e:
        print('Error parsing sensor data')
        print(e)
        pass
    
    
    
def generate_sensor_battery_charge_alert(sensor_data_instance):

    try:
        task = sensor_data_instance.task
        sensor = Sensor.objects.get(task=task)
        threshold = 50
        critical_threshold = 20
        description = ""

        if (critical_threshold < sensor_data_instance.charge <= threshold):   
            
            alert_index = "sensor_battery_charge_level"
            description = "Sensor battery level alert"
            level = sensor_data_instance.charge
            
            create_battery_charge_alert(task,sensor, sensor_data_instance, description, alert_index, level, False )
            
        elif(sensor_data_instance.charge <= critical_threshold):
            
            alert_index = "sensor_battery_charge_level"
            description = "Sensor battery level critical alert"
            level = sensor_data_instance.charge
            
            create_battery_charge_alert(task, sensor, sensor_data_instance, description, alert_index, level, True)
        else:
            delete_battery_charge_alert(task, sensor)
            
    except Exception as e:
        print('Error parsing sensor data')
        print(e)
        pass