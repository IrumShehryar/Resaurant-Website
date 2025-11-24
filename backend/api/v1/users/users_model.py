from mongoengine import Document , StringField, DateTimeField
from datetime import datetime
from bson import ObjectId
import bcrypt

class User(Document):
    name = StringField(required= True,min_length=3,max_length=100)
    username = StringField(required=True, unique=True)
    email = StringField(required=True,unique=True)
    password = StringField(required=True)
    role = StringField(required=True, choices=["admin", "customer"], default="customer")
    phone = StringField()
    address = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    
    @staticmethod
    def create_user(user):
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(user.password.encode("utf-8"),salt)
        user.password= hashed_password.decode("utf-8")
        user.save()
        return user
    
    @staticmethod
    def verify_credentials(username,password):
        user = User.objects(username=username).first()
        
        if user and bcrypt.checkpw(password.encode("utf-8"),user.password.encode("utf-8")):
            return user
        
        return None
    
def list_all_users():
    return User.objects()
    
def find_user_by_id(user_id):
    return User.objects.get(id=user_id)

def update_user(user_id,user_data):
    user = User.objects.get(id=user_id)
    user.update(**user_data)
    return User.objects.get(id=user_id)

def delete_user(user_id):
    User.objects.get(id=user_id).delete()
    return{"message": "User deleted successfully"}
        