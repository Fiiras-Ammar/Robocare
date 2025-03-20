from rest_framework import serializers
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
    SensorData,
    Note,
    PlantCount,
    PdfReport,
    ProductType,
    Product,
    Disease,
    DiseaseActor,
    FertilisationProduct,
    Event,
    GraphData,
    UserHistory,
    DataForecast,
    StadesPhenologique,
    AlertPredict,
    Alert,
    ForecastYearsParams,
    Pattern,
    Histogram,
    HistogramBins,
    FieldVisit,
    VisitFile,
    Quote,
    HistogramStatic,
    AnomalyType,
    Anomaly,
    AnomalyFile,
    PatternSelf,
    TaskReferenceComparison,
    TerrainModel,
    PdfInvoice,
    IndexDifference, ShowNotificationsTask, CultureCategories,
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from authentification.models import UserAccount
from django.utils import timezone

from datetime import datetime, timezone, timedelta
from .exception import AuthenticationFailed


class TokenObtainSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = UserAccount.objects.get(email=attrs["email"])
        now = datetime.now(timezone.utc)
        user.last_login = now
        if user.is_authorized is True:
            user.save()
            refresh = self.get_token(self.user)
            data["refresh"] = str(refresh)
            data["access"] = str(refresh.access_token)
            history = UserHistory()
            history.user = user
            history.date_of_request = now
            history.label = "Sign In"
            history.request_call = "/auth/jwt/create"
            history.description = ""
            history.duration = 0

            # set last signin duration
            elements = UserHistory.objects.filter(
                user__email=user.email, label="Sign In"
            ).order_by("-date_of_request")
            length = len(elements)
            # if older data exists for current user
            if length > 0:
                lastLogin = elements[0]
                lastOne = UserHistory.objects.filter(user__email=user.email).order_by(
                    "-date_of_request"
                )[0]

                # if last item is logout, the duration already calculated, otherwise we do that now
                if lastOne.label != "Logout":
                    lastLogin.modified = lastOne.date_of_request
                    tdelta = lastOne.date_of_request - lastLogin.date_of_request
                    lastLogin.duration = tdelta.seconds
                    lastLogin.save()

            history.save()

            return data
        else:
            raise AuthenticationFailed()


class CutomObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainSerializer


class AddProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ("user", "project_name")

class DensitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Density
        fields = "__all__"
class CultureCategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CultureCategories
        fields = "__all__"
class CultureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Culture
        fields = "__all__"
class VarietySerializer(serializers.ModelSerializer):
    class Meta:
        model = Variety
        fields = "__all__"
class AddTaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = "__all__"


class AddTaskImageSerializer(serializers.ModelSerializer):
    # image = Base64ImageField(
    #     max_length=None, use_url=True,
    # )

    class Meta:
        model = TaskImage
        fields = "__all__"


class TaskImageSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()

    def get_date(self, instance):
        return instance.date.strftime("%Y-%m-%d")

    class Meta:
        model = TaskImage
        fields = (
            "id",
            "task",
            "date",
            "image",
            "provider",
            "cloud_percentage",
            "created",
            "modified",
        )

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"

class TaskSerializer(serializers.ModelSerializer):
    project = ProjectSerializer()
    intensification_density = DensitySerializer()
    intensification_culture = CultureSerializer()
    intensification_variety = VarietySerializer()

    class Meta:
        model = Task
        fields = "__all__"





class UpdateProjectByTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"

    def update(self, instance, validated_data):
        # Add 1 to the nbr_field
        instance.nbr_field += 1

        # Get the surface value from the request data
        surface = validated_data.get("surface")
        # # Add the surface to the existing value of the surface field
        instance.surface += surface

        # Save the updated instance
        instance.save()

        return instance


class UpdateProjectByDeletedTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"

    def update(self, instance, validated_data):
        # Add 1 to the nbr_field
        instance.nbr_field -= 1

        # Get the surface value from the request data
        surface = validated_data.get("surface")
        # # Add the surface to the existing value of the surface field
        instance.surface -= surface

        # Save the updated instance
        instance.save()

        return instance





