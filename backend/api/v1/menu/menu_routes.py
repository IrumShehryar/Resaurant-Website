"""Flask Blueprint exposing the menu JSON API.

Routes:
- GET  /api/v1/menu/          -> returns list of menu items (public)
- GET  /api/v1/menu/<item_id> -> returns single item or 404 (public)
- POST /api/v1/menu/          -> create menu item (admin only)
- PUT  /api/v1/menu/<item_id> -> update menu item (admin only)
- DELETE /api/v1/menu/<item_id> -> delete menu item (admin only)

Controller logic is delegated to helpers in ``menu_controller.py`` which
return (response, status) tuples.
"""

from flask import Blueprint
from .menu_controller import (
    get_menu,
    get_menu_item_controller,
    create_menu_item_controller,
    update_menu_item_controller,
    delete_menu_item_controller,
)
from backend.api.utils.auth_utils import admin_required

menu_bp = Blueprint("menu", __name__, url_prefix="/api/v1/menu")


@menu_bp.route("/", methods=["GET"])
def get_all_menu_route():
    """
    @api {get} /menu Get All Menu Items
    @apiName GetAllMenu
    @apiGroup Menu
    @apiVersion 1.0.0
    
    @apiSuccess {Object[]} items List of menu items
    @apiSuccess {String} items._id MongoDB ObjectId
    @apiSuccess {String} items.id Item ID (string)
    @apiSuccess {String} items.name Item name
    @apiSuccess {Number} items.price Item price
    @apiSuccess {String} items.category Item category (starter|main|dessert|side|drink|special)
    @apiSuccess {String} items.description Item description
    @apiSuccess {String[]} items.dietary Dietary labels (vegetarian|vegan|gluten-free|dairy-free)
    @apiSuccess {String[]} items.allergens Allergens list
    @apiSuccess {String[]} items.days_of_week Days available
    @apiSuccess {Boolean} items.active Is item active
    """
    return get_menu()


@menu_bp.route("/<item_id>", methods=["GET"])
def get_menu_item_route(item_id):
    """
    @api {get} /menu/:id Get Single Menu Item
    @apiName GetMenuItem
    @apiGroup Menu
    @apiVersion 1.0.0
    
    @apiParam {String} id Menu item MongoDB ObjectId
    
    @apiSuccess {Object} item Menu item object
    @apiSuccess {String} item._id MongoDB ObjectId
    @apiSuccess {String} item.id Item ID (string)
    @apiSuccess {String} item.name Item name
    @apiSuccess {Number} item.price Item price
    """
    return get_menu_item_controller(item_id)


@menu_bp.route("/", methods=["POST"])
@admin_required
def create_menu(current_user):
    """
    @api {post} /menu Create New Menu Item
    @apiName CreateMenuItem
    @apiGroup Menu
    @apiVersion 1.0.0
    
    Admin-only: requires a valid JWT for a user with role "admin".
    """
    return create_menu_item_controller()


@menu_bp.route("/<item_id>", methods=["PUT"])
@admin_required
def update_menu(current_user, item_id):
    """
    @api {put} /menu/:id Update Menu Item
    @apiName UpdateMenuItem
    @apiGroup Menu
    @apiVersion 1.0.0
    
    Admin-only: requires a valid JWT for a user with role "admin".
    """
    return update_menu_item_controller(item_id)


@menu_bp.route("/<item_id>", methods=["DELETE"])
@admin_required
def delete_menu(current_user, item_id):
    """
    @api {delete} /menu/:id Delete Menu Item
    @apiName DeleteMenuItem
    @apiGroup Menu
    @apiVersion 1.0.0
    
    Admin-only: requires a valid JWT for a user with role "admin".
    """
    return delete_menu_item_controller(item_id)
