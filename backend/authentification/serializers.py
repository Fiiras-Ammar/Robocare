from djoser.serializers import UserCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
User = get_user_model()
from .models import UserAccount

class CustomUserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = {'id', 'firstname', 'lastname', 'company', 'phone',
                  'email','is_active', 'is_staff', 'password'}

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            firstname=validated_data['firstname'],
            lastname=validated_data['lastname'],
            company=validated_data['company'],
            phone=validated_data['phone'],
            password=validated_data['password']
        )
        return user


class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = '__all__'
