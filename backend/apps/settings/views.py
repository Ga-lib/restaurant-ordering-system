from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone

from firebase.firebase_config import db
from utils.auth import require_role
from .serializers import RestaurantSettingsSerializer

DOC_ID = "main"
COLLECTION = "restaurant_settings"

DEFAULTS = {
    "restaurant_name": "Your Restaurant",
    "address": "",
    "phone": "",
    "opening_time": "10:00",
    "closing_time": "22:00",
    "tax_percent": 0,
    "service_charge_percent": 0,
    "latitude": 23.8703,
    "longitude": 90.3960,
}


@api_view(["GET"])
def get_settings(request):
    """Public: anyone can read restaurant info/hours (needed for customer-facing pages)."""
    doc = db.collection(COLLECTION).document(DOC_ID).get()
    if not doc.exists:
        return Response(DEFAULTS, status=status.HTTP_200_OK)
    return Response(doc.to_dict(), status=status.HTTP_200_OK)


@api_view(["PUT"])
@require_role("admin")
def update_settings(request):
    """Admin only: update restaurant info, hours, tax/service charge."""
    serializer = RestaurantSettingsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    data["updated_at"] = datetime.now(timezone.utc).isoformat()

    db.collection(COLLECTION).document(DOC_ID).set(data, merge=True)

    updated = db.collection(COLLECTION).document(DOC_ID).get().to_dict()
    return Response(updated, status=status.HTTP_200_OK)