from django.db.models.signals import post_save
from django.dispatch import receiver
from mesurements.models import GraphData, Pattern, DataForecast, IndexForecast, PatternSelf
from .helpers.generate_pattern_alerts import generate_pattern_alerts_for_new_graph_data, generate_pattern_alerts_for_new_pattern, generate_self_pattern_alerts_for_new_pattern
from .helpers.generate_forecast_alerts import generate_forecast_alerts_for_new_graph_data, generate_forecast_alerts_for_new_forecast

from django.core.serializers import serialize


@receiver(post_save, sender=GraphData)
def handle_new_graph_data(sender, instance,created, **kwargs):
    if(instance.index == "ndvi"):
        # if created:
        generate_pattern_alerts_for_new_graph_data(graph_data_instance=instance, new_instance=created, pattern_type="default_pattern")
        generate_pattern_alerts_for_new_graph_data(graph_data_instance=instance, new_instance=created, pattern_type="auto_pattern")
        generate_forecast_alerts_for_new_graph_data(graph_data_instance=instance, new_instance=created)
        # else:
        #    generate_pattern_alerts_for_new_graph_data(graph_data_instance=instance, new_instance=False)
        #    generate_forecast_alerts_for_new_graph_data(graph_data_instance=instance, new_instance=False)
           


@receiver(post_save, sender=Pattern)
def handle_new_pattern(sender, instance,created, **kwargs):
    generate_pattern_alerts_for_new_pattern(pattern_instance=instance)
    

@receiver(post_save, sender=PatternSelf)
def handle_new_pattern(sender, instance,created, **kwargs):
    generate_self_pattern_alerts_for_new_pattern(pattern_instance=instance)
    
    

@receiver(post_save, sender=IndexForecast)
def handle_new_forecast(sender, instance,created, **kwargs):
    generate_forecast_alerts_for_new_forecast(forecast_instance=instance)