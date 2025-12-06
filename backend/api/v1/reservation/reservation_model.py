"""
reservation_model.py

MongoEngine model for reservations, including validation and custom logic.
"""

from datetime import datetime

from mongoengine import (
    Document,
    StringField,
    IntField,
    DateTimeField,
)

from api.utils.validators import validate_reservation_fields


class ReserveTable(Document):
    """
    MongoEngine document for table reservations, including user info, reservation details, and status.
    """
    name = StringField(required=True, min_length=3, max_length=100)
    phone = StringField(required=True, min_length=7, max_length=15)
    email = StringField(required=True, max_length=100)

    no_of_people = IntField(required=True, min_value=1, max_value=20)

    reservation_date = StringField(required=True)   # "YYYY-MM-DD"
    reservation_time = StringField(required=True)   # "HH:MM"

    status = StringField(
        required=True,
        choices=("pending", "confirmed", "cancelled"),
        default="pending",
    )

    # auto timestamp, no need for required=True
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "reservations",
        "ordering": ["reservation_date", "reservation_time"],
    }

    def clean(self):
        """
        Custom validation logic for reservation. Runs automatically on .save().
        """
        validate_reservation_fields(
            name=self.name,
            email=self.email,
            phone=self.phone,
            no_of_people=self.no_of_people,
            reservation_date=self.reservation_date,
            reservation_time=self.reservation_time,
        )


def list_all_reservations():
    """
    Return a queryset of all reservations.
    """
    return ReserveTable.objects()


def get_reservation_by_id(reservation_id):
    """
    Return a single reservation by ID.
    """
    try:
        return ReserveTable.objects.get(id=reservation_id)
    except ReserveTable.DoesNotExist:
        return None


def add_reservation(reservation_data):
    """
    Create and save a new reservation from a dict.
    clean() will run automatically and raise ValidationError if needed.
    """
    new_reservation = ReserveTable(
        name=reservation_data.get("name"),
        phone=reservation_data.get("phone"),
        email=reservation_data.get("email"),
        no_of_people=reservation_data.get("no_of_people"),
        reservation_date=reservation_data.get("reservation_date"),
        reservation_time=reservation_data.get("reservation_time"),
        status="pending",  # public reservations always start as pending
    )

    new_reservation.save()
    return new_reservation


def update_reservation(reservation_id, reservation_data):
    """
    Update an existing reservation.
    (Name kept as 'update_reservarion' so your existing imports don't break.)
    Returns the updated reservation or None if not found.
    """
    reservation = ReserveTable.objects(id=reservation_id).first()
    if not reservation:
        return None

    updatable_fields = [
        "name",
        "phone",
        "email",
        "no_of_people",
        "reservation_date",
        "reservation_time",
        "status",
    ]

    for field in updatable_fields:
        if field in reservation_data:
            setattr(reservation, field, reservation_data[field])

    reservation.save()  # triggers clean()
    return reservation

def delete_reservation(reservation_id):
    reservation = ReserveTable.objects(id=reservation_id).first()
    if not reservation:
        return False

    reservation.delete()
    return True