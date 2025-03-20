from django.db import models

# from django.contrib.auth.models import PermissionsMixin, AbstractUser
# from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
# from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django_extensions.db.models import (
    TimeStampedModel,
    ActivatorModel,
    TitleDescriptionModel,
)
import json


class UserAccountManager(BaseUserManager):
    def create_user(self, email, firstname, lastname, company, phone, password=None):
        if not email:
            raise ValueError("Users must have an email !")
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            firstname=firstname,
            lastname=lastname,
            company=company,
            phone=phone,
        )
        user.set_password(password)
        user.save()
        return user

    def create_superuser(
        self,
        email,
        firstname,
        lastname,
        company,
        phone,
        password=None,
    ):
        if not email:
            raise ValueError("Users must have an email !")
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            firstname=firstname,
            lastname=lastname,
            company=company,
            phone=phone,
        )
        user.set_password(password)

        user.save()
        return user


class UserAccount(TimeStampedModel, AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=255, unique=True)
    firstname = models.CharField(max_length=255)
    lastname = models.CharField(max_length=255)
    company = models.CharField(max_length=255, null=True, default=None)
    phone = models.CharField(max_length=20, blank=True, default=None)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_not_demo = models.BooleanField(default=False)
    is_authorized = models.BooleanField(default=False)
    objects = UserAccountManager()
    language = models.CharField(max_length=255,default='fr')

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["firstname", "lastname", "company", "phone"]

    def get_full_name(self):
        return self.firstname + self.lastname

    def get_company(self):
        return self.company

    def __str__(self):
        return self.email

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)
