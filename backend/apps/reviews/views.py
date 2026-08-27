from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone

from firebase.firebase_config import db
from utils.auth import get_user_from_request
from .serializers import ReviewSerializer

REVIEWS_COLLECTION = "reviews"
MENU_COLLECTION = "menu_items"
ORDERS_COLLECTION = "orders"


def recalculate_menu_item_rating(menu_item_id):
    """Recompute and store rating_average + rating_count on the menu item itself."""
    reviews = db.collection(REVIEWS_COLLECTION).where("menu_item_id", "==", menu_item_id).stream()
    ratings = [r.to_dict().get("rating", 0) for r in reviews]

    count = len(ratings)
    average = round(sum(ratings) / count, 2) if count > 0 else 0

    db.collection(MENU_COLLECTION).document(menu_item_id).update({
        "rating_average": average,
        "rating_count": count,
    })


@api_view(["GET"])
def list_reviews_for_item(request, menu_item_id):
    """Public: get all reviews for a specific menu item, newest first."""
    docs = db.collection(REVIEWS_COLLECTION).where("menu_item_id", "==", menu_item_id).stream()
    reviews = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        reviews.append(data)

    reviews.sort(key=lambda r: r.get("created_at", ""), reverse=True)
    return Response(reviews, status=status.HTTP_200_OK)


@api_view(["POST"])
def create_review(request):
    """
    Logged-in customer: submit a review, but ONLY if they have a completed
    order that actually contains this menu item (verified purchase).
    """
    user = get_user_from_request(request)
    if user is None:
        return Response({"error": "You must be logged in to leave a review"}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = ReviewSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    # Force customer identity from the verified token, never trust client input for this
    data["customer_id"] = user["firebase_uid"]
    data["customer_name"] = user.get("name", "Customer")

    # Verify the order exists, belongs to this customer, is completed, and contains this item
    order_doc = db.collection(ORDERS_COLLECTION).document(data["order_id"]).get()
    if not order_doc.exists:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    order = order_doc.to_dict()

    if order.get("customer_id") != user["firebase_uid"]:
        return Response({"error": "This order does not belong to you"}, status=status.HTTP_403_FORBIDDEN)

    if order.get("status") != "completed":
        return Response({"error": "You can only review items from a completed order"}, status=status.HTTP_400_BAD_REQUEST)

    item_ids_in_order = [item.get("menu_item_id") for item in order.get("items", [])]
    if data["menu_item_id"] not in item_ids_in_order:
        return Response({"error": "This item was not part of that order"}, status=status.HTTP_400_BAD_REQUEST)

    # Prevent duplicate reviews for the same item from the same order
    existing = db.collection(REVIEWS_COLLECTION) \
        .where("order_id", "==", data["order_id"]) \
        .where("menu_item_id", "==", data["menu_item_id"]) \
        .limit(1).stream()
    if list(existing):
        return Response({"error": "You already reviewed this item for this order"}, status=status.HTTP_400_BAD_REQUEST)

    data["created_at"] = datetime.now(timezone.utc).isoformat()

    doc_ref = db.collection(REVIEWS_COLLECTION).document()
    doc_ref.set(data)

    recalculate_menu_item_rating(data["menu_item_id"])

    data["id"] = doc_ref.id
    return Response(data, status=status.HTTP_201_CREATED)