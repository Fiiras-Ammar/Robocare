from django.contrib import admin
from django.contrib.gis import admin as gis_admin
from django.http import HttpResponse
from .models import (
    Project,
    Task,
    Sensor,
    Culture,
    Texture,
    Irrigation,
    TaskImage,
    Variety,
    Density,
    Subscription,
    HighResolutionRequest,
    PlantCount,
    SensorData,
    PdfReport,
    Product,
    ProductType,
    Disease,
    DiseaseActor,
    FertilisationProduct,
    GraphData,
    StadesPhenologique,
    DataForecast,
    AlertPredict,
    ForecastYearsParams,
    Event,
    Quote,
    Alert,
    PatternAlert,
    SensorHumidityAlert,
    SensorBatteryLevelAlert,
    Pattern,
    Histogram,
    HistogramBins,
    HistogramStatic,
    ForecastAlert,
    IndexForecast,
    AnomalyType,
    PatternSelf,
    PatternSelfAlert,
    TaskReferenceComparison,
    TerrainModel,
    PdfInvoice,
    IndexDifference, ShowNotificationsTask, CultureCategories,
)
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.measure import Distance
from django.contrib.gis.forms import OSMWidget


from django.contrib.gis.geos import Polygon, MultiPolygon
from .forms import (
    DensityForm,
    TaskyForm,
    VarietyForm,
    SubscriptionForm,
    PlantCountForm,
    PdfReportForm,
    ProductForm,
    ProductTypeForm,
    DiseaseForm,
    DiseaseActorForm,
    FertilisationProductActorForm,
    GraphDataForm,
    DataForecastForm,
    AlertPredictForm,
    ForecastYearsParamsForm,
    HistogramStaticForm,
    PdfInvoiceForm, TaskReferenceComparisonForm, ShowNotificationsTaskyForm, CultureForm
)

from import_export.admin import ImportExportModelAdmin
from import_export import resources, fields
from import_export.widgets import DateTimeWidget
from django.utils import timezone
from datetime import datetime
from import_export import widgets
import pandas as pd
from .filters import CultureNameFilter, DensityNameFilter, VarietyNameFilter


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_per_page = 1000000

    # Customize the fields to display in the admin list view
    list_display = ("project_name", "user", "nbr_field", "surface")


