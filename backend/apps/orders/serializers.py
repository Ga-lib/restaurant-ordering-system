from rest_framework import serializers


class OrderItemSerializer(serializers.Serializer):
    menu_item_id = serializers.CharField()
    name = serializers.CharField()
    price = serializers.FloatField(min_value=0)
    quantity = serializers.IntegerField(min_value=1)
    subtotal = serializers.FloatField(min_value=0, required=False)


class OrderSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    order_type = serializers.ChoiceField(choices=["dine_in", "takeaway", "online"])
    table_id = serializers.CharField(required=False, allow_null=True, default=None)
    customer_id = serializers.CharField(required=False, default="guest")
    items = OrderItemSerializer(many=True)
    total_amount = serializers.FloatField(read_only=True, required=False)
    currency = serializers.CharField(default="BDT")
    
    promo_code = serializers.CharField(required=False, allow_null=True, allow_blank=True, default=None)
    discount_amount = serializers.FloatField(read_only=True, required=False, default=0)
    final_amount = serializers.FloatField(read_only=True, required=False)
    loyalty_points_redeemed = serializers.IntegerField(required=False, default=0)
    
    tax_percent = serializers.FloatField(read_only=True, required=False, default=0)
    tax_amount = serializers.FloatField(read_only=True, required=False, default=0)
    service_charge_percent = serializers.FloatField(read_only=True, required=False, default=0)
    service_charge_amount = serializers.FloatField(read_only=True, required=False, default=0)
    
    status = serializers.ChoiceField(
        choices=[
            "placed", "confirmed", "preparing", "ready",
            "served", "picked_up", "out_for_delivery",
            "delivered", "completed", "cancelled",
        ],
        default="placed",
    )
    payment_method = serializers.ChoiceField(
        choices=["bkash", "nagad", "card", "cash_on_delivery", "cash_at_counter", "offline"],
        required=False, allow_null=True, default=None,
    )
    payment_status = serializers.ChoiceField(
        choices=["unpaid", "paid", "refunded"], default="unpaid"
    )
    estimated_ready_at = serializers.CharField(required=False, allow_null=True, default=None)
    delivery_address = serializers.CharField(required=False, allow_null=True, default=None, allow_blank=True)
    special_instructions = serializers.CharField(required=False, allow_blank=True, default="")