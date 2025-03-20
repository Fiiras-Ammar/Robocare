from django.core.exceptions import ValidationError
from django_extensions.db.models import (
    TimeStampedModel,
    ActivatorModel,
    TitleDescriptionModel,
)
from django.utils import timezone
from django.db import models
from django.contrib.gis.db import models as gis_models
from django.contrib.auth import get_user_model
from utils.model_abstracts import Model
from django.db.models import Manager as GeoManager
from django.core.validators import FileExtensionValidator
from django.core.files.storage import default_storage
import os
from django.conf import settings
from django.core.files.storage import default_storage
import logging
from .utils import file_cleanup
from django.db.models.signals import post_delete

logger = logging.getLogger(__name__)
User = get_user_model()


class Project(TimeStampedModel, Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project_name = models.CharField(max_length=30, null=False, blank=False)
    nbr_field = models.IntegerField(default=0)
    surface = models.DecimalField(default=0.0, max_digits=30, decimal_places=3)


def task_image_upload_path(instance, filename):
    # Construct the upload path based on the task ID
    upload_path = f"covers/{filename}"

    # Use the default storage to get the full path
    full_path = default_storage.path(upload_path)

    # If the file already exists, delete it before saving the new one
    if default_storage.exists(upload_path):
        default_storage.delete(upload_path)

    return upload_path


def task_image_sidebar_upload_path(instance, filename):
    # Construct the upload path based on the task ID
    upload_path = f"covers/{filename}"

    # Use the default storage to get the full path
    full_path = default_storage.path(upload_path)

    # If the file already exists, delete it before saving the new one
    if default_storage.exists(upload_path):
        default_storage.delete(upload_path)

    return upload_path


class Task(TimeStampedModel, Model):
    project = models.ForeignKey("Project", on_delete=models.CASCADE)
    area_of_interest = gis_models.PolygonField()
    task_name = models.CharField(
        max_length=30, null=False, blank=False, default=None)

    plantation_date = models.DateField(null=True, blank=True)

    intensification_date = models.DateField(null=True, blank=True)

    age = models.CharField(max_length=30, blank=True, default="")

    surface = models.DecimalField(default=0.0, max_digits=30, decimal_places=3)
    nbTree = models.IntegerField(default=0,null=True, blank=True)
    nbTreesPerHectare = models.IntegerField(default=0,null=True, blank=True)
    salinity = models.CharField(
        max_length=30, blank=False, default="Low (0-2)", null=True
    )

    efficiency = models.IntegerField(default=0, null=True, blank=True)

    variety = models.ForeignKey("Variety", on_delete=models.CASCADE, null=True)

    density = models.ForeignKey("Density", on_delete=models.CASCADE, null=True)

    culture = models.ForeignKey("Culture", on_delete=models.CASCADE, null=True)
    texture = models.ForeignKey("Texture", on_delete=models.CASCADE, null=True)
    irrigation = models.ForeignKey("Irrigation", on_delete=models.CASCADE, null=True)

    # added fields
    # inter_line = models.IntegerField(null=True, blank=True)
    # intra_line = models.IntegerField(null=True, blank=True)
    # densityPPH = models.IntegerField(null=True, blank=True)
    # plantation_date = models.DateField(null=True, blank=True)

    # intensification_date = models.DateField(null=True, blank=True)
    # ""

    objects = GeoManager()
    image = models.FileField(
        upload_to=task_image_upload_path, null=True, blank=True)
    image_sidebar = models.FileField(
        upload_to=task_image_sidebar_upload_path, null=True, blank=True
    )
    country_fr = models.CharField(max_length=100, blank=True, null=True)
    state_fr = models.CharField(max_length=100, blank=True, null=True)
    state_district_fr = models.CharField(max_length=100, blank=True, null=True)
    county_fr = models.CharField(max_length=100, blank=True, null=True)
    postcode_fr = models.CharField(max_length=100, blank=True, null=True)
    country_ar = models.CharField(max_length=100, blank=True, null=True)
    state_ar = models.CharField(max_length=100, blank=True, null=True)
    state_district_ar = models.CharField(max_length=100, blank=True, null=True)
    county_ar = models.CharField(max_length=100, blank=True, null=True)
    postcode_ar = models.CharField(max_length=100, blank=True, null=True)
    intensification_variety = models.ForeignKey("Variety", on_delete=models.CASCADE, null=True, blank=True, related_name="intensification_variety")
    intensification_culture = models.ForeignKey("Culture", on_delete=models.CASCADE, null=True, blank=True, related_name="intensification_culture")
    intensification_density = models.ForeignKey("Density", on_delete=models.CASCADE, null=True, blank=True, related_name="intensification_density")


def task_image_date_upload_path(instance, filename):
    # Construct the upload path based on the task ID
    return f"task_images/{instance.task_id}/{filename}"


def request_high_resolution_file_path(instance, filename):
    subscription = instance.subscription

    # Access the parent Task
    task = subscription.task

    # Create a custom file name by concatenating task_name and date_of_request
    custom_filename = (
        f"{task.task_name}-{instance.date_of_request.strftime('%Y-%m-%d')}.pdf"
    )

    # Construct the upload path based on the task ID
    return f"high_resolution_files/{task.id}/{custom_filename}"


def request_pdf_report_file_path(instance, filename):
    # Create a custom file name by concatenating task_name and date_of_request
    custom_filename = f"{instance.name}-{timezone.now().strftime('%Y-%m-%d')}.pdf"

    # Construct the upload path based on the task ID
    return f"pdf_report_files/{instance.user.id}/{custom_filename}"


class TaskImage(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    date = models.DateTimeField(default=None, null=True)
    image = models.FileField(upload_to=task_image_date_upload_path)
    provider = models.CharField(
        max_length=5, null=True, blank=True, default=None)
    cloud_percentage = models.CharField(
        max_length=10, null=True, blank=True, default=None
    )

    def save(self, *args, **kwargs):
        # Check if another TaskImage with the same task and date already exists
        if TaskImage.objects.filter(task=self.task, date=self.date).exists():
            return

        # Call the super method to save the object
        super(TaskImage, self).save(*args, **kwargs)


# Connect post_delete signal
post_delete.connect(
    file_cleanup, sender=TaskImage, dispatch_uid="taskimage.file_cleanup"
)


class Sensor(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    url = models.CharField(max_length=150, null=False,
                           blank=False, default=None)
    sensor_name = models.CharField(
        max_length=30, null=False, blank=False, default=None)


class SensorData(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    time = models.DateTimeField()
    charge = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )
    day_num = models.IntegerField()
    temperature = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )
    humidity = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )
    pressure = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )
    altitude = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )
    adc = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True)
    ts = models.DecimalField(default=None, max_digits=30,
                             decimal_places=5, null=True)
    mv1 = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True)
    mv2 = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True)
    mv3 = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True)
    et0 = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True)
    rain = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True)
    radiation = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )

