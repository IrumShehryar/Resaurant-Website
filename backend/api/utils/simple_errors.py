from functools import wraps
from mongoengine import ValidationError

def simple_errors(f):
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
