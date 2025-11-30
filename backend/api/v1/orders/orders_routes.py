from flask import Blueprint, request
from .orders_controller import (
    get_order,
    get_order_controller,
    create_order_controller,
    update_order_controller,
    delete_order_controller,
)
from api.utils.auth_utils import token_required
from api.models import User  # Import your User model

orders_bp = Blueprint("orders", __name__, url_prefix="/api/v1/orders")


@orders_bp.route("/", methods=["GET"])
def get_all_order_route():
    return get_order()


@orders_bp.route("/<order_id>", methods=["GET"])
def get_order_route(order_id):
    return get_order_controller(order_id)


@orders_bp.route("/", methods=["POST"])
@token_required
def create_order(current_user):
    """
    Create a new order.
    You can access the current_user fields like name, phone, address.
    """
    # Example: fetch full user info if needed
    user = User.query.filter_by(id=current_user.id).first()
    if not user:
        return {"message": "User not found"}, 404

    order_data = request.get_json()

    # Optionally, attach user info to the order
    order_data['user_name'] = user.name
    order_data['user_email'] = user.email
    order_data['user_phone'] = user.phone
    order_data['user_address'] = user.address

    return create_order_controller(order_data)


@orders_bp.route("/<order_id>", methods=["PUT"])
@token_required
def update_order(current_user, order_id):
    """
    Admin-only: requires a valid JWT for a user with role "admin".
    """
    if current_user.role != "admin":
        return {"message": "Forbidden"}, 403

    order_data = request.get_json()
    return update_order_controller(order_id, order_data)


@orders_bp.route("/<order_id>", methods=["DELETE"])
@token_required
def delete_order(current_user, order_id):
    """
    Admin-only: requires a valid JWT for a user with role "admin".
    """
    if current_user.role != "admin":
        return {"message": "Forbidden"}, 403

    return delete_order_controller(order_id)
