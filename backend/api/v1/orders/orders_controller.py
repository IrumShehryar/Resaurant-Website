"""
orders_controller.py

Controller helpers for the orders JSON API. Handles CRUD operations and session-based user info for orders.
"""

from flask import request, session
from .orders_model import (
    list_all_orders,
    get_order_by_id,
    add_order,
    update_order,
    delete_order,
)
from backend.api.utils.simple_errors import simple_errors
from backend.api.v1.users.users_model import User
from .orders_schema import OrdersSchema

# Schema instances
order_schema = OrdersSchema()
orders_schema = OrdersSchema(many=True)


# --------------------------------------------------------
# GET ALL ORDERS
# --------------------------------------------------------
def get_order():
    """
    Controller: GET /api/v1/orders
    Returns all orders as JSON.
    """
    items = list_all_orders()
    items_json = orders_schema.dump(items)
    return items_json, 200


# --------------------------------------------------------
# GET ORDER BY ID
# --------------------------------------------------------
def get_order_controller(order_id):
    """
    Controller: GET /api/v1/orders/<order_id>
    Returns a single order by ID as JSON.
    """
    try:
        item = get_order_by_id(order_id)
    except (ValueError, TypeError):
        return {"error": "Malformed input"}, 400

    if not item:
        return {"error": "Item not found"}, 404

    item_json = order_schema.dump(item)
    return item_json, 200


# --------------------------------------------------------
# CREATE ORDER  (uses session-based logged user)
# --------------------------------------------------------
@simple_errors
def create_order_controller():
    """
    Controller: POST /api/v1/orders
    Creates a new order and auto-fills user info from session.
    """
    data = request.get_json() or {}

    # 1️⃣ Get logged-in user ID from session
    user_id = session.get("user_id")
    if user_id:
        user = User.objects(id=user_id).first()
        if user:
            # Auto-fill user fields if not provided by frontend
            data.setdefault("name", user.name)
            data.setdefault("phone", user.phone)
            data.setdefault("email", user.email)
            data.setdefault("address", user.address)

    # Set default payment method if not provided
    data.setdefault("payment_method", "cash")
    try:
        new_order = add_order(data)  # model-level validation will run
    except Exception as e:
        return {"error": str(e)}, 400
    nice_item = order_schema.dump(new_order)
    nice_item["order_id"] = str(new_order.id)
    nice_item["payment_method"] = new_order.payment_method
    return nice_item, 201


# --------------------------------------------------------
# UPDATE ORDER
# --------------------------------------------------------
@simple_errors
def update_order_controller(order_id):
    data = request.get_json() or {}

    try:
        item = update_order(order_id, data)  # model-level validation will run
    except Exception as e:
        return {"error": str(e)}, 400
    if not item:
        return {"error": "Item not found"}, 404
    nice_item = order_schema.dump(item)
    nice_item["order_id"] = str(item.id)
    return nice_item, 200


# --------------------------------------------------------
# DELETE ORDER
# --------------------------------------------------------
@simple_errors
def delete_order_controller(order_id):
    deleted = delete_order(order_id)

    if not deleted:
        return {"error": "Item not found"}, 404

    return {"message": "Item deleted successfully"}, 200


# --------------------------------------------------------
# GET LOGGED-IN USER DETAILS (session-based)
# --------------------------------------------------------
def get_logged_in_user_details():
    """Return user details to auto-fill the order form."""
    user_id = session.get("user_id")
    if not user_id:
        return {"error": "User not logged in"}, 401

    user = User.objects(id=user_id).first()
    if not user:
        return {"error": "User not found"}, 404

    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "address": user.address,
    }, 200
