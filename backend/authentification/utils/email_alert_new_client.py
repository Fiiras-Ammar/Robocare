from ..models import (
    UserAccount
)
from django.utils import timezone
import datetime
import pandas as pd
from django.template.loader import render_to_string
from django_cron import CronJobBase, Schedule
from authentification.models import UserAccount
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from datetime import timedelta

def email_notification_new_client(user):
    try:
        now = timezone.now()
        text_content = (
            "Hi,\r\r"
            f"A new client has signed up on {now.strftime('%d-%m-%Y')}."
            "Client details:\r"
            f"Name: {user.firstname} {user.lastname}\r"
            f"Email: {user.email}\r"
            f"Phone: {user.phone}\r"
            f"Company: {user.company}\r\r"
        )

        html_content = (
            "<p>Hi,</p>"
            f"A new client has signed up on <strong>{now.strftime('%d-%m-%Y')}</strong>."
            "<p>Client details:</p>"
            f"<p><strong>Name:</strong> {user.firstname} {user.lastname}</p>"
            f"<p><strong>Email:</strong> {user.email}</p>"
            f"<p><strong>Phone:</strong> {user.phone}</p>"
            f"<p><strong>Company:</strong> {user.company}</p>"
            f"<form action='https://app.satellite.robocare.tn/api/user/authorized/update/{user.id}/' method='GET'>"
            "<button style='background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; "
            "cursor: pointer; font-size: 16px;'>Authorize Account</button>"
            "</form>"
        )

        message = EmailMultiAlternatives(
            subject="New Client",
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=["ihbiri@robocare.tn", "mkadri@robocare.tn", "kadrimarwa.1999@gmail.com","imen.hbiri@isgis.usf.tn","mfourati@robocare.tn"],
            #to=["ali.chaabouni@gmail.com"],
        )

        message.attach_alternative(html_content, "text/html")
        message.send()
    except Exception as e:
        print(e)
