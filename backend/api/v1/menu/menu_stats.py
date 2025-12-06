"""
menu_stats.py

Provides statistics endpoints for menu items, including category and dietary counts, and hot selling item.
"""

from flask import Blueprint, jsonify
from api.v1.menu.menu_model import MenuItem
from api.v1.orders.orders_model import Orders
from collections import Counter

menu_stats_bp = Blueprint('menu_stats', __name__, url_prefix="/api/v1/menu")

@menu_stats_bp.route('/stats')
def menu_stats():
    """
    Returns statistics for menu categories, dietary options, and the hot selling item.
    """
    # Category counts (normalize to lowercase)
    categories = ["starter", "main", "dessert", "side", "drink"]
    category_counts = {cat.capitalize(): MenuItem.objects(category__iexact=cat).count() for cat in categories}

    # Dietary counts (normalize to lowercase, underscores)
    dietary_options = [
        ("vegetarian", "Vegetarian"),
        ("vegan", "Vegan"),
        ("gluten_free", "Gluten-Free"),
        ("non_vegetarian", "Non-Vegetarian"),
        ("alcoholic", "Alcoholic"),
        ("non_alcoholic", "Non-Alcoholic")
    ]
    dietary_counts = {}
    for db_val, label in dietary_options:
        dietary_counts[label] = MenuItem.objects(dietary__iexact=db_val).count()

    # Hot selling item
    all_items = []
    for order in Orders.objects:
        for item in order.items:
            all_items.append(item.item_name)
    hot_item = None
    hot_count = 0
    if all_items:
        hot_item, hot_count = Counter(all_items).most_common(1)[0]

    return jsonify({
        "category_counts": category_counts,
        "dietary_counts": dietary_counts,
        "hot_selling_item": {"item": hot_item, "count": hot_count}
    })