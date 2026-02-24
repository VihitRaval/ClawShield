from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime, timedelta

DATABASE_URL = "postgresql://postgres:2109@localhost/clawshield"
import os
os.makedirs("./database", exist_ok=True)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    email = Column(String(100), unique=True, index=True, nullable=True)
    mobile = Column(String(20), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255))
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to audit logs
    audit_logs = relationship("AuditLog", back_populates="user")

class OTP(Base):
    __tablename__ = "otps"
    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String(100), index=True) # email or mobile
    code = Column(String(6))
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_instruction = Column(Text)
    intent_json = Column(Text)
    validation_status = Column(String(50))
    validation_reason = Column(Text, nullable=True)
    execution_result = Column(Text, nullable=True)

    user = relationship("User", back_populates="audit_logs")

Base.metadata.create_all(bind=engine)
