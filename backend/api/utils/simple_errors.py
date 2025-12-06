"""
simple_errors.py

Provides a decorator for simplified error handling in Flask routes using MongoEngine ValidationError.
"""

from functools import wraps
from mongoengine import ValidationError

def simple_errors(f):
    """
    Decorator to catch ValidationError and other exceptions, returning formatted error responses.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValidationError as e:
            errors = e.to_dict()  # dict like {'__all__': 'Invalid', 'price': 'Too low'}

            if errors:
                messages = []
                for field, msg in errors.items():
                    if field == "__all__":
                        messages.append(msg)          # document-level (from clean())
                    else:
                        messages.append(f"{msg}: {field}")  # field-level
                return {"errors": messages}, 400

            # fallback: no dict, just a string
            return {"error": str(e)}, 400

        except Exception as e:
            return {"error": str(e)}, 500

    return wrapper
