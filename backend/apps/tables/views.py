from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone, timedelta
from utils.auth import require_role
from firebase.firebase_config import db
from .serializers import TableSerializer

COLLECTION = "tables"
HOLD_DURATION_MINUTES = 3


@api_view(["GET"])
def list_tables(request):
    """Get all tables with their live status (for the floor plan view)."""
    now = datetime.now(timezone.utc)
    docs = db.collection(COLLECTION).stream()
    tables = []

    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id

        # Auto-release expired holds so the floor plan is always accurate
        if data.get("status") == "held" and data.get("hold_expires_at"):
            expires_at = datetime.fromisoformat(data["hold_expires_at"])
            if now > expires_at:
                doc.reference.update({
                    "status": "available",
                    "hold_expires_at": None,
                    "updated_at": now.isoformat(),
                })
                data["status"] = "available"
                data["hold_expires_at"] = None

        tables.append(data)

    tables.sort(key=lambda t: t.get("table_number", 0))
    return Response(tables, status=status.HTTP_200_OK)



@api_view(["POST"])
@require_role("admin")
def create_table(request):
    """Admin: add a new table to the floor plan."""
    serializer = TableSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data

    existing = list(
        db.collection(COLLECTION).where("table_number", "==", data["table_number"]).limit(1).stream()
    )
    if existing:
        return Response(
            {"error": f"Table {data['table_number']} already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    now = datetime.now(timezone.utc).isoformat()
    data["created_at"] = now
    data["updated_at"] = now

    doc_ref = db.collection(COLLECTION).document()
    doc_ref.set(data)

    data["id"] = doc_ref.id
    return Response(data, status=status.HTTP_201_CREATED)



@api_view(["PUT"])
@require_role("admin")
def update_table(request, table_id):
    """Admin: edit table details (seat capacity, etc.) or manually fix status."""
    doc_ref = db.collection(COLLECTION).document(table_id)
    doc = doc_ref.get()

    if not doc.exists:
        return Response({"error": "Table not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = TableSerializer(data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data

    if "table_number" in data:
        duplicates = list(
            db.collection(COLLECTION).where("table_number", "==", data["table_number"]).stream()
        )
        if any(d.id != table_id for d in duplicates):
            return Response(
                {"error": f"Table {data['table_number']} already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    doc_ref.update(data)

    updated_doc = doc_ref.get().to_dict()
    updated_doc["id"] = table_id
    return Response(updated_doc, status=status.HTTP_200_OK)



@api_view(["DELETE"])
@require_role("admin")
def delete_table(request, table_id):
    """Admin: remove a table from the floor plan."""
    doc_ref = db.collection(COLLECTION).document(table_id)
    doc = doc_ref.get()

    if not doc.exists:
        return Response({"error": "Table not found"}, status=status.HTTP_404_NOT_FOUND)

    doc_ref.delete()
    return Response({"message": "Table deleted"}, status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def hold_table(request, table_id):
    """Customer: place a short 3-minute hold on a table while completing reservation."""
    doc_ref = db.collection(COLLECTION).document(table_id)
    doc = doc_ref.get()

    if not doc.exists:
        return Response({"error": "Table not found"}, status=status.HTTP_404_NOT_FOUND)

    table = doc.to_dict()
    now = datetime.now(timezone.utc)

    # Check if table is genuinely free (available, or an expired hold)
    if table.get("status") == "reserved":
        return Response({"error": "Table is already reserved"}, status=status.HTTP_409_CONFLICT)

    if table.get("status") == "held":
        expires_at_str = table.get("hold_expires_at")
        if expires_at_str:
            expires_at = datetime.fromisoformat(expires_at_str)
            if now < expires_at:
                return Response({"error": "Table is currently held by another customer"}, status=status.HTTP_409_CONFLICT)
            # else: hold expired, allow it to be taken

    hold_expires_at = now + timedelta(minutes=HOLD_DURATION_MINUTES)

    doc_ref.update({
        "status": "held",
        "hold_expires_at": hold_expires_at.isoformat(),
        "updated_at": now.isoformat(),
    })

    updated_doc = doc_ref.get().to_dict()
    updated_doc["id"] = table_id
    return Response(updated_doc, status=status.HTTP_200_OK)


@api_view(["POST"])
def confirm_reservation(request, table_id):
    """Customer: confirm the reservation before the hold expires."""
    customer_id = request.data.get("customer_id", "guest")  # temporary until Auth app exists

    doc_ref = db.collection(COLLECTION).document(table_id)
    doc = doc_ref.get()

    if not doc.exists:
        return Response({"error": "Table not found"}, status=status.HTTP_404_NOT_FOUND)

    table = doc.to_dict()
    now = datetime.now(timezone.utc)

    if table.get("status") != "held":
        return Response({"error": "Table must be held before confirming"}, status=status.HTTP_400_BAD_REQUEST)

    expires_at_str = table.get("hold_expires_at")
    if expires_at_str:
        expires_at = datetime.fromisoformat(expires_at_str)
        if now > expires_at:
            doc_ref.update({"status": "available", "hold_expires_at": None})
            return Response({"error": "Hold expired, please try again"}, status=status.HTTP_410_GONE)

    doc_ref.update({
        "status": "reserved",
        "reserved_by": customer_id,
        "reserved_at": now.isoformat(),
        "hold_expires_at": None,
        "updated_at": now.isoformat(),
    })

    updated_doc = doc_ref.get().to_dict()
    updated_doc["id"] = table_id
    return Response(updated_doc, status=status.HTTP_200_OK)



@api_view(["POST"])
@require_role("admin", "waiter")
def release_table(request, table_id):
    """Waiter: mark table free again after checkout (with cleaning flag)."""
    doc_ref = db.collection(COLLECTION).document(table_id)
    doc = doc_ref.get()

    if not doc.exists:
        return Response({"error": "Table not found"}, status=status.HTTP_404_NOT_FOUND)

    now = datetime.now(timezone.utc).isoformat()
    doc_ref.update({
        "status": "available",
        "reserved_by": None,
        "reserved_at": None,
        "hold_expires_at": None,
        "needs_cleaning": True,
        "updated_at": now,
    })

    updated_doc = doc_ref.get().to_dict()
    updated_doc["id"] = table_id
    return Response(updated_doc, status=status.HTTP_200_OK)