from marshmallow_mongoengine import ModelSchema
from api.v1.orders.orders_model import Orders, OrderItem


# ------------------------------
# OrderItem Schema
# ------------------------------
class OrderItemSchema(ModelSchema):
    class Meta:
        model = OrderItem
        fields = ("item_name", "quantity")


# ------------------------------
# Orders Schema
# ------------------------------
class OrdersSchema(ModelSchema):
    class Meta:
        model = Orders
        fields = (
            "id",
            "name",
            "phone",
            "email",
            "address",
            "payment_method",  # <-- added this field
            "items",
            "subtotal",
            "delivery_charges",
            "total",
            "order_date",
            "order_time",
            "status",
            "created_at",
        )
