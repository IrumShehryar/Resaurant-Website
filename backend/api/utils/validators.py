def validate_menu_item_fields(
    name: str,
    price,
    category: str,
    dietary: list,
    allergens: list = None,
    ingredients: list = None,
    days_of_week: list = None,
    active: bool = True,
    description: str = None,
    image: str = None
) -> None:
    """
    Validate all menu item fields. Raises ValidationError if any rule fails.
    """
    allowed_categories = ["starter", "main", "dessert", "side", "drink", "special"]
    allowed_dietary = [
        "vegetarian", "vegan", "non-vegetarian", "gluten-free", "dairy-free",
        "pescatarian", "sugar-free", "nut-free", "keto-friendly", "alcoholic", "non-alcoholic"
    ]
    allowed_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    # Name checks
    if not name or not str(name).strip():
        raise ValidationError("Name cannot be empty")
    if len(name.strip()) < 3:
        raise ValidationError("Name must be at least 3 characters")
    if not re.search(r"[A-Za-z]", name):
        raise ValidationError("Name must contain at least one letter")

    # Category
    if category not in allowed_categories:
        raise ValidationError(f"Invalid category: {category}")

    # Price checks by category
    try:
        price_val = float(price)
    except (TypeError, ValueError):
        raise ValidationError("Price must be a number")
    if price_val <= 0:
        raise ValidationError("Price must be greater than 0")
    if category == 'starter' and not (4 <= price_val <= 12):
        raise ValidationError('Starters must be priced between 4 and 12')
    elif category == 'main' and not (10 <= price_val <= 25):
        raise ValidationError('Main courses must be priced between 10 and 25')
    elif category == 'dessert' and not (5 <= price_val <= 10):
        raise ValidationError('Desserts must be priced between 5 and 10')
    elif category == 'side' and not (3 <= price_val <= 8):
        raise ValidationError('Sides must be priced between 3 and 8')
    elif category == 'drink' and not (2 <= price_val <= 15):
        raise ValidationError('Drinks must be priced between 2 and 15')
    elif category == 'special' and not (15 <= price_val <= 35):
        raise ValidationError('Specials must be priced between 15 and 35')

    # Dietary
    if not isinstance(dietary, list):
        raise ValidationError("Dietary must be a list")
    for d in dietary:
        if d not in allowed_dietary:
            raise ValidationError(f"Invalid dietary value: {d}")
    if len(dietary) == 0:
        raise ValidationError("Select at least one dietary option")

    # Allergens/Ingredients
    if allergens is not None and not isinstance(allergens, list):
        raise ValidationError("Allergens must be a list")
    if ingredients is not None and not isinstance(ingredients, list):
        raise ValidationError("Ingredients must be a list")

    # Active & days_of_week
    if active:
        if not days_of_week or not isinstance(days_of_week, list) or len(days_of_week) == 0:
            raise ValidationError("Active items must be assigned to at least one day of the week")
        for day in days_of_week:
            if day not in allowed_days:
                raise ValidationError(f"Invalid day of week: {day}")

    # Dietary/allergen consistency
    if 'vegan' in dietary and allergens:
        dairy_allergens = ['dairy', 'milk', 'cheese', 'cream', 'butter']
        item_allergens = [a.lower() for a in allergens]
        if any(dairy in item_allergens for dairy in dairy_allergens):
            raise ValidationError('Vegan items cannot contain dairy allergens')
    if 'gluten-free' in dietary and allergens:
        gluten_allergens = ['gluten', 'wheat', 'barley', 'rye']
        item_allergens = [a.lower() for a in allergens]
        if any(gluten in item_allergens for gluten in gluten_allergens):
            raise ValidationError('Gluten-free items cannot contain gluten allergens')
import re
from datetime import datetime
from mongoengine import ValidationError


# -----------------------------
# Reservation Validation
# -----------------------------
def validate_reservation_fields(
    name: str,
    email: str,
    phone: str,
    no_of_people,
    reservation_date: str,
    reservation_time: str,
) -> None:
    """
    Validate reservation fields.
    Raises mongoengine.ValidationError if something is wrong.
    """

    # --- name checks ---
    if not name or not str(name).strip():
        raise ValidationError("Name cannot be empty")
    if not re.search(r"[A-Za-zÅÄÖåäö]", name):
        raise ValidationError("Name must contain at least one letter")

    # --- email checks ---
    if not email or not str(email).strip():
        raise ValidationError("Email cannot be empty")
    if "@" not in email:
        raise ValidationError("Invalid email address")

    # --- phone checks ---
    if not phone or not str(phone).strip():
        raise ValidationError("Phone number cannot be empty")
    if not re.match(r"^[0-9+\-\s()]{7,20}$", phone):
        raise ValidationError("Invalid phone number format")

    # --- basic checks for people / date / time ---
    if no_of_people is None:
        raise ValidationError("Number of people is required")
    if reservation_date is None or reservation_time is None:
        raise ValidationError("Reservation date and time are required")

    # --- type + range checks for no_of_people ---
    try:
        no_of_people_int = int(no_of_people)
    except (TypeError, ValueError):
        raise ValidationError("Number of people must be a number")
    if no_of_people_int <= 0:
        raise ValidationError("Number of people must be at least 1")

    # --- date & time format checks ---
    try:
        datetime.strptime(reservation_date, "%Y-%m-%d")
    except ValueError:
        raise ValidationError("Invalid reservation date format (use YYYY-MM-DD)")
    try:
        datetime.strptime(reservation_time, "%H:%M")
    except ValueError:
        raise ValidationError("Invalid reservation time format (use HH:MM)")


# -----------------------------
# Order Validation
# -----------------------------
def validate_order_fields(
    name: str,
    email: str,
    phone: str,
    order_date: str,
    order_time: str,
) -> None:
    """
    Validate order fields.
    Raises mongoengine.ValidationError if something is wrong.
    """

    # --- name checks ---
    if not name or not str(name).strip():
        raise ValidationError("Name cannot be empty")
    if not re.search(r"[A-Za-zÅÄÖåäö]", name):
        raise ValidationError("Name must contain at least one letter")

    # --- email checks ---
    if not email or not str(email).strip():
        raise ValidationError("Email cannot be empty")
    if "@" not in email:
        raise ValidationError("Invalid email address")

    # --- phone checks ---
    if not phone or not str(phone).strip():
        raise ValidationError("Phone number cannot be empty")
    if not re.match(r"^[0-9+\-\s()]{7,20}$", phone):
        raise ValidationError("Invalid phone number format")

    # --- date & time format checks ---
    if order_date is None or order_time is None:
        raise ValidationError("Order date and time are required")
    try:
        datetime.strptime(order_date, "%Y-%m-%d")
    except ValueError:
        raise ValidationError("Invalid order date format (use YYYY-MM-DD)")
    try:
        datetime.strptime(order_time, "%H:%M")
    except ValueError:
        raise ValidationError("Invalid order time format (use HH:MM)")
