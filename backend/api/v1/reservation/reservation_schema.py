"""
reservation_schema.py

Defines Marshmallow schema for ReserveTable model for API serialization.
"""

from marshmallow_mongoengine import ModelSchema
from backend.api.v1.reservation.reservation_model import ReserveTable

class ReservationSchema(ModelSchema):
    """
    Marshmallow schema for serializing ReserveTable objects for the API.
    """
    class Meta:
        model = ReserveTable
        # Explicitly list the fields you want to expose
        fields = (
            "id",
            "name",
            "phone",
            "email",
            "no_of_people",
            "reservation_date",
            "reservation_time",
            "status",
            "created_at",
        )
