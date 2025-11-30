from datetime import datetime
from mongoengine import (
    Document,
    StringField,
    IntField,
    ListField,
    EmbeddedDocument,
    EmbeddedDocumentField,
    DateTimeField,
    FloatField
)

from api.utils.validators import validate_order_fields


# Embedded item structure
class OrderItem(EmbeddedDocument):
    item_name = StringField(required=True)
    quantity = IntField(required=True, min_value=1)


class Orders(Document):
    # Auto-filled from logged-in user OR provided manually
    name = StringField(required=True, min_length=3, max_length=100)
    phone = StringField(required=True, min_length=7, max_length=15)
    email = StringField(required=True, max_length=100)
    address = StringField(required=True, max_length=200)

    # Order items
    items = ListField(EmbeddedDocumentField(OrderItem), required=True)

    # Pricing
    subtotal = FloatField(required=True, min_value=0)
    delivery_charges = FloatField(required=True, min_value=0)
    total = FloatField(required=True, min_value=0)

    # Date & time
    order_date = StringField(required=True)  # format: YYYY-MM-DD
    order_time = StringField(required=True)  # format: HH:MM

    status = StringField(
        required=True,
        choices=("pending", "confirmed", "cancelled"),
        default="pending",
    )

    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "orders",
        "ordering": ["-created_at"],
    }

    def clean(self):
        """Custom validation logic."""
        validate_order_fields(
            name=self.name,
            email=self.email,
            phone=self.phone,
            order_date=self.order_date,
            order_time=self.order_time,
        )


# -------------------------------------------------
# MODEL HELPERS
# -------------------------------------------------

def list_all_orders():
    return Orders.objects()


def get_order_by_id(order_id):
    try:
        return Orders.objects.get(id=order_id)
    except Orders.DoesNotExist:
        return None


def add_order(order_data):
    # Convert items
    item_list = []
    for item in order_data.get("items", []):
        item_list.append(OrderItem(
            item_name=item["item_name"],
            quantity=item["quantity"]
        ))

    new_order = Orders(
        name=order_data["name"],
        phone=order_data["phone"],
        email=order_data["email"],
        address=order_data["address"],
        items=item_list,
        subtotal=order_data["subtotal"],
        delivery_charges=order_data["delivery_charges"],
        total=order_data["total"],
        order_date=order_data["order_date"],
        order_time=order_data["order_time"],
        status="pending",
    )

    new_order.save()
    return new_order


def update_order(order_id, order_data):
    order = Orders.objects(id=order_id).first()
    if not order:
        return None

    updatable_fields = [
        "name", "phone", "email", "address",
        "subtotal", "delivery_charges", "total",
        "order_date", "order_time", "status"
    ]

    for field in updatable_fields:
        if field in order_data:
            setattr(order, field, order_data[field])

    # update items if provided
    if "items" in order_data:
        new_items = []
        for item in order_data["items"]:
            new_items.append(OrderItem(
                item_name=item["item_name"],
                quantity=item["quantity"]
            ))
        order.items = new_items

    order.save()
    return order


def delete_order(order_id):
    order = Orders.objects(id=order_id).first()
    if not order:
        return False

    order.delete()
    return True