class CultureCategories(TimeStampedModel, Model):
    name_en = models.CharField(max_length=50, null=False, blank=False)
    name_fr = models.CharField(max_length=50, null=False, blank=False)
    name_ar = models.CharField(max_length=50, null=False, blank=False)

class Culture(TimeStampedModel, Model):
    name_en = models.CharField(max_length=50, null=False, blank=False)
    name_fr = models.CharField(max_length=50, null=False, blank=False)
    name_ar = models.CharField(max_length=50, null=False, blank=False)
    categorie = models.ForeignKey(CultureCategories, on_delete=models.CASCADE, null=True, blank=True)


class Texture(TimeStampedModel, Model):
    name_en = models.CharField(max_length=50, null=False, blank=False)
    name_fr = models.CharField(max_length=50, null=False, blank=False)
    name_ar = models.CharField(max_length=50, null=False, blank=False)


class Irrigation(TimeStampedModel, Model):
    name_en = models.CharField(max_length=50, null=False, blank=False)
    name_fr = models.CharField(max_length=50, null=False, blank=False)
    name_ar = models.CharField(max_length=50, null=False, blank=False)


class Variety(TimeStampedModel, Model):
    culture = models.ForeignKey("Culture", on_delete=models.CASCADE)
    name_en = models.CharField(max_length=50, null=False, blank=False)
    name_fr = models.CharField(max_length=50, null=False, blank=False)
    name_ar = models.CharField(max_length=50, null=False, blank=False)


