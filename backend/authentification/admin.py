from django.contrib import admin
from .models import UserAccount

# Register your models here.
from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from rest_framework_simplejwt import token_blacklist


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = UserAccount
        fields = ("email",)


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = UserAccount
        fields = ("email",)


class CustomUserAdmin(DjangoUserAdmin):
    # add_form = CustomUserCreationForm
    # form = CustomUserChangeForm

    list_display = (
        "email",
        "firstname",
        "lastname",
        "phone",
        "language",
        "is_staff",
        "is_active",
        "is_not_demo",
        "is_authorized",
        "last_login",
        "created",
        "modified",
    )
    # list_filter = ('is_staff', 'is_active')

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "firstname",
                    "lastname",
                    "phone",
                    "company",
                    "is_superuser",
                    "is_staff",
                    "is_active",
                    "is_not_demo",
                    "is_authorized",
                    "language",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
    )
    fieldsets = (
        (None, {"fields": ("email", "password", "phone", "company","language")}),
        ("Personal Info", {"fields": ("firstname", "lastname")}),
        (
            ("Permissions"),
            {
                "fields": (
                    "is_superuser",
                    "is_staff",
                    "is_active",
                    "groups",
                    "user_permissions",
                    "is_not_demo",
                    "is_authorized",

                )
            },
        ),
        (("Important dates"), {"fields": ("last_login", "created", "modified")}),
    )
    search_fields = ("email", "firstname", "lastname","language", )
    ordering = ("email",)
    filter_horizontal = ()
    readonly_fields = ["created", "modified"]


admin.site.register(UserAccount, CustomUserAdmin)


class OutstandingTokenAdmin(token_blacklist.admin.OutstandingTokenAdmin):
    def has_delete_permission(self, *args, **kwargs):
        return True  # or whatever logic you want


admin.site.unregister(token_blacklist.models.OutstandingToken)
admin.site.register(token_blacklist.models.OutstandingToken, OutstandingTokenAdmin)
