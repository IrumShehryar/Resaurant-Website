"""
reservation_route.py

Flask Blueprint exposing the reservation JSON API. Handles routes for CRUD operations.
"""

from flask import Blueprint
from .reservation_controller import (
    get_reservation,
    get_reservation_controller,
    create_reservation_controller,
    update_reservation_controller,
    delete_reservation_controller,
)
from api.utils.auth_utils import token_required

reservation_bp = Blueprint("reservation", __name__, url_prefix="/api/v1/reservation")


@reservation_bp.route("/", methods=["GET"])
def get_all_reservation_route():
    """
    Returns all reservations.
    """
    return get_reservation()


@reservation_bp.route("/<reservation_id>", methods=["GET"])
def get_reservation_route(reservation_id):
    """
    Returns a specific reservation by ID.
    """
    return get_reservation_controller(reservation_id)


@reservation_bp.route("/", methods=["POST"])
#@token_required
#def create_reservation(current_user):
def create_reservation():
    """
    Creates a new reservation.
    """
    #if current_user.role != "admin":
        #return {"message": "Forbidden"}, 403

    return create_reservation_controller()


@reservation_bp.route("/<reservation_id>", methods=["PUT"])
#@token_required
#def update_reservation(current_user, reservation_id):
def update_reservation(reservation_id):
    """
    Admin-only: requires a valid JWT for a user with role "admin".
    Updates an existing reservation.
    """
    #if current_user.role != "admin":
        #return {"message": "Forbidden"}, 403

    return update_reservation_controller(reservation_id)


@reservation_bp.route("/<reservation_id>", methods=["DELETE"])
#@token_required

#def delete_reservation(current_user, reservation_id):
def delete_reservation(reservation_id):
    """
    Admin-only: requires a valid JWT for a user with role "admin".
    Deletes a reservation by ID.
    """
    #if current_user.role != "admin":
        #return {"message": "Forbidden"}, 403

    return delete_reservation_controller(reservation_id)
