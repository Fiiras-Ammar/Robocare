from django.db.models.signals import post_save
from django.dispatch import receiver
from authentification.models import UserAccount

from .utils.email_alert_new_client import email_notification_new_client

from django.core.serializers import serialize




@receiver(post_save, sender=UserAccount)
def handle_new_client(sender, instance,created, **kwargs):
    if created:
        email_notification_new_client(user=instance)
