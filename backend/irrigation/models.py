from django.db import models

from django_extensions.db.models import (
    TimeStampedModel,
)

from utils.model_abstracts import Model


from django.utils import timezone
from django.contrib.gis.db import models as gis_models
from mesurements.models import Task


class IrrigationCalendarRequest(TimeStampedModel, Model):
    
    # project = models.ForeignKey("Project", on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    plot_central_point = gis_models.PointField()
    
    foliage_diameter = models.FloatField(default=0, null=True, blank=True)
    source_rate_l_second = models.FloatField(default=0, null=True, blank=True)
    dripper_rate_liter_hour = models.FloatField(default=0, null=True, blank=True)
    number_drippers_plant = models.IntegerField(default=0, null=True, blank=True)
    inter_line = models.FloatField(default=0, null=True, blank=True)
    intra_line = models.FloatField(default=0, null=True, blank=True)
    
    feature_granted = models.BooleanField(default=False)

    # efficiency = models.IntegerField(default=0, null=True, blank=True)
    # variety = models.ForeignKey("Variety", on_delete=models.CASCADE, null=True)
    # ForeignKey("Density", on_delete=models.CASCADE, null=True)

    # culture = models.ForeignKey("Culture", on_delete=models.CASCADE, null=True)
    # texture = models.ForeignKey("Texture", on_delete=models.CASCADE, null=True)
    # irrigation = models.ForeignKey("Irrigation", on_delete=models.CASCADE, null=True)
    

class IrrigationCalendarData(TimeStampedModel, Model):
    
    # project = models.ForeignKey("Project", on_delete=models.CASCADE)
    # task = models.ForeignKey(Task, on_delete=models.CASCADE)
    calendar_request = models.ForeignKey(IrrigationCalendarRequest, on_delete=models.CASCADE)
    calendar_year = models.IntegerField(default=0, null=True, blank=True)
    raw_data = models.TextField()
    display_data = models.TextField()
    approved = models.BooleanField(default=False)
    
    
    # plot_central_point = gis_models.PointField()
    
    # foliage_diameter = models.IntegerField(default=0, null=True, blank=True)
    # source_rate_l_second = models.IntegerField(default=0, null=True, blank=True)
    # dripper_rate_liter_hour = models.IntegerField(default=0, null=True, blank=True)
    # number_drippers_plant = models.IntegerField(default=0, null=True, blank=True)
    # featureGranted = models.BooleanField(default=False)from django.db import models