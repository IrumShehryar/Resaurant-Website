from flask import request
from .orders_model import (
    list_all_orders,
    get_order_by_id,
    add_order,
    update_order,
    delete_order,
)
from api.utils.simple_errors import simple_errors
from .orders_schema import OrdersSchema

# Reusable schema instances (like you do with UserSchema)
order_schema = OrdersSchema()
orders_schema = OrdersSchema(many=True)


def get_order():
    items = list_all_orders()
    items_json = orders_schema.dump(items)
    return items_json, 200


def get_order_controller(order_id):
    try:
        item = get_order_by_id(order_id)
    except (ValueError, TypeError):
        return {"error": "malformed input"}, 400

    if not item:
        return {"error": "Item not found"}, 404

    item_json = order_schema.dump(item)
    return item_json, 200


@simple_errors
def create_order_controller():
    data = request.get_json() or {}
    item = add_order(data)
    nice_item = order_schema.dump(item)
    return nice_item, 201


@simple_errors
def update_order_controller(order_id):
    data = request.get_json() or {}
    item = update_order(order_id, data)

    if not item:
        return {"error": "Item not found"}, 404

    nice_item = order_schema.dump(item)
    return nice_item, 200


@simple_errors
def delete_order_controller(order_id):
    deleted = delete_order(order_id)

    if not deleted:
        return {"error": "Item not found"}, 404

    return {"message": "Item deleted successfully"}, 200
