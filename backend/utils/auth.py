from firebase_admin import auth as firebase_auth
from firebase.firebase_config import db
from rest_framework.response import Response
from rest_framework import status
from functools import wraps


def get_user_from_request(request):
    """
    Reads the 'Authorization: Bearer <token>' header, verifies it with Firebase,
    and returns the matching Firestore user profile (with role). Returns None if invalid.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    id_token = auth_header.split("Bearer ")[1]

    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
    except Exception:
        return None

    firebase_uid = decoded_token.get("uid")

    users_ref = db.collection("users").where("firebase_uid", "==", firebase_uid).limit(1)
    docs = list(users_ref.stream())

    if not docs:
        return None

    user_data = docs[0].to_dict()
    user_data["id"] = docs[0].id
    return user_data


def require_role(*allowed_roles):
    """
    Decorator to protect a view so only certain roles can access it.
    Usage: @require_role("admin")  or  @require_role("admin", "kitchen")
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            user = get_user_from_request(request)

            if user is None:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

            if not user.get("is_active", True):
                return Response({"error": "Account is suspended"}, status=status.HTTP_403_FORBIDDEN)

            if user.get("role") not in allowed_roles:
                return Response({"error": "You do not have permission for this action"}, status=status.HTTP_403_FORBIDDEN)

            request.current_user = user
            return view_func(request, *args, **kwargs)

        return wrapped_view
    return decorator