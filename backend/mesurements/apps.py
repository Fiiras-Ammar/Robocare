from django.apps import AppConfig


class MesurementsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "mesurements"

    def ready(self):
        import mesurements.signals