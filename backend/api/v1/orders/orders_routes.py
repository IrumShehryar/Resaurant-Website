from flask import Blueprint
from .orders_controller import (
    get_order,
    get_order_controller,
    create_order_controller,
    update_order_controller,
    delete_order_controller,
    get_logged_in_user_details,
)

orders_bp = Blueprint("orders", __name__)

# Get all orders
orders_bp.route("/orders", methods=["GET"])(get_order)

# Get single order
orders_bp.route("/orders/<order_id>", methods=["GET"])(get_order_controller)

# Create order
orders_bp.route("/orders", methods=["POST"])(create_order_controller)

# Update order
orders_bp.route("/orders/<order_id>", methods=["PUT"])(update_order_controller)

# Delete order
orders_bp.route("/orders/<order_id>", methods=["DELETE"])(delete_order_controller)

# Prefill user details for order form
orders_bp.route("/orders/user-details", methods=["GET"])(get_logged_in_user_details)
