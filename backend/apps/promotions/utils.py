from datetime import datetime, timezone
from firebase.firebase_config import db

PROMOTIONS_COLLECTION = "promotions"


def calculate_discount(code, order_total):
    """
    Returns (discount_amount, error_message).
    If error_message is not None, the code is invalid and discount_amount is 0.
    """
    if not code:
        return 0, None

    code = code.strip().upper()
    docs = list(db.collection(PROMOTIONS_COLLECTION).where("code", "==", code).limit(1).stream())
    if not docs:
        return 0, "Invalid promo code"

    promo = docs[0].to_dict()

    if not promo.get("is_active", True):
        return 0, "This promo code is no longer active"

    expires_at = promo.get("expires_at")
    if expires_at and datetime.now(timezone.utc) > datetime.fromisoformat(expires_at):
        return 0, "This promo code has expired"

    min_amount = promo.get("min_order_amount", 0)
    if order_total < min_amount:
        return 0, f"Minimum order amount for this code is ৳{min_amount}"

    if promo.get("discount_type") == "percent":
        discount = round(order_total * (promo.get("discount_value", 0) / 100), 2)
    else:
        discount = min(promo.get("discount_value", 0), order_total)

    return discount, None