class Density(TimeStampedModel, Model):
    culture = models.ForeignKey("Culture", on_delete=models.CASCADE)
    name_en = models.CharField(max_length=50, null=False, blank=False)
    name_fr = models.CharField(max_length=50, null=False, blank=False)
    name_ar = models.CharField(max_length=50, null=False, blank=False)

    inter_line = models.FloatField(default=None, null=True, blank=True)
    intra_line = models.FloatField(default=None, null=True, blank=True)

    seeding_kg_per_hectare = models.FloatField(
        default=None, null=True, blank=True)

    ndvi_min = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )
    ndvi_max = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )
    ndre_min = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )
    ndre_max = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )
    ndwi_min = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )
    ndwi_max = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )
    gci_min = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )
    gci_max = models.DecimalField(
        default=None, max_digits=30, decimal_places=5, null=True
    )


class Subscription(TimeStampedModel, Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    date_of_request = models.DateField()
    subscription = models.IntegerField(default=0)


class HighResolutionRequest(TimeStampedModel, Model):
    subscription = models.ForeignKey("Subscription", on_delete=models.CASCADE)
    date_of_request = models.DateField()
    file = models.FileField(
        upload_to=request_high_resolution_file_path,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["pdf"])],
    )

    def delete(self, *args, **kwargs):
        # Delete the associated file from storage
        if self.file:
            default_storage.delete(self.file.name)
        super(HighResolutionRequest, self).delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        # Check if the file field has been cleared
        if self.pk is not None:
            try:
                old_instance = HighResolutionRequest.objects.get(pk=self.pk)
                if old_instance.file and not self.file:
                    # The file field has been cleared, delete the associated file
                    default_storage.delete(old_instance.file.name)
            except HighResolutionRequest.DoesNotExist:
                pass

        super(HighResolutionRequest, self).save(*args, **kwargs)


class Note(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    datasheet = models.JSONField()
    label = models.CharField(max_length=50, null=False, blank=False)


class PlantCount(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    region_count = models.JSONField(default=dict, blank=True, null=True)
    local_index = models.JSONField(default=dict, blank=True, null=True)


class PdfReport(TimeStampedModel, Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=50, null=False, blank=False)

    file = models.FileField(
        upload_to=request_pdf_report_file_path,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["pdf"])],
    )

    def delete(self, *args, **kwargs):
        # Delete the associated file from storage
        if self.file:
            default_storage.delete(self.file.name)
        super(PdfReport, self).delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        # Check if the file field has been cleared
        if self.pk is not None:
            try:
                old_instance = PdfReport.objects.get(pk=self.pk)
                if old_instance.file and not self.file:
                    # The file field has been cleared, delete the associated file
                    default_storage.delete(old_instance.file.name)
            except PdfReport.DoesNotExist:
                pass

        super(PdfReport, self).save(*args, **kwargs)


class FertilisationProduct(TimeStampedModel, Model):
    name = models.CharField(max_length=30, blank=False, default="", null=True)


class Disease(TimeStampedModel, Model):
    name = models.CharField(max_length=30, blank=False, default="", null=True)


class DiseaseActor(TimeStampedModel, Model):
    name = models.CharField(max_length=30, blank=False, default="", null=True)
    disease = models.ForeignKey("Disease", on_delete=models.CASCADE)


class ProductType(TimeStampedModel, Model):
    name = models.CharField(max_length=30, blank=False, default="", null=True)


class Product(TimeStampedModel, Model):
    name = models.CharField(max_length=30, blank=False, default="", null=True)
    productType = models.ForeignKey("ProductType", on_delete=models.CASCADE)


