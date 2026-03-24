from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, default="patient") # patient or provider

class InteractionLogs(Base):
    __tablename__ = "interaction_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query = Column(Text)
    response = Column(Text)
    sentiment_score = Column(Float, nullable=True) # For Analytics Engine
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class WearableData(Base):
    __tablename__ = "wearable_data"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    metric_type = Column(String) # e.g., 'heart_rate', 'blood_glucose'
    value = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
