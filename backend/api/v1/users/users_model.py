from mongoengine import Document , StringField, DateTimeField
from datetime import datetime
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
        