class StadesPhenologique(TimeStampedModel, Model):
    name = models.CharField(max_length=255, blank=False, default="", null=True)
    month = models.IntegerField(default=1, null=True, blank=True)


class Event(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    # to separate different types of events ['Irrigation', 'Fertilisation', 'Traitement', ... ]
    type = models.CharField(max_length=30, blank=False, default="", null=True)

    # Irrigation
    dose = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=3, null=True)
    open_hour = models.DateTimeField(default=None, null=True)
    close_hour = models.DateTimeField(default=None, null=True)

    # Fertilisation
    product = models.ForeignKey("Product", on_delete=models.CASCADE, null=True)
    fertilisationproduct = models.ForeignKey(
        "FertilisationProduct", on_delete=models.CASCADE, null=True
    )
    producttype = models.ForeignKey(
        "ProductType", on_delete=models.CASCADE, null=True)
    duration = models.DecimalField(
        default=0.0, max_digits=255, decimal_places=3, null=True
    )
    # period = models.CharField(max_length=255, blank=True, default="", null=True)
    stade = models.ForeignKey("StadesPhenologique",
                              on_delete=models.CASCADE, null=True)

    passes_count = models.IntegerField(default=0, null=True, blank=True)

    mode = models.CharField(max_length=255, blank=True, default="", null=True)
    # dose as predefined one
    # two dates as predefined ones

    # Traitement
    disease = models.ForeignKey("Disease", on_delete=models.CASCADE, null=True)
    disease_actor = models.ForeignKey(
        "DiseaseActor", on_delete=models.CASCADE, null=True
    )
    # treatment = models.CharField(max_length=30, blank=True, default="", null=True)
    # two dates as predefined ones
    # product as predefined one
    unit = models.CharField(max_length=255, blank=True, default="", null=True)

    # Pratiques
    size = models.CharField(max_length=255, blank=True, default="", null=True)
    quantity = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=3, null=True
    )
    # two dates as predefined ones
    # the other field as 'mode' field

    # Recolte
    variety = models.ForeignKey("Variety", on_delete=models.CASCADE, null=True)
    # variety type as 'mode' field ['tardive', 'precoce']
    # two dates as predefined ones
    # rendement as 'quantity' field

    # Visit field
    field_visit = models.ForeignKey(
        "FieldVisit", on_delete=models.CASCADE, null=True, blank=True, )
    anomaly = models.ForeignKey(
        "Anomaly", on_delete=models.CASCADE, null=True, blank=True, )
    isDone = models.BooleanField(default=True)


class GraphData(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    index = models.CharField(max_length=30, blank=True, default="", null=True)
    data = models.JSONField(default=dict, blank=True, null=True)
    data_smoothed = models.JSONField(default=dict, blank=True, null=True)
    min = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=3, null=True)
    max = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=3, null=True)


