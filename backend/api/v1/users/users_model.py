from mongoengine import Document , StringField, DateTimeField
from datetime import datetime
import bcrypt

class User(Document):
    username = StringField(required=True, unique=True)
    email = StringField(required=True,unique=True)
    password = StringField(required=True)
    role = StringField(required=True, choices=["admin", "customer"], default="customer")
    phone = StringField()
    address = StringField()
    created_at = DateTimeField(default=datetime)