class PdfReportSerializer(serializers.ModelSerializer):
    created = serializers.SerializerMethodField()
    modified = serializers.SerializerMethodField()

    def get_created(self, instance):
        return instance.created.strftime("%d %b %Y")

    def get_modified(self, instance):
        return instance.modified.strftime("%d %b %Y")

    class Meta:
        model = PdfReport
        fields = "__all__"


class TextureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Texture
        fields = "__all__"


class IrrigationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Irrigation
        fields = "__all__"


class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = "__all__"


class SensorDataSerializer(serializers.ModelSerializer):
    time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")

    class Meta:
        model = SensorData
        fields = "__all__"








# class listTasksSerializer(serializers.ModelSerializer):
#     created = serializers.SerializerMethodField()
#     modified = serializers.SerializerMethodField()

#     def get_created(self, instance):
#         return instance.created.strftime('%d %b %Y')

#     def get_modified(self, instance):
#         return instance.modified.strftime('%d %b %Y')

#     class Meta:
#         model = Project
#         fields = '__all__'


from rest_framework import serializers
from django.contrib.gis.geos import GEOSGeometry


class CultureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Culture
        fields = ['id', 'name_fr', 'name_en', 'name_ar','categorie', 'created', 'modified']


class DensitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Density
        fields = ['id', 'name_fr', 'name_en', 'name_ar', 'inter_line', 'intra_line',
                  'seeding_kg_per_hectare', 'ndvi_min', 'ndvi_max', 'ndre_min',
                  'ndre_max', 'ndwi_min', 'ndwi_max', 'gci_min', 'gci_max']


class VarietySerializer(serializers.ModelSerializer):
    class Meta:
        model = Variety
        fields = ['id', 'name_fr', 'name_en', 'name_ar', 'culture']


class TaskByProjectSerializer(serializers.ModelSerializer):
    # Regular foreign key relationships
    culture = CultureSerializer(read_only=True)
    density = DensitySerializer(read_only=True)
    variety = VarietySerializer(read_only=True)

    # Intensification foreign key relationships
    intensification_culture = CultureSerializer(read_only=True)
    intensification_density = DensitySerializer(read_only=True)
    intensification_variety = VarietySerializer(read_only=True)

    class Meta:
        model = Task
        fields = "__all__"


class TaskByProjectEventsSerializer(serializers.ModelSerializer):
    culture_name_fr = serializers.CharField(source="culture.name_fr", read_only=True)
    variety_name_fr = serializers.CharField(source="variety.name_fr", read_only=True)
    density_name_fr = serializers.CharField(source="density.name_fr", read_only=True)

    intensification_culture_name_fr = serializers.SerializerMethodField()
    intensification_variety_name_fr = serializers.SerializerMethodField()
    intensification_density_name_fr = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = (
            "id", "task_name", "age", "culture_name_fr",
            "variety_name_fr", "density_name_fr", "plantation_date",
            "intensification_date", "intensification_culture_name_fr",
            "intensification_variety_name_fr", "intensification_density_name_fr"
        )

    def get_intensification_culture_name_fr(self, obj):
        return obj.intensification_culture.name_fr if obj.intensification_culture else None

    def get_intensification_variety_name_fr(self, obj):
        return obj.intensification_variety.name_fr if obj.intensification_variety else None

    def get_intensification_density_name_fr(self, obj):
        return obj.intensification_density.name_fr if obj.intensification_density else None




class ListProjectSerializer(serializers.ModelSerializer):
    created = serializers.SerializerMethodField()
    modified = serializers.SerializerMethodField()
    # Renamed 'task' to 'tasks'
    tasks = TaskByProjectSerializer(
        many=True, read_only=True, source="task_set")

    def get_created(self, instance):
        return instance.created.strftime("%d %b %Y")

    def get_modified(self, instance):
        return instance.modified.strftime("%d %b %Y")

    class Meta:
        model = Project
        fields = "__all__"


class ProjectsEventsSerializer(serializers.ModelSerializer):
    tasks = TaskByProjectEventsSerializer(
        many=True, read_only=True, source="task_set")

    def get_created(self, instance):
        return instance.created.strftime("%d %b %Y")

    def get_modified(self, instance):
        return instance.modified.strftime("%d %b %Y")

    class Meta:
        model = Project
        fields = ("id", "project_name", "tasks")


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = "__all__"


