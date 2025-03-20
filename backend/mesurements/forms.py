from django import forms
from .models import (
    Density,
    Culture,
    Task,
    Variety,
    Subscription,
    HighResolutionRequest,
    PlantCount,
    PdfReport,
    Product,
    ProductType,
    Disease,
    DiseaseActor,
    FertilisationProduct,
    GraphData,
    DataForecast,
    AlertPredict,
    ForecastYearsParams,
    HistogramStatic, PdfInvoice, TaskReferenceComparison, ShowNotificationsTask, CultureCategories
)


class DensityForm(forms.ModelForm):
    class Meta:
        model = Density
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Customize the queryset for the 'culture_id' field to display 'name_fr' in the dropdown
        # self.fields['culture'].queryset = Culture.objects.only('name_fr')
        self.fields["culture"].label_from_instance = lambda obj: "%s" % (
            obj.name_fr)


class PdfReportForm(forms.ModelForm):
    class Meta:
        model = PdfReport
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Customize the queryset for the 'culture_id' field to display 'name_fr' in the dropdown
        # self.fields['culture'].queryset = Culture.objects.only('name_fr')
        self.fields["user"].label_from_instance = (
            lambda obj: f"{obj.email} - {obj.firstname} {obj.lastname}"
        )


class TaskyForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Customize the label for the 'project' field (if needed, e.g., showing 'project_name')
        self.fields["project"].label_from_instance = lambda obj: "%s" % (obj.project_name)

        # Customize the label for the 'density' field to show both 'id' and 'name_fr'
        self.fields["density"].label_from_instance = lambda obj: "%s - %s" % (obj.id, obj.name_fr)

        # Customize the label for the 'culture' field to show the 'name_fr' attribute
        #self.fields["culture"].label_from_instance = lambda obj: "%s" % (obj.name_fr)
        self.fields["culture"].label_from_instance = lambda obj: "%s | %s" % (obj.name_fr, obj.id)

        # Customize the label for the 'texture' field to show the 'name_fr' attribute
        self.fields["texture"].label_from_instance = lambda obj: "%s" % (obj.name_fr)

        # Customize the label for the 'irrigation' field to show the 'name_fr' attribute
        self.fields["irrigation"].label_from_instance = lambda obj: "%s" % (obj.name_fr)
        # self.fields['variety'].label_from_instance = lambda obj: "%s" % (
        #     obj.name_fr)

        self.fields["intensification_density"].label_from_instance = lambda obj: "%s | %s" % (obj.name_fr, obj.id)
        self.fields["intensification_variety"].label_from_instance = lambda obj: "%s | %s" % (obj.name_fr, obj.id)
        self.fields["intensification_culture"].label_from_instance = lambda obj: "%s | %s" % (obj.name_fr, obj.id)

        self.fields["variety"].label_from_instance = lambda obj: "%s | %s" % (obj.name_fr, obj.id)
        self.fields["density"].label_from_instance = lambda obj: "%s | %s" % (obj.name_fr, obj.id)


class VarietyForm(forms.ModelForm):
    class Meta:
        model = Variety
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Customize the queryset for the 'culture_id' field to display 'name_fr' in the dropdown
        # self.fields['culture'].queryset = Culture.objects.only('name_fr')
        self.fields["culture"].label_from_instance = lambda obj: "%s" % (
            obj.name_fr)


class SubscriptionForm(forms.ModelForm):
    SUBSCRIPTION_CHOICES = (
        (0, "On-Demand Requests"),
        (1, "Monthly Requests"),
        (2, "Weekly Requests"),
    )
    subscription = forms.ChoiceField(
        choices=SUBSCRIPTION_CHOICES, label="Subscription")

    class Meta:
        model = Subscription
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Customize the queryset for the 'culture_id' field to display 'name_fr' in the dropdown
        # self.fields['culture'].queryset = Culture.objects.only('name_fr')
        self.fields["user"].label_from_instance = lambda obj: "%s %s" % (
            obj.firstname,
            obj.lastname,
        )
        self.fields["task"].label_from_instance = lambda obj: "%s" % (
            obj.task_name)


class PlantCountForm(forms.ModelForm):
    class Meta:
        model = Subscription
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["task"].label_from_instance = lambda obj: "%s" % (
            obj.task_name)


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["productType"].label_from_instance = lambda obj: "%s" % (
            obj.name)


class ProductTypeForm(forms.ModelForm):
    class Meta:
        model = ProductType
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


class DiseaseForm(forms.ModelForm):
    class Meta:
        model = Disease
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


class DiseaseActorForm(forms.ModelForm):
    class Meta:
        model = DiseaseActor
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["disease"].label_from_instance = lambda obj: "%s" % (
            obj.name)


class FertilisationProductActorForm(forms.ModelForm):
    class Meta:
        model = FertilisationProduct
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


class GraphDataForm(forms.ModelForm):
    class Meta:
        model = GraphData
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["task"].label_from_instance = lambda obj: "%s" % (
            obj.task_name)


class DataForecastForm(forms.ModelForm):
    class Meta:
        model = DataForecast
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["task"].label_from_instance = lambda obj: "%s | %s" % (
            obj.id,
            obj.task_name,
        )


class AlertPredictForm(forms.ModelForm):
    class Meta:
        model = AlertPredict
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["task"].label_from_instance = lambda obj: "%s | %s" % (
            obj.id,
            obj.task_name,
        )


class ForecastYearsParamsForm(forms.ModelForm):
    class Meta:
        model = ForecastYearsParams
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["task"].label_from_instance = lambda obj: "%s | %s" % (
            obj.id,
            obj.task_name,
        )


class HistogramStaticForm(forms.ModelForm):
    class Meta:
        model = HistogramStatic
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["density"].label_from_instance = lambda obj: "%s | %s" % (
            obj.id,
            obj.name_fr,
        )

class PdfInvoiceForm(forms.ModelForm):
    class Meta:
        model = PdfInvoice
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["user"].label_from_instance = (
            lambda obj: f"{obj.email} - {obj.firstname} {obj.lastname}"
        )


class TaskReferenceComparisonForm(forms.ModelForm):
    class Meta:
        model = TaskReferenceComparison
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # For task - using task_name based on your other forms
        self.fields["task"].label_from_instance = lambda obj: f"{obj.task_name} | {obj.id}"

        # For culture - using name_fr based on your other forms
        self.fields["culture"].label_from_instance = lambda obj: f"{obj.name_fr} | {obj.id}"

        # For density - using name_fr based on your other forms
        self.fields["density"].label_from_instance = lambda obj: f"{obj.name_fr} | {obj.id}"

        # For variety - using name_fr based on your other forms
        self.fields["variety"].label_from_instance = lambda obj: f"{obj.name_fr} | {obj.id}"


class ShowNotificationsTaskyForm(forms.ModelForm):
    class Meta:
        model = ShowNotificationsTask
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["task"].label_from_instance = lambda obj: f"{obj.task_name} | {obj.id}"


class CultureForm(forms.ModelForm):
    class Meta:
        model = Culture
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['categorie'].queryset = CultureCategories.objects.all()
        self.fields['categorie'].label_from_instance = lambda obj: f"{obj.name_fr} | {obj.id}"