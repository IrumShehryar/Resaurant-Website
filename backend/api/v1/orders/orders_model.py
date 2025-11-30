from datetime import datetime

from mongoengine import (
    Document,
    StringField,
    IntField,
    DateTimeField,
)

from api.utils.validators import validate_order_fields


class Orders(Document):
    name = StringField(required=True, min_length=3, max_length=100)
    phone = StringField(required=True, min_length=7, max_length=15)
    email = StringField(required=True, max_length=100)

    status = StringField(
        required=True,
        choices=("pending", "confirmed", "cancelled"),
        default="pending",
    )

    # auto timestamp, no need for required=True
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "orders",
        "ordering": ["order_date", "order_time"],
    }

    def clean(self):
        """
        Custom validation logic for order.
        Runs automatically on .save()
        """
        validate_order_fields(
            name=self.name,
            email=self.email,
            phone=self.phone,
            order_date=self.order_date,
            order_time=self.order_time,
        )


def list_all_orders():
    """
    Return a queryset of all orders.
    """
    return Orders.objects()


def get_order_by_id(order_id):
    """
    Return a single order by id, or None if not found.
    """
    try:
        return Orders.objects.get(id=order_id)
    except Orders.DoesNotExist:
        return None


def add_order(order_data):
    """
    Create and save a new order from a dict.
    clean() will run automatically and raise ValidationError if needed.
    """
    new_order = Orders(
        name=order_data.get("name"),
        phone=order_data.get("phone"),
        email=order_data.get("email"),
        no_of_people=order_data.get("no_of_people"),
        order_date=order_data.get("order_date"),
        order_time=order_data.get("order_time"),
        status="pending",  # public orders always start as pending
    )

    new_order.save()
    return new_order


def update_order(order_id, order_data):
    """
    Update an existing order.
    (Name kept as 'update_order' so your existing imports don't break.)
    Returns the updated order or None if not found.
    """
    order = Orders.objects(id=order_id).first()
    if not order:
        return None

    updatable_fields = [
        "name",
        "phone",
        "email",
        "no_of_people",
        "order_date",
        "order_time",
        "status",
    ]

    for field in updatable_fields:
        if field in order_data:
            setattr(order, field, order_data[field])

    order.save()  # triggers clean()
    return order

def delete_order(order_id):
    order = Orders.objects(id=order_id).first()
    if not order:
        return False

    order.delete()
    return True