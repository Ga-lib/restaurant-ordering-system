from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from collections import Counter

from firebase.firebase_config import db
from utils.auth import require_role
from utils.gemini import ask_gemini

ORDERS_COLLECTION = "orders"
MENU_COLLECTION = "menu_items"


def gather_business_data():
    """Collects raw numbers the AI will reason over — no AI calls here, just aggregation."""
    orders = [doc.to_dict() for doc in db.collection(ORDERS_COLLECTION).stream()]
    menu_items = [doc.to_dict() for doc in db.collection(MENU_COLLECTION).stream()]

    completed_orders = [o for o in orders if o.get("status") == "completed"]
    total_revenue = sum(o.get("total_amount", 0) for o in completed_orders)

    item_counter = Counter()
    for order in completed_orders:
        for item in order.get("items", []):
            item_counter[item.get("name", "Unknown")] += item.get("quantity", 0)

    top_items = item_counter.most_common(5)

    order_type_counter = Counter(o.get("order_type") for o in orders)

    low_rated_items = [
        m for m in menu_items
        if m.get("rating_count", 0) > 0 and m.get("rating_average", 5) < 3.5
    ]

    return {
        "total_completed_orders": len(completed_orders),
        "total_revenue_tk": round(total_revenue, 2),
        "top_selling_items": top_items,
        "order_type_breakdown": dict(order_type_counter),
        "low_rated_items": [m.get("name") for m in low_rated_items],
        "total_menu_items": len(menu_items),
    }


@api_view(["GET"])
@require_role("admin")
def generate_ai_report(request):
    """Admin: get an AI-generated plain-English business insights report."""
    data = gather_business_data()

    prompt = f"""
You are a business analyst for a restaurant in Dhaka, Bangladesh. All money is in BDT (Tk).
Based on this real data, write a short, clear report (use markdown headers) with these sections:
1. Sales Summary
2. Most Popular Food Prediction (which items are trending, and a guess at why)
3. Customer Behavior Analysis (based on order type breakdown)
4. Recommendations (2-3 concrete, actionable suggestions)

Keep it concise — no more than 250 words total. Be specific and reference the actual numbers.

DATA:
- Total completed orders: {data['total_completed_orders']}
- Total revenue: {data['total_revenue_tk']} Tk
- Top selling items (name, quantity sold): {data['top_selling_items']}
- Order type breakdown: {data['order_type_breakdown']}
- Menu items with low ratings (under 3.5 stars): {data['low_rated_items']}
- Total menu items: {data['total_menu_items']}
"""

    ai_text = ask_gemini(prompt)

    if ai_text is None:
        return Response({
            "raw_data": data,
            "ai_report": None,
            "warning": "AI report generation is currently unavailable. Showing raw data only.",
        }, status=status.HTTP_200_OK)

    return Response({
        "raw_data": data,
        "ai_report": ai_text,
        "warning": None,
    }, status=status.HTTP_200_OK)