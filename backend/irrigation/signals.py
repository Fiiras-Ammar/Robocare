from django.db.models.signals import post_save
from django.dispatch import receiver
from mesurements.models import SensorData
from .utils.sensor_data_alerts import generate_mv_alerts, generate_sensor_battery_charge_alert

@receiver(post_save, sender=SensorData)
def handle_new_sensor_data(sender, instance,created, **kwargs):
    # if created:
    generate_mv_alerts(instance)
    generate_sensor_battery_charge_alert(instance)