class HighResolutionRequestSerializer(serializers.ModelSerializer):
    created = serializers.SerializerMethodField()
    modified = serializers.SerializerMethodField()

    def get_created(self, instance):
        return instance.created.strftime("%d %b %Y")

    def get_modified(self, instance):
        return instance.modified.strftime("%d %b %Y")

    class Meta:
        model = HighResolutionRequest
        fields = "__all__"


class ListSubscriptionSerializer(serializers.ModelSerializer):
    created = serializers.SerializerMethodField()
    modified = serializers.SerializerMethodField()
    subscription = serializers.SerializerMethodField()

    # Renamed 'task' to 'tasks'

    def get_created(self, instance):
        return instance.created.strftime("%d %b %Y")

    def get_modified(self, instance):
        return instance.modified.strftime("%d %b %Y")

    def get_subscription(self, instance):
        # Define a mapping of numeric values to corresponding strings
        subscription_mapping = {
            0: "On-Demand Requests",
            1: "Monthly Requests",
            2: "Weekly Requests",
            # Add more mappings as needed
        }
        # Get the numeric value of the subscription field
        subscription_value = instance.subscription
        # Use the mapping to return the corresponding string
        return subscription_mapping.get(subscription_value, "Unknown Subscription")

    class Meta:
        model = Subscription
        fields = "__all__"


class SubscriptionSerializer(serializers.ModelSerializer):
    created = serializers.SerializerMethodField()
    modified = serializers.SerializerMethodField()

    def get_created(self, instance):
        return instance.created.strftime("%d %b %Y")

    def get_modified(self, instance):
        return instance.modified.strftime("%d %b %Y")

    class Meta:
        model = Subscription
        fields = "__all__"


class NoteSerializer(serializers.ModelSerializer):
    created = serializers.SerializerMethodField()
    modified = serializers.SerializerMethodField()

    def get_created(self, instance):
        return instance.created.strftime("%d %b %Y")

    def get_modified(self, instance):
        return instance.modified.strftime("%d %b %Y")

    class Meta:
        model = Note
        fields = "__all__"


class PlantCountSerializer(serializers.ModelSerializer):
    created = serializers.SerializerMethodField()
    modified = serializers.SerializerMethodField()

    def get_created(self, instance):
        return instance.created.strftime("%d %b %Y")

    def get_modified(self, instance):
        return instance.modified.strftime("%d %b %Y")

    class Meta:
        model = PlantCount
        fields = "__all__"


class ProductTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductType
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class DiseaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disease
        fields = "__all__"


class DiseaseActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseaseActor
        fields = "__all__"


class FertilisationProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = FertilisationProduct
        fields = "__all__"


class StadesPhenologiqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = StadesPhenologique
        fields = "__all__"


class EventSerializer(serializers.ModelSerializer):
    fertilisationproduct_name = serializers.SerializerMethodField()
    producttype_name = serializers.SerializerMethodField()
    stade_name = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    disease_name = serializers.SerializerMethodField()
    diseaseActor_name = serializers.SerializerMethodField()
    field_visit = serializers.SerializerMethodField()
    anomaly = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'fertilisationproduct_name', 'producttype_name', 'stade_name',
            'product_name', 'disease_name', 'diseaseActor_name', 'field_visit',
            'anomaly', 'created', 'modified', 'type', 'dose', 'open_hour',
            'close_hour', 'duration', 'passes_count', 'mode', 'unit', 'size',
            'quantity', 'isDone', 'task', 'product', 'fertilisationproduct',
            'producttype', 'stade', 'disease', 'disease_actor', 'variety'
        ]

    def get_fertilisationproduct_name(self, obj):
        return obj.fertilisationproduct.name if obj.fertilisationproduct else None

    def get_producttype_name(self, obj):
        return obj.producttype.name if obj.producttype else None

    def get_stade_name(self, obj):
        return obj.stade.name if obj.stade else None

    def get_product_name(self, obj):
        return obj.product.name if obj.product else None

    def get_disease_name(self, obj):
        return obj.disease.name if obj.disease else None

    def get_diseaseActor_name(self, obj):
        return obj.disease_actor.name if obj.disease_actor else None

    def get_field_visit(self, obj):
        if obj.field_visit:
            visit_files = VisitFile.objects.filter(field_visit=obj.field_visit)
            files_data = [{"id": file.id, "file": file.file.url} for file in visit_files]
            return {
                "id": obj.field_visit.id,
                "notes": obj.field_visit.notes,
                "files": files_data,
            }
        return None

    def get_anomaly(self, obj):
        if obj.anomaly:
            anomaly_files = AnomalyFile.objects.filter(anomaly=obj.anomaly)
            files_data = [{"id": file.id, "file": file.file.url} for file in anomaly_files]
            anomaly_type_data = {
                "id": obj.anomaly.anomaly_type.id,
                "name": obj.anomaly.anomaly_type.anomaly_type
            } if obj.anomaly.anomaly_type else None

            return {
                "id": obj.anomaly.id,
                "notes": obj.anomaly.notes,
                "files": files_data,
                "anomaly_type": anomaly_type_data,
            }
        return None


