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
