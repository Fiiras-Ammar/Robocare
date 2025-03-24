# urls.py
from django.urls import path
from . import views
from authentification.views import GoogleAuthView 
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import get_token
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})


urlpatterns = [
    path('user/check-staff/<str:pk>/', views.check_staff),
    path('user/sum/', views.count_users),
    path('user/check-email/<str:email>/', views.check_email),
    path('user/demo-account-rest-days/<str:pk>/', views.get_demo_account_rest_days),
    path('auth/csrf/', get_csrf_token, name='get_csrf'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('user/auth/google/', GoogleAuthView.as_view(), name='google-auth'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]