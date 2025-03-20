from djoser import email
from templated_mail.mail import BaseEmailMessage
from djoser import utils
from djoser.conf import settings
from django.contrib.auth.tokens import default_token_generator


class ActivationEmail(email.ActivationEmail):
    template_name = '../templates/emails/activation.html'


class ConfirmationEmail(BaseEmailMessage):
    template_name = "../templates/emails/confirmation.html"


class PasswordResetEmail(BaseEmailMessage):
    template_name = "../templates/emails/password_reset.html"

    def get_context_data(self):
        # PasswordResetEmail can be deleted
        context = super().get_context_data()

        user = context.get("user")
        context["uid"] = utils.encode_uid(user.pk)
        context["token"] = default_token_generator.make_token(user)
        context["url"] = settings.PASSWORD_RESET_CONFIRM_URL.format(**context)
        return context
