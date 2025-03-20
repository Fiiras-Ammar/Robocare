import firebase_admin
from firebase_admin import credentials
import os

try:
    firebase_app = firebase_admin.get_app()
except ValueError:
    cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
    if not cred_path:
        raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY not set in environment")
    cred = credentials.Certificate(cred_path)
    firebase_app = firebase_admin.initialize_app(cred)