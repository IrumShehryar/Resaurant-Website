"""
orders_schema.py

Defines Marshmallow schemas for Orders and OrderItem models for API serialization.
"""

from marshmallow_mongoengine import ModelSchema
from api.v1.orders.orders_model import Orders, OrderItem


# ------------------------------
# OrderItem Schema
# ------------------------------
class OrderItemSchema(ModelSchema):
    """
    Marshmallow schema for serializing OrderItem objects for the API.
    """
    class Meta:
        model = OrderItem
        fields = ("item_name", "quantity")


# ------------------------------
# Orders Schema
# ------------------------------
class OrdersSchema(ModelSchema):
    """
    Marshmallow schema for serializing Orders objects for the API.
    """
    class Meta:
        model = Orders
        fields = (
            "id",
            "name",
            "phone",
            "email",
            "address",
            "payment_method",
            "items",
            "subtotal",
            "delivery_charges",
            "total",
            "order_date",
            "order_time",
            "status",
            "created_at",
        )