class EventTaskSerializer(serializers.ModelSerializer):
    task = TaskByProjectEventsSerializer()
    fertilisationproduct_name = serializers.SerializerMethodField()
    producttype_name = serializers.SerializerMethodField()
    stade_name = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    disease_name = serializers.SerializerMethodField()
    diseaseActor_name = serializers.SerializerMethodField()
    field_visit = serializers.SerializerMethodField()
    anomaly = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = "__all__"

    def get_fertilisationproduct_name(self, obj):
        return obj.fertilisationproduct.name if obj.fertilisationproduct else None

    def get_producttype_name(self, obj):
        return obj.producttype.name if obj.producttype else None

    def get_stade_name(self, obj):
        return obj.stade.name if obj.stade else None

    def get_product_name(self, obj):
        return obj.product.name if obj.product else None

    def get_disease_name(self, obj):
        return obj.disease.name if obj.disease else None

    def get_diseaseActor_name(self, obj):
        return obj.disease_actor.name if obj.disease_actor else None

    def get_producttype_name(self, obj):
        return obj.producttype.name if obj.producttype else None

    def get_stade_name(self, obj):
        return obj.stade.name if obj.stade else None

    def get_product_name(self, obj):
        return obj.product.name if obj.product else None

    def get_disease_name(self, obj):
        return obj.disease.name if obj.disease else None

    def get_diseaseActor_name(self, obj):
        return obj.disease_actor.name if obj.disease_actor else None

    def get_field_visit(self, obj):
        if obj.field_visit:
            visit_files = VisitFile.objects.filter(field_visit=obj.field_visit)
            files_data = [{"id": file.id, "file": file.file.url} for file in visit_files]
            return {
                "id": obj.field_visit.id,
                "notes": obj.field_visit.notes,
                "files": files_data,
            }
        return None

    def get_anomaly(self, obj):
        if obj.anomaly:
            anomaly_files = AnomalyFile.objects.filter(anomaly=obj.anomaly)
            files_data = [{"id": file.id, "file": file.file.url} for file in anomaly_files]
            anomaly_type_data = {
                "id": obj.anomaly.anomaly_type.id,
                "name": obj.anomaly.anomaly_type.anomaly_type
            } if obj.anomaly.anomaly_type else None

            return {
                "id": obj.anomaly.id,
                "notes": obj.anomaly.notes,
                "files": files_data,
                "anomaly_type": anomaly_type_data,
            }
        return None


