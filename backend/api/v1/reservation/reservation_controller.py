from flask import request
from .reservation_model import (
    list_all_reservations,
    get_reservation_by_id,
    add_reservation,
    update_reservation,
    delete_reservation,
)
from api.utils.simple_errors import simple_errors
from .reservation_schema import ReservationSchema

# Reusable schema instances (like you do with UserSchema)
reservation_schema = ReservationSchema()
reservations_schema = ReservationSchema(many=True)


def get_reservation():
    items = list_all_reservations()
    items_json = reservations_schema.dump(items)
    return items_json, 200


def get_reservation_controller(reservation_id):
    try:
        item = get_reservation_by_id(reservation_id)
    except (ValueError, TypeError):
        return {"error": "malformed input"}, 400

    if not item:
        return {"error": "Item not found"}, 404

    item_json = reservation_schema.dump(item)
    return item_json, 200


@simple_errors
def create_reservation_controller():
    data = request.get_json() or {}
    item = add_reservation(data)
    nice_item = reservation_schema.dump(item)
    return nice_item, 201


@simple_errors
def update_reservation_controller(reservation_id):
    data = request.get_json() or {}
    item = update_reservation(reservation_id, data)

    if not item:
        return {"error": "Item not found"}, 404

    nice_item = reservation_schema.dump(item)
    return nice_item, 200


@simple_errors
def delete_reservation_controller(reservation_id):
    deleted = delete_reservation(reservation_id)

    if not deleted:
        return {"error": "Item not found"}, 404

    return {"message": "Item deleted successfully"}, 200
