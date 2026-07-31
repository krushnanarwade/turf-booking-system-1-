from sqlalchemy import Column, String, DateTime, Enum
import enum
import datetime
from app.database.session import Base

class UserRole(str, enum.Enum):
    customer = "customer"
    owner = "owner"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    fullname = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.customer)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
