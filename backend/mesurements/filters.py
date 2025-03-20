from django.contrib import admin

from .models import Culture, Density, Variety


class CultureNameFilter(admin.SimpleListFilter):
    title = "By Culture Name Fr"
    parameter_name = "culture_name_fr"

    def lookups(self, request, model_admin):
        # Retrieve distinct culture names from the database
        culture_names = Culture.objects.values_list(
            "name_fr", flat=True).distinct()

        # Create a tuple of culture names for filter options
        return tuple((name, name) for name in culture_names)

    def queryset(self, request, queryset):
        # Filter the queryset based on the selected value
        value = self.value()
        if value:
            return queryset.filter(culture__name_fr=value)


class DensityNameFilter(admin.SimpleListFilter):
    title = "By Density Name "
    parameter_name = "density_name_fr"

    def lookups(self, request, model_admin):
        # Retrieve distinct culture names from the database
        density_names = Density.objects.values_list(
            "name_fr", flat=True).distinct()

        # Create a tuple of culture names for filter options
        return tuple((name, name) for name in density_names)

    def queryset(self, request, queryset):
        # Filter the queryset based on the selected value
        value = self.value()
        if value:
            return queryset.filter(density__name_fr=value)


class VarietyNameFilter(admin.SimpleListFilter):
    title = "By Variety Name "
    parameter_name = "variety_name_fr"

    def lookups(self, request, model_admin):
        # Retrieve distinct culture names from the database
        variety_names = Variety.objects.values_list(
            "name_fr", flat=True).distinct()

        # Create a tuple of culture names for filter options
        return tuple((name, name) for name in variety_names)

    def queryset(self, request, queryset):
        # Filter the queryset based on the selected value
        value = self.value()
        if value:
            return queryset.filter(variety__name_fr=value)