class UpdateEventSerializer(serializers.ModelSerializer):
    fertilisationproduct_name = serializers.SerializerMethodField()
    producttype_name = serializers.SerializerMethodField()
    stade_name = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    disease_name = serializers.SerializerMethodField()
    diseaseActor_name = serializers.SerializerMethodField()
    field_visit = serializers.SerializerMethodField()
    anomaly = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = "__all__"

    def get_fertilisationproduct_name(self, obj):
        return obj.fertilisationproduct.name if obj.fertilisationproduct else None

    def get_producttype_name(self, obj):
        return obj.producttype.name if obj.producttype else None

    def get_stade_name(self, obj):
        return obj.stade.name if obj.stade else None

    def get_product_name(self, obj):
        return obj.product.name if obj.product else None

    def get_disease_name(self, obj):
        return obj.disease.name if obj.disease else None

    def get_diseaseActor_name(self, obj):
        return obj.disease_actor.name if obj.disease_actor else None

    def get_field_visit(self, obj):
        if obj.field_visit:
            visit_files = VisitFile.objects.filter(field_visit=obj.field_visit)
            files_data = [{"id": file.id, "file": file.file.url}
                          for file in visit_files]
            return {
                "id": obj.field_visit.id,
                "notes": obj.field_visit.notes,
                "files": files_data,
            }
        return None

    def get_anomaly(self, obj):
        if obj.anomaly:
            anomaly_files = AnomalyFile.objects.filter(anomaly=obj.anomaly)
            files_data = [{"id": file.id, "file": file.file.url} for file in anomaly_files]
            anomaly_type_data = {
                "id": obj.anomaly.anomaly_type.id,
                "name": obj.anomaly.anomaly_type.anomaly_type
            } if obj.anomaly.anomaly_type else None

            return {
                "id": obj.anomaly.id,
                "notes": obj.anomaly.notes,
                "files": files_data,
                "anomaly_type": anomaly_type_data,
            }
        return None

class AddEventSerializer(serializers.ModelSerializer):
    fertilisationproduct_name = serializers.SerializerMethodField()
    producttype_name = serializers.SerializerMethodField()
    stade_name = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    disease_name = serializers.SerializerMethodField()
    diseaseActor_name = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = "__all__"

    def get_fertilisationproduct_name(self, obj):
        if obj.fertilisationproduct:
            return obj.fertilisationproduct.name
        return None

    def get_producttype_name(self, obj):
        if obj.producttype:
            return obj.producttype.name
        return None

    def get_stade_name(self, obj):
        if obj.stade:
            return obj.stade.name
        return None

    def get_product_name(self, obj):
        return obj.product.name if obj.product else None

    def get_disease_name(self, obj):
        return obj.disease.name if obj.disease else None

    def get_diseaseActor_name(self, obj):
        return obj.disease_actor.name if obj.disease_actor else None


class GraphDataTaskSerializer(serializers.ModelSerializer):
    task = TaskByProjectEventsSerializer()

    class Meta:
        model = GraphData
        fields = "__all__"


class GraphDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = GraphData
        fields = "__all__"


class UserHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserHistory
        fields = "__all__"


class DataForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataForecast
        fields = "__all__"


class AlertPredictSerializer(serializers.ModelSerializer):
    # date = serializers.SerializerMethodField()

    # def get_date(self, instance):
    #     return instance.date.strftime("%Y-%m-%d")

    class Meta:
        model = AlertPredict
        fields = [
            "id",
            "index",
            "created",
            "modified",
            "state",
            "abs_difference",
            "date",
            "task",
        ]


class GenericAlertSerializer(serializers.ModelSerializer):
    # date = serializers.SerializerMethodField()

    # def get_date(self, instance):
    #     return instance.date.strftime("%Y-%m-%d")

    class Meta:
        model = Alert
        fields = [
            "id",
            "viewed",
            "abs_difference",
            "time",
            "task",
            "alert_type"
        ]


class AlertPredictAddSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertPredict
        fields = "__all__"


class TaskAlertsSerializer(serializers.ModelSerializer):
    alerts = AlertPredictSerializer(
        many=True, read_only=True, source="alertpredict_set"
    )  # Nested serializer

    class Meta:
        model = Task
        fields = ["id", "task_name", "image_sidebar", "alerts"]


class TaskGenericAlertsSerializer(serializers.ModelSerializer):
    alerts = GenericAlertSerializer(
        many=True, read_only=True, source="alert_set"
    )  # Nested serializer

    class Meta:
        model = Task
        fields = ["id", "task_name", "image_sidebar", "alerts"]


