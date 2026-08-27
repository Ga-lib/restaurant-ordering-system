import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

firebase_json_env = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

if firebase_json_env:
    # Production (Render): credentials come from an environment variable
    cred_dict = json.loads(firebase_json_env)
    cred = credentials.Certificate(cred_dict)
else:
    # Local development: credentials come from the actual file
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CRED_PATH = os.path.join(BASE_DIR, "firebase-service-account.json")
    cred = credentials.Certificate(CRED_PATH)

firebase_admin.initialize_app(cred)

db = firestore.client()