@admin.register(Task)
class TaskAdmin(gis_admin.OSMGeoAdmin):
    form = TaskyForm
    list_per_page = 1000000

    def project_label(self, obj):
        return obj.project.project_name if obj.project else None
    project_label.short_description = "Project"

    def user_email(self, obj):
        return obj.project.user.email if obj.project and obj.project.user else None
    user_email.short_description = "User Email"
    user_email.admin_order_field = 'project__user__email'

    def project_id(self, obj):
        return obj.project.id if obj.project else None
    project_id.short_description = "Project ID"

    def density_id(self, obj):
        return obj.density.id if obj.density else None
    density_id.short_description = "Density ID"

    def density_name(self, obj):
        return obj.density.name_en if obj.density else None
    density_name.short_description = "Density Name"

    def culture_name(self, obj):
        return obj.culture.name_en if obj.culture else None
    culture_name.short_description = "Culture Name"

    def variety_name(self, obj):
        return obj.variety.name_en if obj.variety else None
    variety_name.short_description = "Variety Name"
    
    def reference_name(self, obj):
        reference = TaskReferenceComparison.objects.filter(culture=obj.culture,variety=obj.variety,
                    density=obj.density).first()
        if(reference):
            return reference.task.task_name
        
    
    def reference_id(self, obj):
        reference = TaskReferenceComparison.objects.filter(culture=obj.culture,variety=obj.variety,
                    density=obj.density).first()
        if(reference):
            return reference.id
    

    def intensification_variety_name(self, obj):
        return obj.intensification_variety.name_en if obj.intensification_variety else None
    intensification_variety_name.short_description = "Intensification Variety"
    intensification_variety_name.admin_order_field = 'intensification_variety__name_en'

    def intensification_culture_name(self, obj):
        return obj.intensification_culture.name_en if obj.intensification_culture else None
    intensification_culture_name.short_description = "Intensification Culture"
    intensification_culture_name.admin_order_field = 'intensification_culture__name_en'

    def intensification_density_name(self, obj):
        return obj.intensification_density.name_en if obj.intensification_density else None
    intensification_density_name.short_description = "Intensification Density"
    intensification_density_name.admin_order_field = 'intensification_density__name_en'
    list_display = (
        "id",
        "task_name",
        "project_label",
        "density_name",
        "culture_name",
        "variety_name",
        "surface",
        "nbTree",
        "nbTreesPerHectare",
        "reference_name",
        "reference_id",
        "density",
        "density_id",
        "project_id",
        "user_email",
        "intensification_variety_name",
        "intensification_culture_name",
        "intensification_density_name",
        "created",
        "modified",
    )

    list_filter = (
        "project",
        "id",
        "culture",
        "density",
        "variety",
        "intensification_variety",
        "intensification_culture",
        "intensification_density",
        ("project__user__email", admin.AllValuesFieldListFilter),
    )


    search_fields = (
        "task_name",
        "id",
        "project__id",
        "project__project_name",
        "project__user__email",  # Ajout de la recherche par email
        "density__id",
        "density__name_en",
        "culture__name_en",
        "variety__name_en",
        "intensification_variety__name_en",
        "intensification_culture__name_en",
        "intensification_density__name_en",
    )

    def get_search_results(self, request, queryset, search_term):
        queryset, use_distinct = super().get_search_results(request, queryset, search_term)

        try:
            search_term_as_int = int(search_term)
            queryset |= self.model.objects.filter(
                Q(id=search_term_as_int) |
                Q(project__id=search_term_as_int) |
                Q(density__id=search_term_as_int) |
                Q(intensification_variety__id=search_term_as_int) |
                Q(intensification_density__id=search_term_as_int) |
                Q(intensification_culture__id=search_term_as_int)
            )
        except ValueError:
            pass

        return queryset, use_distinct
    actions = ['export_to_excel']
    
    def export_to_excel(self, request, queryset):
        data =[]
        # queryset.values("id","task_name",
        #                         "surface",
        #                         "nbTree","nbTreesPerHectare",
        #                         "plantation_date",
        #                         "age")
        
        for task in queryset:
            reference = TaskReferenceComparison.objects.filter(culture=task.culture,variety=task.variety,
                    density=task.density).first()
            
            data.append({
                "id": task.id,
                "task_name": task.task_name,
                "culture": task.culture.name_fr,
                "variety": task.variety.name_fr,
                "density": task.density.name_fr,
                "plantation_date": task.plantation_date,
                "age": task.age,
                "nbTree": task.nbTree,
                "nbTreesPerHectare": task.nbTree,
                "reference_task_name": reference.task.task_name,
                "reference_task_id": reference.task.id,
                "surface": task.surface,
            })
            
            
        df = pd.DataFrame(list(data))
        response = HttpResponse(content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['content-disposition'] = 'attachment; filename=tasks_references_list.xlsx'
        df.to_excel(response, index=False)
        
        return response

    export_to_excel.short_description = "Export selected products to Excel"
    
    
@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    # Customize the fields to display in the admin list view
    list_display = ("sensor_name", "task", "url")
    list_filter = ("task",)  # Add a filter sidebar for the 'project' field
    search_fields = ("sensor_name",)  # Enable searching by 'task_name' field
    raw_id_fields = ("task",)  # Add the 'task' field as a raw_id_field


@admin.register(Culture)
class CultureAdmin(admin.ModelAdmin):
    form = CultureForm

    def display_categorie(self, obj):
        return obj.categorie.name_fr if obj.categorie else "-"
    display_categorie.short_description = "Catégorie"

    list_display = ("id", "name_en", "name_fr", "name_ar", "display_categorie")
    list_filter = ("id",)
    search_fields = ("id", "name_en", "name_fr", "name_ar", "categorie__name_fr")

@admin.register(Texture)
class TextureAdmin(admin.ModelAdmin):
    # Customize the fields to display in the admin list view
    list_display = ("id", "name_en", "name_fr", "name_ar")
    list_filter = ("id",)  # Add a filter sidebar for the 'project' field
    # Enable searching by 'task_name' field
    search_fields = ("id", "name_en", "name_fr", "name_ar")


@admin.register(Irrigation)
class IrrigationAdmin(admin.ModelAdmin):
    # Customize the fields to display in the admin list view
    list_display = ("id", "name_en", "name_fr", "name_ar")
    list_filter = ("id",)  # Add a filter sidebar for the 'project' field
    # Enable searching by 'task_name' field
    search_fields = ("id", "name_en", "name_fr", "name_ar")


@admin.register(TaskImage)
class TaskImageAdmin(admin.ModelAdmin):
    # Customize the fields to display in the admin list view
    list_display = ("id", "task", "date", "image")
    list_filter = ("task",)  # Add a filter sidebar for the 'task' field
    search_fields = ("task__id", "date")


@admin.register(Variety)
class VarietyAdmin(admin.ModelAdmin):
    def culture_label(self, obj):
        return obj.culture.name_fr

    culture_label.short_description = "Culture"
    form = VarietyForm
    # Customize the fields to display in the admin list view
    list_display = (
        "id",
        "name_en",
        "name_fr",
        "name_ar",
        "culture_label",
    )
    list_filter = (
        "id",
        CultureNameFilter,
    )  # Add a filter sidebar for the 'project' field
    # Enable searching by 'task_name' field
    search_fields = ("id", "name_en", "name_fr", "name_ar")


@admin.register(Density)
class DensityAdmin(admin.ModelAdmin):
    def culture_label(self, obj):
        return obj.culture.name_fr

    def __str__(self):
        return self.name

    culture_label.short_description = "Culture"
    # autocomplete_fields = ['culture']
    form = DensityForm
    # Customize the fields to display in the admin list view
    list_display = (
        "id",
        "name_en",
        "name_fr",
        "name_ar",
        "culture_label",
        "ndvi_min",
        "ndvi_max",
        "ndre_min",
        "ndre_max",
        "ndwi_min",
        "ndwi_max",
        "gci_min",
        "gci_max","created", "modified"
    )
    list_filter = (
        "id",
        CultureNameFilter,
    )  # Add a filter sidebar for the 'project' field
    # Enable searching by 'task_name' field
    search_fields = ("id", "name_en", "name_fr", "name_ar")


@admin.register(PdfReport)
class PdfReportAdmin(admin.ModelAdmin):
    # autocomplete_fields = ['culture']
    form = PdfReportForm
    # Customize the fields to display in the admin list view
    list_display = ("id", "user", "name", "file", "created", "modified")
    list_filter = ("id",)  # Add a filter sidebar for the 'project' field
    # Enable searching by 'task_name' field
    search_fields = ("id", "user", "name")



class HighResolutionRequestInline(admin.TabularInline):
    model = HighResolutionRequest
    extra = 0
    list_select_related = ("subscription",)


class PdfReport(admin.TabularInline):
    model = PdfReport
    extra = 0
    list_select_related = ("user",)


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    def task_label(self, obj):
        return obj.task.task_name

    task_label.short_description = "Task"

    def user_label(self, obj):
        return obj.user.firstname + " " + obj.user.lastname

    user_label.short_description = "User"

    def formatted_created(self, obj):
        return obj.created.strftime("%b. %d, %Y")

    formatted_created.short_description = "Created"

    def formatted_modified(self, obj):
        return obj.modified.strftime("%b. %d, %Y")

    formatted_modified.short_description = "Modified"

    def get_subscription_display(self, obj):
        # Replace with actual values and their corresponding strings
        subscription_dict = {
            0: "On-Demand Requests",
            1: "Monthly Requests",
            2: "Weekly Requests",
        }
        # Default to "Unknown" for unrecognized values
        return subscription_dict.get(obj.subscription, "Unknown")

    get_subscription_display.short_description = "Subscription"
    # def culture_label(self, obj):
    #     return obj.culture.name_fr
    # culture_label.short_description = 'Culture'
    form = SubscriptionForm
    # Customize the fields to display in the admin list view
    list_display = (
        "id",
        "task_label",
        "user_label",
        "get_subscription_display",
        "date_of_request",
        "formatted_created",
        "formatted_modified",
    )
    # Add a filter sidebar for the 'project' field
    list_filter = ("id", "date_of_request")
    # Enable searching by 'task_name' field
    search_fields = ("id", "date_of_request", "subscription", "task_label")
    inlines = [HighResolutionRequestInline]


@admin.register(PlantCount)
class PlantCountAdmin(admin.ModelAdmin):
    form = PlantCountForm

    def task_label(self, obj):
        return obj.task.task_name

    task_label.short_description = "Task"
    # Customize the fields to display in the admin list view


class SensorDataResource(resources.ModelResource):
    # time = fields.Field(attribute='time', column_name='time',
    #                     widget=DateTimeWidget(format='%d/%m/%Y %H:%M'))
    time = fields.Field(
        attribute="time",
        column_name="time",
        widget=widgets.DateTimeWidget(format="%Y/%m/%d %H:%M:%S"),
    )

    def before_import_row(self, row, **kwargs):
        # Convert the datetime to timezone-aware before saving
        # Convert string to datetime using the desired format
        print(row)
        time_value = datetime.strptime(row["time"], "%Y/%m/%d %H:%M:%S")
        row["time"] = timezone.make_aware(time_value, timezone=timezone.utc)

    class Meta:
        model = SensorData
        # fields = ('created', 'modified', 'id', 'task', 'time', 'charge', 'day_num',	'temperature', 'humidity', 'pressure',
        #           'altitude', 'adc', 'ts', 'mv1', 'mv2', 'mv3', 'et0', 'rain', 'radiation')


@admin.register(SensorData)
class SensorDataAdmin(ImportExportModelAdmin):
    list_display = (
        "id",
        "task",
        "time",
        "charge",
        "day_num",
        "temperature",
        "humidity",
        "pressure",
        "altitude",
        "adc",
        "ts",
        "mv1",
        "mv2",
        "mv3",
        "et0",
        "rain",
        "radiation",
    )
    list_filter = ("task", "id")
    search_fields = ("task__id",)
    resource_class = SensorDataResource


@admin.register(Product)
class Product(admin.ModelAdmin):
    form = ProductForm
    list_display = ("id", "name", "created", "modified")
    list_filter = ("id",)
    search_fields = ("id", "name")


@admin.register(ProductType)
class ProductType(admin.ModelAdmin):
    form = ProductTypeForm
    list_display = ("id", "name", "created", "modified")
    list_filter = ("id",)
    search_fields = ("id", "name")


@admin.register(Disease)
class Disease(admin.ModelAdmin):
    form = DiseaseForm
    list_display = ("id", "name", "created", "modified")
    list_filter = ("id",)
    search_fields = ("id", "name")


@admin.register(DiseaseActor)
class DiseaseActor(admin.ModelAdmin):
    form = DiseaseActorForm
    list_display = ("id", "name", "created", "modified")
    list_filter = ("id",)
    search_fields = ("id", "user", "name")


@admin.register(FertilisationProduct)
class FertilisationProduct(admin.ModelAdmin):
    form = FertilisationProductActorForm
    list_display = ("id", "name", "created", "modified")
    list_filter = ("id",)
    search_fields = ("id", "name")


@admin.register(GraphData)
class GraphData(admin.ModelAdmin):
    def task_label(self, obj):
        return obj.task.task_name

    task_label.short_description = "Task"
    form = GraphDataForm
    list_display = (
        "id",
        "task_label",
        "index",
        "created",
        "modified",
    )
    list_filter = ("id",)
    search_fields = ("id", "index", "task__id")


@admin.register(StadesPhenologique)
class StadesPhenologique(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "month",
        "created",
        "modified",
    )
    list_filter = ("id",)
    search_fields = ("id", "name")


@admin.register(DataForecast)
class DataForecast(admin.ModelAdmin):
    def task_label(self, obj):
        return obj.task.task_name
    def task_id(self, obj):
        return obj.task.id

    task_label.short_description = "Task"
    form = DataForecastForm
    list_display = (
        "id",
        "task_id",
        "task_label",
        "params",
        "season_months",
        "index",
        "created",
        "modified",
    )
    list_filter = ("id",)
    search_fields = ("id", "task", "task_id")

@admin.register(IndexForecast)
class IndexForecast(admin.ModelAdmin):
    def task_label(self, obj):
        return obj.task.task_name
    def task_id(self, obj):
        return obj.task.id

    task_label.short_description = "Task"
    form = DataForecastForm
    list_display = (
        "id",
        "task_id",
        "neural_meta_predict",
        "created",
        "modified",
    )
    list_filter = ("id",)
    search_fields = ("id", "task", "task_id")


@admin.register(AlertPredict)
class AlertPredict(admin.ModelAdmin):
    def task_label(self, obj):
        return obj.task.task_name

    task_label.short_description = "Task"
    form = AlertPredictForm
    list_display = (
        "id",
        "task_label",
        "index",
        "date",
        "state",
        "created",
        "modified",
    )
    list_filter = ("id",)
    search_fields = ("id", "task")


# @admin.register(AlertType)
# class AlertType(admin.ModelAdmin):
#     list_display = (
#         "name",
#         "description",
#     )
#     list_filter = ("id",)
#     search_fields = ("id", "name")


@admin.register(PatternAlert)
class PatternAlert(admin.ModelAdmin):
    def task_label(self, obj):
        return obj.task.task_name
    task_label.short_description = "Task"

    # def type_label(self, obj):
    #     return obj.alerttype.name
    # type_label.short_description = "AlertType"

    list_display = (
        "id",
        "task_label",
        "time",
        "viewed",
        "difference",
    )
    list_filter = ("id",)
    search_fields = ("id", "name")


@admin.register(PatternSelfAlert)
class PatternSelfAlertAdmin(admin.ModelAdmin):
    def task_label(self, obj):
        return obj.task.task_name
    task_label.short_description = "Task"
    list_display = (
        "id",
        "task_label",
        "time",
        "viewed",
        "difference",
    )
    def get_search_results(self, request, queryset, search_term):
        try:
            task_id_list = [
                id.strip().strip("'\"")
                for id in search_term.strip('[]').split(',')
            ]

            queryset = queryset.filter(task__id__in=task_id_list)
            return queryset, True
        except Exception:
            return super().get_search_results(request, queryset, search_term)
    list_filter = ("id",)
    search_fields = ("id", "task__id")



@admin.register(SensorHumidityAlert)
class SensorHumidityAlert(admin.ModelAdmin):
    def task_label(self, obj):
        return obj.task.task_name
    task_label.short_description = "Task"

    list_display = (
        "id",
        "task_label",
        "time",
        "viewed",
        "difference",
    )
    list_filter = ("id",)
    search_fields = ("id", "name")
    
@admin.register(SensorBatteryLevelAlert)
class SensorBatteryLevelAlert(admin.ModelAdmin):
    def task_label(self, obj):
        return obj.task.task_name
    task_label.short_description = "Task"
    
    def sensor_label(self, obj):
        return obj.sensor.sensor_name
    task_label.short_description = "Sensor"

    list_display = (
        "id",
        "task_label",
        "sensor_label",
        "time",
        "is_critical",
        "viewed",
    )
    list_filter = ("id",)
    search_fields = ("id", "sensor_label")


from django.contrib import admin
from django.db.models import Q


@admin.register(ForecastAlert)
class ForecastAlertAdmin(admin.ModelAdmin):
    def task_label(self, obj):
        return obj.task.task_name

    task_label.short_description = "Task"

    list_display = (
        "id",
        "task_label",
        "time",
        "viewed",
        "difference",
    )

    def get_search_results(self, request, queryset, search_term):
        try:
            task_id_list = [
                id.strip().strip("'\"")
                for id in search_term.strip('[]').split(',')
            ]

            queryset = queryset.filter(task__id__in=task_id_list)
            return queryset, True
        except Exception:
            return super().get_search_results(request, queryset, search_term)

    list_filter = ("id",)
    search_fields = ("id", "task__id")


@admin.register(ForecastYearsParams)
class ForecastYearsParams(admin.ModelAdmin):
    def task_label(self, obj):
        return obj.task.task_name

    task_label.short_description = "Task"
    form = ForecastYearsParamsForm
    list_display = (
        "id",
        "task_label",
        "bestYear",
        "BadYears",
        "created",
        "modified",
    )
    list_filter = ("id",)
    search_fields = ("id", "task")
    
@admin.register(Pattern)
class Pattern(admin.ModelAdmin):
    def task_label(self, obj):
        return obj.task.task_name

    task_label.short_description = "Task"
    # form = ForecastYearsParamsForm
    list_display = (
        "id",
        "task_label",
        "density",
        "startdate",
        "enddate",
    )
    
    list_filter = ("id",)
    search_fields = ("id", "task")


@admin.register(PatternSelf)
class PatternSelf(admin.ModelAdmin):
    def task_label(self, obj):
        return obj.task.task_name

    task_label.short_description = "Task"
    # form = ForecastYearsParamsForm
    list_display = (
        "id",
        "task_label",
        "startdate",
        "enddate",
    )

    list_filter = ("id",)
    search_fields = ("id", "task")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "type",
        "dose",
        "open_hour",
        "close_hour",
        "duration",
        "passes_count",
        "mode",
        "size",
        "quantity",
        "disease",
        "task",
    )
    list_filter = ("type", "task")
    search_fields = ("id",)


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "email",
        "firstname",
        "lastname",
        "company",
        "phone",
        "nb_hectares",
        "demo_account",
    )
    list_filter = (
        "email", "phone"
    )
    search_fields = ("id", "email", "phone")


