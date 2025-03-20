from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import APIException

HTTP_453_DEMO_ACCOUNT_AUTHENTICATION_REQUIRED = 452


class AuthenticationFailed(APIException):
    status_code = HTTP_453_DEMO_ACCOUNT_AUTHENTICATION_REQUIRED
    default_detail = _('Demo account has expired')
    default_code = 'authentication_demo_account_failed'
