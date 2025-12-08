"""
users_model.py

MongoEngine model for users, including validation, authentication, and password logic.
"""

from mongoengine import Document , StringField, DateTimeField,ValidationError,signals
from datetime import datetime
from bson import ObjectId
import bcrypt
from backend.api.utils.validators import validate_user_fields

class User(Document):
    """
    MongoEngine document for users, including user info, authentication, and password validation.
    """
    name = StringField(required= True,min_length=3,max_length=50)
    username = StringField(required=True, unique=True)
    email = StringField(required=True,unique=True)
    password = StringField(required=True)
    role = StringField(required=True, choices=["admin", "user"], default="user")
    phone = StringField()
    address = StringField()
    created_at = DateTimeField(default= datetime.utcnow)
    
    def to_json(self):
        # Convert user document to JSON-serializable dict for API responses
        return {
            "id": str(self.id),
            "username": self.username,
            "name": getattr(self, "name", None),
            "email": getattr(self, "email", None),
            "role": getattr(self, "role", "user"),
            # add other fields you want exposed
        }
    @property
    def is_admin(self) -> bool:
        # Check if user has admin role
        return self.role == "admin"
    
    def clean(self):
        """
        Centralized validation logic for user fields.
        """
        # Validate all user fields before saving to DB
        validate_user_fields(
            name=self.name,
            username=self.username,
            email=self.email,
            password=self.password,
            phone=self.phone,
            address=self.address
        )
    
    @staticmethod
    def verify_credentials(username,password):
        """
        Verifies user credentials using bcrypt.
        Returns the user if credentials are valid, else None.
        """
        # Find user by username
        user = User.objects(username=username).first()
        # Check password using bcrypt
        if user and bcrypt.checkpw(password.encode("utf-8"), user.password.encode("utf-8")):
            return user
        # Return None if credentials are invalid
        return None
    
    @staticmethod
    def validate_password(password):
        """
        Validates password strength and requirements.
        Raises ValidationError if requirements are not met.
        """
        # Enforce password length
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        # Require at least one uppercase letter
        if not any(char.isupper() for char in password):
            raise ValidationError("Password must contain at least one uppercase letter.")
        # Require at least one lowercase letter
        if not any(char.islower() for char in password):
            raise ValidationError("Password must contain at least one lowercase letter.")
        # Require at least one digit
        if not any(char.isdigit() for char in password):
            raise ValidationError("Password must contain at least one digit.")
    
    
def list_all_users():
    # Return all user documents
    return User.objects()
    
def find_user_by_id(user_id):
    # Find a user by their ObjectId
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None

def update_user(user_id, user_data):
    # Update user fields with provided data
    user = User.objects.get(id=user_id)
    for key, value in user_data.items():
        if hasattr(user, key):
            setattr(user, key, value)
    user.save()  # triggers pre_save and password hashing
    return user


def delete_user(user_id):
    User.objects.get(id=user_id).delete()
    return{"message": "User deleted successfully"}
        
        
        
def hash_password(sender, document, **kwargs):
    """
    Automatically validates and hashes the password before saving.
    Only hashes if the password is not already hashed. Checks if it starts with '$2b$' because save() runs also on updates.
    """
    if not document.password.startswith('$2b$'):
        # Validate plain-text password
        User.validate_password(document.password)
        # Hash the password
        salt = bcrypt.gensalt()
        document.password = bcrypt.hashpw(document.password.encode('utf-8'), salt).decode('utf-8')


# Connect the signal to the User model
signals.pre_save.connect(hash_password, sender=User)