@admin.register(Histogram)
class HistogramAdmin(admin.ModelAdmin):
    search_fields = ["id", "task__id"]
    
    # Customize the fields to display in the admin list view
    list_display = ("task", "date", "provider", "tif_file", "shapefile_file")


@admin.register(TerrainModel)
class TerrainModelAdmin(admin.ModelAdmin):
    list_display = ("task", "date_acquired", "provider", "tif_file")



@admin.register(HistogramBins)
class HistogramBinsAdmin(admin.ModelAdmin):
    # Customize the fields to display in the admin list view
    search_fields = ["id", "histogram__id"]
    
    list_display = ("histogram", "index", "percentile",
                    "tif_file", "min", "max")

@admin.register(IndexDifference)
class IndexDifferenceAdmin(admin.ModelAdmin):
    search_fields = ["id"]
    
    list_display = ("id","date1", "date2", "index","tif_file", "min", "max")
    
@admin.register(HistogramStatic)
class HistogramStaticAdmin(admin.ModelAdmin):
    form = HistogramStaticForm
    
    def density_name(self, obj):
        return obj.density.name_en

    def task_name(self, obj):
        return obj.density.task_set.first().task_name if obj.density.task_set.exists() else "N/A"
    def task_id(self, obj):
        return obj.density.task_set.first().id if obj.density.task_set.exists() else "N/A"
    list_display = ("index", "density_name","density", "task_name","task_id", "min", "max")
    list_filter = ("index", "density__task__id")
    search_fields = ("index",  "density__task__task_name","density__task__id")