class UserHistory(TimeStampedModel, Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date_of_request = models.DateTimeField(default=None, null=True)
    label = models.CharField(max_length=120, null=False, blank=False)
    request_from = models.CharField(max_length=256, null=False, blank=False)
    request_call = models.CharField(max_length=256, null=False, blank=False)
    description = models.CharField(max_length=256, null=False, blank=False)
    duration = models.IntegerField(default=0)


class DataForecast(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    params = models.JSONField(default=dict, blank=True, null=True)
    season_months = models.IntegerField(default=6, null=True, blank=True)
    data_predict = models.JSONField(default=dict, blank=True, null=True)
    data_predict_fortnite = models.JSONField(
        default=dict, blank=True, null=True)
    index = models.CharField(max_length=30, blank=True, default="", null=True)

    class Meta:
        unique_together = [["task", "index"]]


class IndexForecast(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    neural_meta_predict = models.JSONField(default=dict, blank=True, null=True)
    index = models.CharField(max_length=30, blank=True, default="", null=True)

    class Meta:
        unique_together = [["task", "index"]]


class AlertPredict(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    index = models.CharField(max_length=30, blank=True, default="", null=True)
    date = models.DateTimeField(default=None, null=True)
    state = models.BooleanField(default=False)
    abs_difference = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=3, null=True
    )

    class Meta:
        unique_together = [["task", "date"]]


# class AlertType(Model):
#     name = models.CharField(max_length=50, unique=True)
#     index = models.CharField(max_length=30, blank=True, default="", null=True)

#     description = models.TextField(blank=True, null=True)


class Pattern(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    density = models.ForeignKey("Density", on_delete=models.CASCADE, null=True)
    variety = models.ForeignKey("Variety", on_delete=models.CASCADE, null=True)

    startdate = models.DateTimeField(default=None, null=True)
    enddate = models.DateTimeField(default=None, null=True)


class Alert(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    time = models.DateTimeField(default=None, null=True)
    viewed = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)


class PatternAlert(Alert):
    context = models.ForeignKey(Pattern, on_delete=models.CASCADE, default="")
    index = models.CharField(max_length=30, blank=True, default="", null=True)
    measured_value = models.DecimalField(default=0.0, max_digits=30, decimal_places=4, null=True)
    reference_value = models.DecimalField(default=0.0, max_digits=30, decimal_places=4, null=True)
    difference = models.DecimalField(default=0.0, max_digits=30, decimal_places=4, null=True)


class ForecastAlert(Alert):
    context = models.ForeignKey(IndexForecast, on_delete=models.CASCADE, default="")
    index = models.CharField(max_length=30, blank=True, default="", null=True)
    measured_value = models.DecimalField(default=0.0, max_digits=30, decimal_places=4, null=True)
    reference_value = models.DecimalField(default=0.0, max_digits=30, decimal_places=4, null=True)
    difference = models.DecimalField(default=0.0, max_digits=30, decimal_places=4, null=True)


class SensorHumidityAlert(Alert):
    context = models.ForeignKey(SensorData, on_delete=models.CASCADE, default="")
    index = models.CharField(max_length=30, blank=True, default="", null=True)
    measured_value = models.DecimalField(default=0.0, max_digits=30, decimal_places=4, null=True)
    reference_value = models.DecimalField(default=0.0, max_digits=30, decimal_places=4, null=True)
    difference = models.DecimalField(default=0.0, max_digits=30, decimal_places=4, null=True)


class SensorBatteryLevelAlert(Alert):
    context = models.ForeignKey(SensorData, on_delete=models.CASCADE, default="")
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, default="")
    index = models.CharField(max_length=30, blank=True, default="", null=True)
    level = models.DecimalField(default=0.0, max_digits=30, decimal_places=4, null=True)
    is_critical = models.BooleanField(default=False)
    last_updated = models.DateTimeField(auto_now=True)  # Automatically updates to the current timestamp

    def update_alert(self, battery_level):
        self.level = battery_level
        self.is_critical = battery_level <= 20
        self.save()


class ForecastYearsParams(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    bestYear = models.CharField(
        max_length=30, blank=True, default="", null=True)
    BadYears = models.JSONField(default=dict, blank=True, null=True)


def task_tif_upload_path(instance, filename):
    # Construct the upload path based on the task ID
    task = instance.task
    upload_path = f"tasks/tiff/{task.id}/{instance.date}/{instance.date}.tif"

    # Use the default storage to get the full path
    full_path = default_storage.path(upload_path)

    # If the file already exists, delete it before saving the new one
    if default_storage.exists(upload_path):
        default_storage.delete(upload_path)

    return upload_path


def task_shapefile_upload_path(instance, filename):
    # Construct the upload path based on the task ID
    task = instance.task
    upload_path = f"tasks/tiff/{task.id}/{instance.date}/{instance.date}.shp"

    # Use the default storage to get the full path
    full_path = default_storage.path(upload_path)

    # If the file already exists, delete it before saving the new one
    if default_storage.exists(upload_path):
        default_storage.delete(upload_path)

    return upload_path


class Histogram(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    date = models.DateField()
    provider = models.CharField(
        max_length=30, blank=True, default="", null=True)
    tif_file = models.FileField(
        upload_to=task_tif_upload_path, null=True, blank=True)
    shapefile_file = models.FileField(
        upload_to=task_shapefile_upload_path, null=True, blank=True)

    class Meta:
        unique_together = [["task", "date"]]
        


def terrain_tif_upload_path(instance, filename):
    task = instance.task
    upload_path = f"tasks/terrain_model/{task.id}/{instance.type}.tif"

    full_path = default_storage.path(upload_path)

    if default_storage.exists(upload_path):
        default_storage.delete(upload_path)

    return upload_path

class TerrainModel(TimeStampedModel, Model):
    TYPE_CHOICES = [
        ('DTM', 'Digital Terrain Model'),
        ('DSM', 'Digital Surface Model'),
        ('DEM', 'Digital Elevation Model'),
    ]

    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    provider = models.CharField(max_length=30, blank=True, default="", null=True)
    type = models.CharField(max_length=3, choices=TYPE_CHOICES)
    resolution = models.FloatField(help_text="Resolution in meters")
    date_acquired = models.DateField(null=True, blank=True)
    tif_file = models.FileField(upload_to=terrain_tif_upload_path, null=True, blank=True)
    
    min = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=9, null=True)
    max = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=9, null=True)
    class Meta:
        unique_together = [["task", "type", "provider", "resolution"]]

def task_tif_index_upload_path(instance, filename):
    # Construct the upload path based on the task ID
    task = instance.histogram.task
    upload_path = f"tasks/tiff/{task.id}/{instance.histogram.date}/index/{instance.index}.tif"

    # Use the default storage to get the full path
    full_path = default_storage.path(upload_path)

    # If the file already exists, delete it before saving the new one
    if default_storage.exists(upload_path):
        default_storage.delete(upload_path)

    return upload_path


class HistogramBins(TimeStampedModel, Model):
    histogram = models.ForeignKey("Histogram", on_delete=models.CASCADE)
    index = models.CharField(max_length=30, blank=True, default="", null=True)
    bins = models.JSONField(default=dict, blank=True, null=True)
    bins_static = models.JSONField(default=dict, blank=True, null=True)
    bins_values = models.JSONField(default=dict, blank=True, null=True)
    bins_values_static = models.JSONField(default=dict, blank=True, null=True)
    percentile = models.JSONField(default=dict, blank=True, null=True)
    tif_file = models.FileField(
        upload_to=task_tif_index_upload_path, null=True, blank=True)
    min = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=9, null=True)
    max = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=9, null=True)

    class Meta:
        unique_together = [["histogram", "index"]]

def task_index_diff_tif_upload_path(instance, filename):
    # Construct the upload path based on the task ID
    task = instance.first_index.histogram.task
    upload_path = f"tasks/tiff/{task.id}/index_difference/{instance.index}/{instance.index}_{instance.date1}_{instance.date2}_difference.tif"
    
    
    # Use the default storage to get the full path
    full_path = default_storage.path(upload_path)

    # If the file already exists, delete it before saving the new one
    if default_storage.exists(upload_path):
        default_storage.delete(upload_path)

    return upload_path

class IndexDifference(TimeStampedModel, Model):
    
    date1 = models.DateField()
    date2 = models.DateField()
    
    first_index = models.ForeignKey(HistogramBins, on_delete=models.CASCADE, related_name="first_date_index")
    second_index = models.ForeignKey(HistogramBins, on_delete=models.CASCADE, related_name="second_date_index")
    
    index = models.CharField(max_length=30, blank=True, default="", null=True)
    
    tif_file = models.FileField(
        upload_to=task_index_diff_tif_upload_path, max_length=400, null=True, blank=True)
    
    min = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=9, null=True)
    max = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=9, null=True)

    class Meta:
        unique_together = [["first_index","second_index", "index"]]
        
        
