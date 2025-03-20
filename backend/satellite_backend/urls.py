"""
URL configuration for satellite_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls.static import static
from django.conf import settings
from authentification import views
from mesurements.serializers import CutomObtainPairView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import get_token
from django.http import JsonResponse

admin.site.site_header = "Robocare Satellite App"
admin.site.site_title = "Robocare Satellite App"
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})
urlpatterns = [
    path('admin/clearcache/', include('clearcache.urls')),
    path("admin/", admin.site.urls),
    path('auth/jwt/create/', CutomObtainPairView.as_view(), name='customtoken'),
    path("auth/", include('djoser.urls')),
    path("auth/", include('djoser.urls.jwt')),
    path('api/', include('mesurements.urls')),
    path('irrigation/', include('irrigation.urls')),
    path('auth/', include('authentification.urls')),
    path('auth/csrf/', get_csrf_token, name='get_csrf'),


]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += [re_path(r'^.*',
                        TemplateView.as_view(template_name='index.html'))]
urlpatterns += staticfiles_urlpatterns()