@admin.register(AnomalyType)
class AnomalyTypeAdmin(admin.ModelAdmin):

    list_display = (
        "id","anomaly_type"
    )
    search_fields = ("id",)


@admin.register(TaskReferenceComparison)
class TaskReferenceComparisonAdmin(admin.ModelAdmin):
    form = TaskReferenceComparisonForm
    list_display = ('id', 'task', 'culture', 'density', 'variety', 'startage', 'endage')
    search_fields = ('task__name', 'culture__name', 'density__name', 'variety__name', 'startage', 'endage')
    list_filter = ('task', 'culture', 'density', 'variety', 'startage', 'endage')
    list_per_page = 20
    ordering = ('task', 'startage')


@admin.register(PdfInvoice)
class PdfInvoiceAdmin(admin.ModelAdmin):
    form = PdfInvoiceForm
    list_display = ("id", "user", "name", "file","startDate","endDate", "created", "modified")
    list_filter = ("id","name")
    search_fields = ("id", "user", "name","startDate","endDate")


class PdfInvoice(admin.TabularInline):
    model = PdfInvoice
    extra = 0
    list_select_related = ("user",)

@admin.register(ShowNotificationsTask)
class ShowNotificationsTaskAdmin(admin.ModelAdmin):
    form = ShowNotificationsTaskyForm
    list_per_page = 1000000
    list_display = (
        "id", "get_task_id", "get_task_name", "showForcastNotification",
        "showPatternNotification", "showAutoPatternNotification",
        "showSoilHumidityNotification", "created", "modified"
    )
    list_filter = (
        "id", "showForcastNotification", "showPatternNotification",
        "showAutoPatternNotification", "showSoilHumidityNotification",
        "created", "modified"
    )
    search_fields = ("id", "task__id", "task__task_name")
    ordering = (
        "id", "task__id", "task__task_name", "showForcastNotification",
        "showPatternNotification", "showAutoPatternNotification",
        "showSoilHumidityNotification", "created", "modified"
    )

    def get_task_id(self, obj):
        return obj.task.id

    get_task_id.short_description = "Task ID"
    get_task_id.admin_order_field = 'task__id'

    def get_task_name(self, obj):
        return obj.task.task_name

    get_task_name.short_description = "Task Name"
    get_task_name.admin_order_field = 'task__task_name'

@admin.register(CultureCategories)
class CultureCategoriesAdmin(admin.ModelAdmin):
    list_display = ("id", "name_en", "name_fr", "name_ar", "created", "modified")
    list_filter = ("id", "name_en", "name_fr", "name_ar", "created", "modified")
    search_fields = ("id", "name_en", "name_fr", "name_ar", "created", "modified")
    ordering = ("id", "name_en", "name_fr", "name_ar", "created", "modified")