class FieldVisit(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    notes = models.TextField(blank=True, null=True)


class VisitFile(TimeStampedModel, Model):
    field_visit = models.ForeignKey("FieldVisit", on_delete=models.CASCADE)
    file = models.FileField(upload_to='visit_files/')


def visit_files(filename):
    upload_path = f"covers/{filename}"
    if default_storage.exists(upload_path):
        default_storage.delete(upload_path)
    return upload_path


class Quote(Model, TimeStampedModel):
    email = models.EmailField(max_length=255)
    firstname = models.CharField(max_length=255)
    lastname = models.CharField(max_length=255)
    company = models.CharField(max_length=255, null=True, default=None)
    phone = models.CharField(max_length=20, blank=True, default=None)
    nb_hectares = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=2)
    demo_account = models.BooleanField(default=True)


class HistogramStatic(Model, TimeStampedModel):
    density = models.ForeignKey("Density", on_delete=models.CASCADE, null=True)
    index = models.CharField(max_length=30, blank=True, default="", null=True)
    min = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=9, null=True)
    max = models.DecimalField(
        default=0.0, max_digits=30, decimal_places=9, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['index', 'density'], name='unique_task_index_density')
        ]

    def __str__(self):
        return f"{self.index} - {self.density_id}"


class AnomalyType(TimeStampedModel, Model):
    anomaly_type = models.CharField(max_length=150, null=False, blank=False, default=None)


