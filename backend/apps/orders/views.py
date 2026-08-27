from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone, timedelta
from utils.auth import require_role
from firebase.firebase_config import db
from .serializers import OrderSerializer
from collections import defaultdict
from apps.promotions.utils import calculate_discount
from utils.auth import get_user_from_request

COLLECTION = "orders"


@api_view(["GET"])
def list_orders(request):
    """Get all orders. Supports optional ?status= and ?order_type= filters."""
    status_filter = request.query_params.get("status")
    type_filter = request.query_params.get("order_type")

    query = db.collection(COLLECTION)

    if status_filter:
        query = query.where("status", "==", status_filter)
    if type_filter:
        query = query.where("order_type", "==", type_filter)

    docs = query.stream()
    orders = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        orders.append(data)

    # Most recent first
    orders.sort(key=lambda o: o.get("created_at", ""), reverse=True)
    return Response(orders, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_order(request, order_id):
    """Get a single order by id (used for order tracking page)."""
    doc_ref = db.collection(COLLECTION).document(order_id)
    doc = doc_ref.get()

    if not doc.exists:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    data = doc.to_dict()
    data["id"] = doc.id
    return Response(data, status=status.HTTP_200_OK)


@api_view(["POST"])
def create_order(request):
    """Customer: place a new order (dine-in, takeaway, or online)."""
    serializer = OrderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data

    # Calculate subtotals + total (never trust client-sent totals)
    total = 0
    for item in data["items"]:
        item["subtotal"] = item["price"] * item["quantity"]
        total += item["subtotal"]
    data["total_amount"] = total

    # Apply promo code discount, if any (server recalculates, never trusts client)
    discount_amount = 0
    promo_code = data.get("promo_code")
    if promo_code:
        discount_amount, error = calculate_discount(promo_code, total)
        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

    # Apply loyalty points redemption, if requested (10 points = ৳1, capped so total never goes below 0)
    points_to_redeem = data.get("loyalty_points_redeemed", 0)
    points_discount = 0
    if points_to_redeem > 0:
        customer_id = data.get("customer_id")
        user_docs = list(db.collection("users").where("firebase_uid", "==", customer_id).limit(1).stream())
        if not user_docs:
            return Response({"error": "Customer profile not found for loyalty redemption"}, status=status.HTTP_400_BAD_REQUEST)

        user_doc = user_docs[0]
        current_points = user_doc.to_dict().get("loyalty_points", 0)
        if points_to_redeem > current_points:
            return Response({"error": "You don't have enough loyalty points"}, status=status.HTTP_400_BAD_REQUEST)

        points_discount = min(points_to_redeem / 10, total - discount_amount)
        user_doc.reference.update({"loyalty_points": current_points - points_to_redeem})

    total_discount = round(discount_amount + points_discount, 2)
    discounted_subtotal = round(total - total_discount, 2)

    # Apply tax + service charge from restaurant settings (on the discounted subtotal)
    settings_doc = db.collection("restaurant_settings").document("main").get()
    settings_data = settings_doc.to_dict() if settings_doc.exists else {}
    tax_percent = settings_data.get("tax_percent", 0)
    service_charge_percent = settings_data.get("service_charge_percent", 0)

    tax_amount = round(discounted_subtotal * (tax_percent / 100), 2)
    service_charge_amount = round(discounted_subtotal * (service_charge_percent / 100), 2)

    data["discount_amount"] = total_discount
    data["tax_percent"] = tax_percent
    data["tax_amount"] = tax_amount
    data["service_charge_percent"] = service_charge_percent
    data["service_charge_amount"] = service_charge_amount
    data["final_amount"] = round(discounted_subtotal + tax_amount + service_charge_amount, 2)

    now = datetime.now(timezone.utc).isoformat()
    data["created_at"] = now
    data["updated_at"] = now
    data["status"] = "placed"
    data["payment_status"] = "unpaid"

    doc_ref = db.collection(COLLECTION).document()
    doc_ref.set(data)

    if data["order_type"] == "dine_in" and data.get("table_id"):
        table_ref = db.collection("tables").document(data["table_id"])
        if table_ref.get().exists:
            table_ref.update({"status": "reserved", "updated_at": now})

    data["id"] = doc_ref.id
    return Response(data, status=status.HTTP_201_CREATED)



@api_view(["PUT"])
@require_role("admin", "kitchen", "waiter", "rider")
def update_order_status(request, order_id):
    """Kitchen/Waiter/Rider/Admin: update order status as it progresses."""
    doc_ref = db.collection(COLLECTION).document(order_id)
    doc = doc_ref.get()

    if not doc.exists:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status")
    valid_statuses = [
        "placed", "confirmed", "preparing", "ready",
        "served", "picked_up", "out_for_delivery",
        "delivered", "completed", "cancelled",
    ]
    if new_status not in valid_statuses:
        return Response({"error": f"Invalid status. Must be one of {valid_statuses}"}, status=status.HTTP_400_BAD_REQUEST)

    update_data = {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}

    # Allow setting estimated ready time in the same call (e.g. kitchen sets ETA)
    if "estimated_ready_at" in request.data:
        update_data["estimated_ready_at"] = request.data["estimated_ready_at"]

    doc_ref.update(update_data)

    # Award loyalty points when an order is completed: 1 point per 20 Tk spent (final_amount)
    if new_status == "completed":
        order_data = doc_ref.get().to_dict()
        customer_id = order_data.get("customer_id")
        final_amount = order_data.get("final_amount", order_data.get("total_amount", 0))

        if customer_id and customer_id != "guest":
            user_docs = list(db.collection("users").where("firebase_uid", "==", customer_id).limit(1).stream())
            if user_docs:
                user_doc = user_docs[0]
                current_points = user_doc.to_dict().get("loyalty_points", 0)
                earned_points = int(final_amount // 20)
                user_doc.reference.update({"loyalty_points": current_points + earned_points})

    updated_doc = doc_ref.get().to_dict()
    updated_doc["id"] = order_id
    return Response(updated_doc, status=status.HTTP_200_OK)


@api_view(["PUT"])
@require_role("admin", "waiter")
def update_payment(request, order_id):
    """Admin/Waiter: mark payment as verified/paid, or refunded."""
    doc_ref = db.collection(COLLECTION).document(order_id)
    doc = doc_ref.get()

    if not doc.exists:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    payment_status = request.data.get("payment_status")
    payment_method = request.data.get("payment_method")

    if payment_status not in ["unpaid", "paid", "refunded"]:
        return Response({"error": "Invalid payment_status"}, status=status.HTTP_400_BAD_REQUEST)

    update_data = {
        "payment_status": payment_status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if payment_method:
        update_data["payment_method"] = payment_method

    doc_ref.update(update_data)

    updated_doc = doc_ref.get().to_dict()
    updated_doc["id"] = order_id
    return Response(updated_doc, status=status.HTTP_200_OK)


@api_view(["POST"])
def cancel_order(request, order_id):
    """Customer/Admin: cancel an order."""
    doc_ref = db.collection(COLLECTION).document(order_id)
    doc = doc_ref.get()

    if not doc.exists:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    now = datetime.now(timezone.utc).isoformat()
    doc_ref.update({"status": "cancelled", "updated_at": now})

    updated_doc = doc_ref.get().to_dict()
    updated_doc["id"] = order_id
    return Response(updated_doc, status=status.HTTP_200_OK)

@api_view(["GET"])
@require_role("admin")
def get_order_stats(request):
    """Admin dashboard: sales totals and recent activity, computed from all orders."""
    docs = db.collection(COLLECTION).stream()
    all_orders = [doc.to_dict() for doc in docs]

    now = datetime.now(timezone.utc)
    today_str = now.date().isoformat()

    total_sales_today = 0
    total_sales_week = 0
    total_sales_month = 0
    active_orders_count = 0
    completed_orders_count = 0
    sales_by_day = defaultdict(float)
    orders_by_day = defaultdict(int)

    for order in all_orders:
        status_ = order.get("status")
        amount = order.get("total_amount", 0)

        if status_ not in ["completed", "cancelled"]:
            active_orders_count += 1

        if status_ == "completed":
            completed_orders_count += 1

            created_str = order.get("created_at", "")
            if not created_str:
                continue
            created_at = datetime.fromisoformat(created_str)
            day_str = created_at.date().isoformat()

            sales_by_day[day_str] += amount
            orders_by_day[day_str] += 1

            if day_str == today_str:
                total_sales_today += amount
            if (now - created_at).days <= 7:
                total_sales_week += amount
            if (now - created_at).days <= 30:
                total_sales_month += amount

    # Build last 7 days as a clean, ordered list for the chart (fills in ৳0 days)
    last_7_days = []
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).date().isoformat()
        last_7_days.append({
            "date": day,
            "sales": round(sales_by_day.get(day, 0), 2),
            "orders": orders_by_day.get(day, 0),
        })

    return Response({
        "total_sales_today": round(total_sales_today, 2),
        "total_sales_week": round(total_sales_week, 2),
        "total_sales_month": round(total_sales_month, 2),
        "active_orders_count": active_orders_count,
        "completed_orders_count": completed_orders_count,
        "total_orders_count": len(all_orders),
        "last_7_days": last_7_days,
    }, status=status.HTTP_200_OK)
    
@api_view(["GET"])
def list_my_orders(request):
    """Logged-in customer: get only their own orders, newest first."""
    user = get_user_from_request(request)
    if user is None:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    docs = db.collection(COLLECTION).where("customer_id", "==", user["firebase_uid"]).stream()
    orders = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        orders.append(data)

    orders.sort(key=lambda o: o.get("created_at", ""), reverse=True)
    return Response(orders, status=status.HTTP_200_OK)