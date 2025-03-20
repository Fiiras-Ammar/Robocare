import logging
from django.template.loader import render_to_string
from django_cron import CronJobBase, Schedule
from authentification.models import UserAccount
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from datetime import timedelta
from django.utils import timezone

logger = logging.getLogger(__name__)


class ExpiredDemoAccountEmail(CronJobBase):
    RUN_EVERY_MINS = 1
    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'authentication.send_email_demo_account_will_be_expired'
    def do(self):
        now = timezone.now()
        twenty_one_days_ago = now - timedelta(days=21)
        expired_users = UserAccount.objects.filter(
            is_not_demo=False,
            created__date=twenty_one_days_ago.date()
        )
        for user in expired_users:
            print("created",user.created)

            print("expired",(user.created+timedelta(days=30)).strftime("%d-%m-%Y"))
            email = user.email
            context_email = {
                "user": user.firstname + " " + user.lastname,
                "contact": "https://robocare.tn/?page_id=13",
                "expired": (user.created+timedelta(days=30)).strftime("%d-%m-%Y"),
            }
            html_message = render_to_string(
                "emails/demo_account_will_be_expired_en.html", context=context_email
            )
            plain_message = strip_tags(html_message)
            message = EmailMultiAlternatives(
                subject="Your demo account is about to expire",
                body=plain_message,
                from_email=settings.EMAIL_HOST_USER,
                to=[email],
            )
            message.attach_alternative(html_message, "text/html")
            try:
                message.send()
            except Exception as e:
                logger.error(f"Failed to send email to : {email} {e}")
