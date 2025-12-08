"""Controller helpers for the menu JSON API.

These functions are thin wrappers around the model and format API-style
JSON responses with proper HTTP status codes. They are invoked by the
Flask route functions in ``menu_routes.py``.
"""

from flask import request
from .menu_model import (
    list_all_menu_items,
    get_menu_by_id,
    add_menu_item,
    update_menu_item,
    delete_menu_item,
)
from backend.api.utils.simple_errors import simple_errors
from .menu_schema import MenuItemSchema

# Schema instances
menu_item_schema = MenuItemSchema()
menu_items_schema = MenuItemSchema(many=True)


def get_menu():
    """
    Controller: GET /api/v1/menu
    """
    items = list_all_menu_items()
    items_json = menu_items_schema.dump(items)
    return items_json, 200


def get_menu_item_controller(item_id):
    """
    Controller: GET /api/v1/menu/<item_id>
    """
    try:
        item = get_menu_by_id(item_id)
    except (ValueError, TypeError):
        return {"error": "malformed input"}, 400

    if not item:
        return {"error": "Item not found"}, 404

    item_json = menu_item_schema.dump(item)
    return item_json, 200


@simple_errors
def create_menu_item_controller():
    """
    Controller: POST /api/v1/menu
    """
    data = request.get_json() or {}
    item = add_menu_item(data)
    nice_item = menu_item_schema.dump(item)
    return nice_item, 201


@simple_errors
def update_menu_item_controller(item_id):
    """
    Controller: PUT /api/v1/menu/<item_id>
    """
    data = request.get_json() or {}
    item = update_menu_item(item_id, data)

    if not item:
        return {"error": "Item not found"}, 404

    nice_item = menu_item_schema.dump(item)
    return nice_item, 200


@simple_errors
def delete_menu_item_controller(item_id):
    """
    Controller: DELETE /api/v1/menu/<item_id>
    """
    try:
        result = delete_menu_item(item_id)
        # delete_menu_item currently returns {"message": "..."}
        # which is fine to return as-is
        return result, 200
    except Exception:
        return {"error": "Item not found"}, 404
