from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login
from .models import UserAccount
from .serializers import UserAccountSerializer
from satellite_backend.firebase_config import firebase_app  
from firebase_admin import auth as firebase_auth
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.translation import gettext as _
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated  
from rest_framework.permissions import AllowAny
import datetime
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import logging
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()

class GoogleAuthView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        id_token = request.data.get('id_token')
        if not id_token:
            return Response({'error': 'ID token required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify Firebase ID token
            decoded_token = firebase_auth.verify_id_token(id_token)
            firebase_uid = decoded_token['uid']
            email = decoded_token.get('email')
            name = decoded_token.get('name', '').split()

            # Get or create user
            user, created = User.objects.update_or_create(
                firebase_uid=firebase_uid,
                defaults={
                    'email': email,
                    'first_name': name[0] if len(name) > 0 else '',
                    'last_name': name[-1] if len(name) > 1 else '',
                    'is_active': True
                }
            )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)

        except firebase_auth.InvalidIdTokenError:
            logger.error('Invalid Firebase ID token')
            return Response({'error': 'Invalid authentication token'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f'Google auth error: {str(e)}')
            return Response({'error': 'Authentication failed'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(["GET"])
@permission_classes([AllowAny])
def check_staff(request, pk):
    data = UserAccount.objects.get(id=pk)
    userSerializer = UserAccountSerializer(data)
    if (userSerializer.data["is_staff"]):
        return Response({"staff": 1}, status=200)
    else:
        return Response({"staff": 0}, status=200)


@api_view(["GET"])
@permission_classes([AllowAny])
def count_users(request):
    active_accounts_count = UserAccount.objects.filter(is_active=True).count()

    # Calculate the number of active accounts created last month
    last_month_start = timezone.now() - timezone.timedelta(days=30)
    last_month_end = timezone.now()

    last_month_active_accounts_count = UserAccount.objects.filter(
        is_active=True,
        created__range=(last_month_start, last_month_end)
    ).count()

    # Calculate the percentage
    if active_accounts_count > 0:
        percentage_last_month = round(
            (last_month_active_accounts_count / active_accounts_count) * 100, 3)
    else:
        percentage_last_month = 0

    data = {
        "users": active_accounts_count,
        "last_month": percentage_last_month
    }

    return Response({"message": "success", "data": data}, status=200)


@api_view(["GET"])
@permission_classes([AllowAny])
def check_email(request, email):
    try:
        user = UserAccount.objects.get(email=email)
        return Response({"exists": True}, status=200)
    except UserAccount.DoesNotExist:
        return Response({"exists": False}, status=200)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_demo_account_rest_days(request, pk):
    user_account = get_object_or_404(UserAccount, id=pk)
    if user_account.is_not_demo:
        return Response({"nbr_days": 'This is not a demo account'}, status=500)
    now = datetime.now(timezone.utc)
    create_account_date = user_account.created
    difference = now - create_account_date
    nbr_days = difference.days

    return Response({'nbr_days': 30 - nbr_days}, status=200)

