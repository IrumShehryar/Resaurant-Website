from mongoengine import Document , StringField, IntField, DateTimeField, BooleanField, ValidationError
from api.utils.validator import validate_reservation_fields
import re
# Mock data (16 items) for Revontulet Flamehouse

class ReserveTable(Document):
    name =  StringField (required = True,min_length=3, max_length=100)
    phone = StringField(required=True, min_length=7, max_length=15)
    email = StringField(required=True, max_length=100)
    no_of_people = IntField(required= True, min_value=1,max_value=20)
    reservation_date = StringField(required=True)
    reservation_time = StringField(required=True)
    status = StringField(required = True,  choices=("pending", "confirmed", "cancelled"), default="pending")
    created_at = DateTimeField(required=True)

    def clean(self):
        """
        Custom validation logic for reservation.
        

        """
        validate_reservation_fields(
            name=self.name,
            email=self.email,
            no_of_people=self.no_of_people,
            reservation_date=self.reservation_date,
            reservation_time=self.reservation_time,
        )
    

def list_all_reservations():
 
    return ReserveTable.objects()


def get_reservations_by_id(reservation_id):
 
    try:
        return ReserveTable.objects.get(id =reservation_id)
    except:
        return None
  
def add_reservation(reservation_data):
 
    new_reservation = ReserveTable(
        name = reservation_data.get('name'),
        phone = reservation_data.get('phone'),
        email = reservation_data.get('email'),
        no_of_people = reservation_data.get('no_of_people'),
        reservation_date = reservation_data.get('reservation_date'),
        reservation_time = reservation_data.get('reservation_time'),
    
    )
    new_reservation.save()
    return new_reservation

def update_reservarion(reservation_id,reservation_data):
    
    # FIX: Added ObjectId() conversion for item_id
    # ISSUE: String ID must be converted to MongoDB ObjectId for database query
    ReserveTable.objects.get (id=reservation_id).delete()
    return{"message": "Item deleted successfully"}