from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone

from firebase.firebase_config import db
from utils.auth import get_user_from_request, require_role
from .serializers import UserProfileSerializer

COLLECTION = "users"


@api_view(["POST"])
def register_profile(request):
    """
    Called right after a user signs up via Firebase Auth on the frontend.
    Creates their Firestore profile (default role: customer).
    """
    serializer = UserProfileSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    data["role"] = "customer"  # force customer role on self-registration; only Admin can change it later
    now = datetime.now(timezone.utc).isoformat()
    data["created_at"] = now
    data["updated_at"] = now

    doc_ref = db.collection(COLLECTION).document()
    doc_ref.set(data)

    data["id"] = doc_ref.id
    return Response(data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def get_my_profile(request):
    """Any logged-in user: get their own profile."""
    user = get_user_from_request(request)
    if user is None:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(user, status=status.HTTP_200_OK)


@api_view(["GET"])
@require_role("admin")
def list_users(request):
    """Admin only: view all users (customers, staff, riders)."""
    docs = db.collection(COLLECTION).stream()
    users = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        users.append(data)
    return Response(users, status=status.HTTP_200_OK)


@api_view(["PUT"])
@require_role("admin")
def update_user(request, user_id):
    """Admin only: change a user's role, suspend/activate account, etc."""
    doc_ref = db.collection(COLLECTION).document(user_id)
    doc = doc_ref.get()

    if not doc.exists:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserProfileSerializer(data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    doc_ref.update(data)

    updated_doc = doc_ref.get().to_dict()
    updated_doc["id"] = user_id
    return Response(updated_doc, status=status.HTTP_200_OK)