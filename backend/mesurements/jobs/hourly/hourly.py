from django_extensions.management.jobs import HourlyJob
from mesurements.models import Sensor, SensorData, Task
from decimal import Decimal
import requests
from mesurements.serializers import SensorDataSerializer
from django.utils import timezone
from datetime import datetime

class Job(HourlyJob):
    help = "HourlyJob to fetch sensors data."

    def execute(self):
        # executing empty sample job
        sensors = Sensor.objects.all()

        for sensor in sensors:
            # api-endpoint
            url = sensor.url
            result = requests.get(url)
            if 'allDataSensor' in result.json():
                data = result.json()['allDataSensor'][0]
                time_value = datetime.strptime(data['time'], '%Y-%m-%d %H:%M')
                isSameDataExists = SensorData.objects.filter(task_id=sensor.task_id,time=time_value).exists()
                if not isSameDataExists :

                    # prepare object
                    sensorData = SensorData()
                    sensorData.task = Task.objects.get(id=sensor.task_id)
                    sensorData.time = timezone.make_aware(time_value,timezone=timezone.utc)  # Set timezone
                    sensorData.charge = Decimal(data['charge'].replace(',','.'))
                    sensorData.day_num = data['day_num']
                    sensorData.temperature = data['temperature']
                    sensorData.humidity = data['humidity']
                    sensorData.pressure = data['pressure']
                    sensorData.altitude = data['altitude']
                    sensorData.adc = Decimal(data['adc'].replace(',','.'))
                    sensorData.ts = Decimal(data['ts'].replace(',','.'))
                    sensorData.mv1 = data['mv1']
                    sensorData.mv2 = data['mv2']
                    sensorData.mv3 = data['mv3']
                    sensorData.et0 = Decimal(data['et0'].replace(',','.'))
                    sensorData.rain = data['rain']
                    sensorData.radiation = Decimal(data['radiation'].replace(',','.'))
                    #save object in database
                    sensorData.save()
                    print("sensor data added for task : ",sensor.task_id," date : ", sensorData.time)

        print("====================================================================================")
        print("====================================================================================")
        print("                 Sensors Data fetched successfully")
        print("====================================================================================")
        print("====================================================================================")


        pass
