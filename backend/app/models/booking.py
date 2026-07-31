from sqlalchemy import Column, String, Float, DateTime, ForeignKey
import datetime
from app.database.session import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    turf_id = Column(String, ForeignKey("turfs.id"), nullable=False)
    slot_id = Column(String, nullable=False)
    booking_date = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    sport_type = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    booking_status = Column(String, default="confirmed")
    payment_status = Column(String, default="paid")
    qr_code = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, index=True)
    booking_id = Column(String, ForeignKey("bookings.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    payment_gateway = Column(String, nullable=False) # razorpay or stripe
    payment_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    payment_status = Column(String, default="success")
    transaction_time = Column(DateTime, default=datetime.datetime.utcnow)
