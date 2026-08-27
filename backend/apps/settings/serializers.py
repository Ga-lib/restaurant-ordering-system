from rest_framework import serializers

class RestaurantSettingsSerializer(serializers.Serializer):
    restaurant_name = serializers.CharField(max_length=200)
    address = serializers.CharField(max_length=500, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    opening_time = serializers.CharField(max_length=10, required=False, default="10:00")
    closing_time = serializers.CharField(max_length=10, required=False, default="22:00")
    tax_percent = serializers.FloatField(min_value=0, max_value=100, default=0)
    service_charge_percent = serializers.FloatField(min_value=0, max_value=100, default=0)
    latitude = serializers.FloatField(required=False, default=23.8703)
    longitude = serializers.FloatField(required=False, default=90.3960)