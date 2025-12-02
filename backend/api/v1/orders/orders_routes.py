from flask import Blueprint
from .orders_controller import (
    get_order,
    get_order_controller,
    create_order_controller,
    update_order_controller,
    delete_order_controller,
    get_logged_in_user_details,
)

orders_bp = Blueprint("orders", __name__, url_prefix='/api/v1/orders')

# Get all orders
@orders_bp.route("/", methods=["GET"])
def all_orders():
    return get_order()

# Get single order
@orders_bp.route("/<order_id>", methods=["GET"])
def single_order(order_id):
    return get_order_controller(order_id)

# Create order
@orders_bp.route("/", methods=["POST"])
def create_order():
    return create_order_controller()

# Update order
@orders_bp.route("/<order_id>", methods=["PUT"])
def update_order(order_id):
    return update_order_controller(order_id)

# Delete order
@orders_bp.route("/<order_id>", methods=["DELETE"])
def delete_order(order_id):
    return delete_order_controller(order_id)

# Prefill user details for order form
@orders_bp.route("/user-details", methods=["GET"])
def user_details():
    return get_logged_in_user_details()