from rest_framework import serializers

class PromotionSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    code = serializers.CharField(max_length=30)
    discount_type = serializers.ChoiceField(choices=["percent", "fixed"])
    discount_value = serializers.FloatField(min_value=0)
    min_order_amount = serializers.FloatField(min_value=0, default=0)
    is_active = serializers.BooleanField(default=True)
    expires_at = serializers.CharField(required=False, allow_null=True, default=None)