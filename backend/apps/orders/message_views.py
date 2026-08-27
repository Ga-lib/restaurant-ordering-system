from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone

from firebase.firebase_config import db
from utils.auth import get_user_from_request, require_role

MESSAGES_COLLECTION = "order_messages"
ORDERS_COLLECTION = "orders"


@api_view(["GET"])
def list_order_messages(request, order_id):
    """
    Get all messages for an order, oldest first.
    Allowed: the customer who owns the order, or any staff (admin/kitchen/waiter/rider).
    """
    user = get_user_from_request(request)
    if user is None:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    order_doc = db.collection(ORDERS_COLLECTION).document(order_id).get()
    if not order_doc.exists:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    order = order_doc.to_dict()
    is_owner = order.get("customer_id") == user["firebase_uid"]
    is_staff = user.get("role") in ["admin", "kitchen", "waiter", "rider"]

    if not is_owner and not is_staff:
        return Response({"error": "You do not have permission to view this"}, status=status.HTTP_403_FORBIDDEN)

    docs = db.collection(MESSAGES_COLLECTION).where("order_id", "==", order_id).stream()
    messages = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        messages.append(data)

    messages.sort(key=lambda m: m.get("created_at", ""))
    return Response(messages, status=status.HTTP_200_OK)


@api_view(["POST"])
def send_order_message(request, order_id):
    """
    Send a message on an order's thread.
    Allowed: the customer who owns the order, or any staff.
    """
    user = get_user_from_request(request)
    if user is None:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    order_doc = db.collection(ORDERS_COLLECTION).document(order_id).get()
    if not order_doc.exists:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    order = order_doc.to_dict()
    is_owner = order.get("customer_id") == user["firebase_uid"]
    is_staff = user.get("role") in ["admin", "kitchen", "waiter", "rider"]

    if not is_owner and not is_staff:
        return Response({"error": "You do not have permission to message on this order"}, status=status.HTTP_403_FORBIDDEN)

    message_text = request.data.get("message", "").strip()
    if not message_text:
        return Response({"error": "Message cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)

    data = {
        "order_id": order_id,
        "sender_role": user.get("role"),
        "sender_name": user.get("name", "Unknown"),
        "message": message_text,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    doc_ref = db.collection(MESSAGES_COLLECTION).document()
    doc_ref.set(data)

    data["id"] = doc_ref.id
    return Response(data, status=status.HTTP_201_CREATED)