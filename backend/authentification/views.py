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
from django.core.exceptions import FieldError

logger = logging.getLogger(__name__)
User = get_user_model()

@method_decorator(csrf_exempt, name='dispatch') 
class GoogleAuthView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        print("POST request received")
        try:
            id_token = request.data.get('id_token')
            if not id_token:
                return Response({'error': 'ID token required'}, status=400)

            # Firebase verification
            decoded_token = firebase_auth.verify_id_token(id_token)
            email = decoded_token.get('email')
            
            # Vérifier si l'utilisateur existe déjà par email
            try:
                user = User.objects.get(email=email)
                # Mettre à jour le firebase_uid si l'utilisateur existe
                user.firebase_uid = decoded_token['uid']
                user.save()
            except User.DoesNotExist:
                # Créer un nouvel utilisateur si l'email n'existe pas
                user = User.objects.create(
                    email=email,
                    firebase_uid=decoded_token['uid'],
                    firstname=decoded_token.get('name', '').split()[0] if decoded_token.get('name') else '',
                    lastname=' '.join(decoded_token.get('name', '').split()[1:]) if decoded_token.get('name') and ' ' in decoded_token.get('name', '') else '',
                    is_active=True,
                    phone=''  # Valeur par défaut pour le champ phone
                )

            # JWT generation
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=200)

        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response({'error': str(e)}, status=400)
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

