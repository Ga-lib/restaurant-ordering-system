from rest_framework import serializers

class TableSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    table_number = serializers.IntegerField()
    seat_capacity = serializers.IntegerField(min_value=1)
    status = serializers.ChoiceField(
        choices=["available", "held", "reserved"], default="available"
    )
    reserved_by = serializers.CharField(required=False, allow_null=True, default=None)
    reserved_at = serializers.CharField(required=False, allow_null=True, default=None)
    hold_expires_at = serializers.CharField(required=False, allow_null=True, default=None)
    needs_cleaning = serializers.BooleanField(default=False)