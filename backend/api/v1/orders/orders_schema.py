from marshmallow_mongoengine import ModelSchema
from api.v1.orders.orders_model import Orders

class OrdersSchema(ModelSchema):
    class Meta:
        model = Orders
        # Explicitly list the fields you want to expose
        fields = (
            "id",
            "name",
            "phone",
            "email",
            "no_of_people",
            "order_date",
            "order_time",
            "status",
            "created_at",
        )