class TaskAlertsHeadSerializer(serializers.ModelSerializer):
    alerts = AlertPredictSerializer(
        many=True, read_only=True, source="alertpredict_set"
    )  # Nested serializer

    class Meta:
        model = Task
        fields = ["id", "task_name", "image_sidebar", "alerts"]

    def to_representation(self, instance):
        # Use super() to get the default representation
        representation = super().to_representation(instance)
        # Sort alerts based on the date attribute
        representation["alerts"] = sorted(
            representation["alerts"], key=lambda x: x["date"], reverse=True
        )
        return representation


class TaskGenericAlertsHeadSerializer(serializers.ModelSerializer):
    alerts = GenericAlertSerializer(
        many=True, read_only=True, source="alert_set"
    )  # Nested serializer

    class Meta:
        model = Task
        fields = ["id", "task_name", "image_sidebar", "alerts"]

    def to_representation(self, instance):
        # Use super() to get the default representation
        representation = super().to_representation(instance)
        # Sort alerts based on the date attribute
        representation["alerts"] = sorted(
            representation["alerts"], key=lambda x: x["time"], reverse=True
        )
        return representation


class ForecastYearsParamsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastYearsParams
        fields = "__all__"


class PatternSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pattern
        fields = "__all__"


class HistogramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Histogram
        fields = "__all__"
        
class TerrainModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrainModel
        fields = "__all__"


class HistogramBinsSerializer(serializers.ModelSerializer):
    min = serializers.SerializerMethodField()
    max = serializers.SerializerMethodField()

    class Meta:
        model = HistogramBins
        fields = "__all__"

    def get_min(self, obj):
        return float(obj.min)  # Convert Decimal to float

    def get_max(self, obj):
        return float(obj.max)  # Convert Decimal to float

class IndexDifferenceSerializer(serializers.ModelSerializer):
    min = serializers.SerializerMethodField()
    max = serializers.SerializerMethodField()

    class Meta:
        model = IndexDifference
        fields = "__all__"

    def get_min(self, obj):
        return float(obj.min)

    def get_max(self, obj):
        return float(obj.max)
    
class FieldVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldVisit
        fields = "__all__"


class VisitFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitFile
        fields = "__all__"

    def create(self, validated_data):
        return VisitFile.objects.create(**validated_data)


class FieldVisitDetailSerializer(serializers.ModelSerializer):
    files = VisitFileSerializer(many=True, read_only=True)

    class Meta:
        model = FieldVisit
        fields = ('id', 'notes', 'files')

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['files'] = VisitFileSerializer(
            instance.visitfile_set.all(), many=True).data
        return rep


class AddQuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = "__all__"


class HistogramStaticSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistogramStatic
        fields = "__all__"


class AnomalyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnomalyType
        fields = "__all__"


class AnomalySerializer(serializers.ModelSerializer):
    class Meta:
        model = Anomaly
        fields = "__all__"


class AnomalyFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnomalyFile
        fields = "__all__"

    def create(self, validated_data):
        return AnomalyFile.objects.create(**validated_data)


class AnomalyDetailSerializer(serializers.ModelSerializer):
    files = AnomalyFileSerializer(many=True, read_only=True)

    class Meta:
        model = Anomaly
        anomaly = ('id', 'notes', 'files')

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['files'] = AnomalyFileSerializer(
            instance.anomaly_set.all(), many=True).data
        return rep

class PatternSelfSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatternSelf
        fields = "__all__"

class TaskReferenceComparisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskReferenceComparison
        fields = "__all__"



class TaskReferenceComparisonListSerializer(serializers.ModelSerializer):
    task = TaskSerializer()
    culture = CultureSerializer()
    density = DensitySerializer()
    variety = VarietySerializer()

    class Meta:
        model = TaskReferenceComparison
        fields = "__all__"

class PdfInvoiceSerializer(serializers.ModelSerializer):
    created = serializers.SerializerMethodField()
    modified = serializers.SerializerMethodField()

    def get_created(self, instance):
        return instance.created.strftime("%d %b %Y")

    def get_modified(self, instance):
        return instance.modified.strftime("%d %b %Y")

    def get_startDate(self, instance):
        return instance.startDate.strftime("%d %b %Y")
    def get_endDate(self, instance):
        return instance.endDate.strftime("%d %b %Y")
    class Meta:
        model = PdfInvoice
        fields = "__all__"

class ShowNotificationsTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShowNotificationsTask
        fields = "__all__"