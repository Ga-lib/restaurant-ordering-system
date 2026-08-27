from rest_framework import serializers

class ReviewSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    menu_item_id = serializers.CharField()
    order_id = serializers.CharField()
    customer_id = serializers.CharField(required=False)
    customer_name = serializers.CharField(max_length=200, required=False)
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(max_length=1000, required=False, allow_blank=True, default="")