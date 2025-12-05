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



# ------------------------------
# Embedded item structure
# ------------------------------
class OrderItem(EmbeddedDocument):
    item_name = StringField(required=True)
    quantity = IntField(required=True, min_value=1)


# ------------------------------
# Orders Model
# ------------------------------
class Orders(Document):
    # Customer info
    name = StringField(required=True, min_length=3, max_length=100)
    phone = StringField(required=True, min_length=7, max_length=15)
    email = StringField(required=True, max_length=100)
    address = StringField(required=True, max_length=200)
    payment_method = StringField(
        required=True,
        choices=("cash", "card", "paypal"),  # Add other payment methods if needed
        default="cash"
    )

    # Order items
    items = ListField(EmbeddedDocumentField(OrderItem), required=True)

    # Pricing
    subtotal = FloatField(required=True, min_value=0)
    delivery_charges = FloatField(required=True, min_value=0)
    total = FloatField(required=True, min_value=0)

    # Date & time
    order_date = StringField(required=True)  # format: YYYY-MM-DD
    order_time = StringField(required=True)  # format: HH:MM

    # Order status
    status = StringField(
        required=True,
        choices=("pending", "ready", "completed","cancelled"),
        default="pending",
    )

    # Timestamp
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
            address=self.address,
            items=self.items,
            subtotal=self.subtotal,
            delivery_charges=self.delivery_charges,
            total=self.total,
            payment_method=self.payment_method,
            status=self.status,
            order_date=self.order_date,
            order_time=self.order_time,
        )


# ------------------------------
# Model Helpers
# ------------------------------

def list_all_orders():
    return Orders.objects()


def get_order_by_id(order_id):
    try:
        return Orders.objects.get(id=order_id)
    except Orders.DoesNotExist:
        return None


def add_order(order_data):
    """Adds a new order to the database."""
    # Convert items from frontend format to OrderItem
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
        payment_method=order_data.get("payment_method", "cash"),
        items=item_list,
        subtotal=order_data["subtotal"],
        delivery_charges=order_data["delivery_charges"],
        total=order_data["total"],
        order_date=order_data["order_date"],
        order_time=order_data["order_time"],
        status="pending"
    )

    new_order.save()
    return new_order


def update_order(order_id, order_data):
    order = Orders.objects(id=order_id).first()
    if not order:
        return None

    updatable_fields = [
        "name", "phone", "email", "address", "payment_method",
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

    # Validate all fields before saving
   
    validate_order_fields(
        name=order.name,
        email=order.email,
        phone=order.phone,
        address=order.address,
        items=[{"item_name": i.item_name, "quantity": i.quantity} for i in order.items],
        subtotal=order.subtotal,
        delivery_charges=order.delivery_charges,
        total=order.total,
        payment_method=order.payment_method,
        status=order.status,
        order_date=order.order_date,
        order_time=order.order_time,
    )

    order.save()
    return order


def delete_order(order_id):
    order = Orders.objects(id=order_id).first()
    if not order:
        return False

    order.delete()
    return True
