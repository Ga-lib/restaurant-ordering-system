from rest_framework import serializers

class MenuItemSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    price = serializers.FloatField(min_value=0)
    currency = serializers.CharField(default="BDT")
    category = serializers.CharField(max_length=100)
    ingredients = serializers.ListField(
        child=serializers.CharField(max_length=100), required=False, default=list
    )
    image_url = serializers.URLField(required=False, allow_blank=True)
    is_available = serializers.BooleanField(default=True)
    weather_tags = serializers.ListField(
        child=serializers.CharField(max_length=50), required=False, default=list
    )
    rating_average = serializers.FloatField(required=False, default=0)
    rating_count = serializers.IntegerField(required=False, default=0)