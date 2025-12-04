from flask import Blueprint, jsonify
from api.v1.orders.orders_model import Orders
from api.v1.reservation.reservation_model import ReserveTable
from api.v1.users.users_model import User
from api.v1.menu.menu_model import MenuItem

admin_stats_bp = Blueprint('admin_stats', __name__, url_prefix="/api/v1/admin")

def get_model_count(model):
    return model.objects.count()

@admin_stats_bp.route('/stats')
def admin_stats():
    stats = {
        "orders": get_model_count(Orders),
        "reservations": get_model_count(ReserveTable),
        "users": get_model_count(User),
        "menu_items": get_model_count(MenuItem),
    }
    return jsonify(stats)