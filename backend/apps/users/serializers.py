from rest_framework import serializers

class UserProfileSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    firebase_uid = serializers.CharField()
    name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    role = serializers.ChoiceField(
    choices=["customer", "admin", "kitchen", "waiter", "rider"],
    required=False,
    default="customer",
)
    is_active = serializers.BooleanField(default=True)
    loyalty_points = serializers.IntegerField(required=False, default=0)