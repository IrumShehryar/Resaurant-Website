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
    
    return get_reservation()


@reservation_bp.route("/<reservation_id>", methods=["GET"])
def get_reservation_route(reservation_id):
   
    return get_reservation_controller(reservation_id)


@reservation_bp.route("/", methods=["POST"])
#@token_required
#def create_reservation(current_user):
def create_reservation():
  
    #if current_user.role != "admin":
        #return {"message": "Forbidden"}, 403

    return create_reservation_controller()


@reservation_bp.route("/<reservation_id>", methods=["PUT"])
#@token_required
#def update_reservation(current_user, reservation_id):
def update_reservation(reservation_id):
    """
    
    
    Admin-only: requires a valid JWT for a user with role "admin".
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
    """
    #if current_user.role != "admin":
        #return {"message": "Forbidden"}, 403

    return delete_reservation_controller(reservation_id)