class Anomaly(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    notes = models.TextField(blank=True, null=True)
    anomaly_type = models.ForeignKey("AnomalyType", on_delete=models.CASCADE)


class AnomalyFile(TimeStampedModel, Model):
    anomaly = models.ForeignKey("Anomaly", on_delete=models.CASCADE)
    file = models.FileField(upload_to='anomaly_files/')


def anomaly_files(filename):
    upload_path = f"covers/{filename}"
    if default_storage.exists(upload_path):
        default_storage.delete(upload_path)
    return upload_path


class PatternSelf(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    startdate = models.DateTimeField(default=None, null=True)
    enddate = models.DateTimeField(default=None, null=True)


class PatternSelfAlert(Alert):
    context = models.ForeignKey(PatternSelf, on_delete=models.CASCADE, default="")
    index = models.CharField(max_length=30, blank=True, default="", null=True)
    measured_value = models.DecimalField(default=0.0, max_digits=30, decimal_places=4, null=True)
    reference_value = models.DecimalField(default=0.0, max_digits=30, decimal_places=4, null=True)
    difference = models.DecimalField(default=0.0, max_digits=30, decimal_places=4, null=True)


class TaskReferenceComparison(Model, TimeStampedModel):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    culture = models.ForeignKey("Culture", on_delete=models.CASCADE, null=True)
    density = models.ForeignKey("Density", on_delete=models.CASCADE, null=True)
    variety = models.ForeignKey("Variety", on_delete=models.CASCADE, null=True)
    startage = models.IntegerField(default=0, null=True)
    endage = models.IntegerField(default=1, null=True)

def request_pdf_invoice_file_path(instance, filename):
    custom_filename = f"{instance.name}-{timezone.now().strftime('%Y-%m-%d')}.pdf"
    return f"pdf_invoice_files/{instance.user.id}/{custom_filename}"


class PdfInvoice(TimeStampedModel, Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=50, null=False, blank=False)
    startDate = models.DateTimeField(max_length=50, null=True, blank=False)
    endDate = models.DateTimeField(max_length=50, null=True, blank=False)

    file = models.FileField(
        upload_to=request_pdf_invoice_file_path,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["pdf"])],
    )

    def delete(self, *args, **kwargs):
        if self.file:
            default_storage.delete(self.file.name)
        super(PdfInvoice, self).delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        if self.pk is not None:
            try:
                old_instance = PdfInvoice.objects.get(pk=self.pk)
                if old_instance.file and not self.file:
                    default_storage.delete(old_instance.file.name)
            except PdfInvoice.DoesNotExist:
                pass

        super(PdfInvoice, self).save(*args, **kwargs)

class ShowNotificationsTask(TimeStampedModel, Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE)
    showForcastNotification = models.BooleanField(default=True)
    showPatternNotification = models.BooleanField(default=True)
    showAutoPatternNotification = models.BooleanField(default=True)
    showSoilHumidityNotification = models.BooleanField(default=True)

