from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone

from firebase.firebase_config import db
from utils.auth import require_role
from .serializers import PromotionSerializer

COLLECTION = "promotions"


@api_view(["GET"])
@require_role("admin")
def list_promotions(request):
    """Admin: view all promo codes."""
    docs = db.collection(COLLECTION).stream()
    promos = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        promos.append(data)
    return Response(promos, status=status.HTTP_200_OK)


@api_view(["POST"])
@require_role("admin")
def create_promotion(request):
    """Admin: create a new promo code."""
    serializer = PromotionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    data["code"] = data["code"].strip().upper()
    data["created_at"] = datetime.now(timezone.utc).isoformat()

    doc_ref = db.collection(COLLECTION).document()
    doc_ref.set(data)
    data["id"] = doc_ref.id
    return Response(data, status=status.HTTP_201_CREATED)


@api_view(["PUT"])
@require_role("admin")
def update_promotion(request, promo_id):
    """Admin: edit or deactivate a promo code."""
    doc_ref = db.collection(COLLECTION).document(promo_id)
    doc = doc_ref.get()
    if not doc.exists:
        return Response({"error": "Promotion not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = PromotionSerializer(data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    if "code" in data:
        data["code"] = data["code"].strip().upper()

    doc_ref.update(data)
    updated = doc_ref.get().to_dict()
    updated["id"] = promo_id
    return Response(updated, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@require_role("admin")
def delete_promotion(request, promo_id):
    """Admin: delete a promo code."""
    doc_ref = db.collection(COLLECTION).document(promo_id)
    if not doc_ref.get().exists:
        return Response({"error": "Promotion not found"}, status=status.HTTP_404_NOT_FOUND)
    doc_ref.delete()
    return Response({"message": "Promotion deleted"}, status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def validate_promotion(request):
    """Public: customer enters a code at checkout, we return the discount for their order total."""
    from .utils import calculate_discount

    code = request.data.get("code", "")
    order_total = request.data.get("order_total", 0)

    discount_amount, error = calculate_discount(code, order_total)
    if error:
        return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        "code": code.strip().upper(),
        "discount_amount": discount_amount,
        "new_total": round(order_total - discount_amount, 2),
    }, status=status.HTTP_200_OK)