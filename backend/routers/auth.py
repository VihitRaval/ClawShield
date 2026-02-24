from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
import random
import smtplib
from email.message import EmailMessage
import os
import os

from database.session import SessionLocal, User, OTP
from security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    password: str

class LoginRequest(BaseModel):
    identifier: str # email or mobile
    password: str

class VerifyOTPRequest(BaseModel):
    identifier: str
    code: str

class ForgotPasswordRequest(BaseModel):
    identifier: str

class ResetPasswordRequest(BaseModel):
    identifier: str
    code: str
    new_password: str

def send_email_otp(to_email: str, code: str):
    smtp_server = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASSWORD", "")
    from_email = os.environ.get("FROM_EMAIL", smtp_user)
    
    if not smtp_user or not smtp_pass:
        print(f"WARNING: SMTP credentials not provided. Check your environment variables.")
        return
        
    msg = EmailMessage()
    msg.set_content(f"Your ClawShield verification code is: {code}\n\nThis code will expire in 10 minutes.")
    msg['Subject'] = 'ClawShield Verification Code'
    msg['From'] = from_email
    msg['To'] = to_email
    
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        print(f"OTP successfully sent to email {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")

def send_sms_otp(to_mobile: str, code: str):
    print(f"======================================")
    print(f"📱 MANUAL PROCESS: OTP for {to_mobile}")
    print(f"Code: {code}")
    print(f"======================================")

def generate_and_send_otp(db: Session, identifier: str):
    # Random 6 digit OTP
    code = str(random.randint(100000, 999999))
    
    # Store OTP
    otp = OTP(
        identifier=identifier,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(otp)
    db.commit()
    
    # Send the OTP via Email if it's an email address
    if "@" in identifier:
        send_email_otp(identifier, code)
    else:
        # Assume it's a mobile number
        send_sms_otp(identifier, code)
        
    # Also log it for development/fallback
    print(f"\n======================================")
    print(f"🔒 CLAWSHIELD OTP GENERATED")
    print(f"Identifier: {identifier}")
    print(f"Code: {code}")
    print(f"======================================\n")
    return True

@router.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    if not req.email and not req.mobile:
        raise HTTPException(status_code=400, detail="Must provide email or mobile number")

    identifier = req.email or req.mobile

    # Check existing user
    existing_user = None
    if req.email:
        existing_user = db.query(User).filter(User.email == req.email).first()
    if not existing_user and req.mobile:
        existing_user = db.query(User).filter(User.mobile == req.mobile).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists with this email or mobile")

    # Create new user
    new_user = User(
        first_name=req.first_name,
        last_name=req.last_name,
        email=req.email,
        mobile=req.mobile,
        hashed_password=get_password_hash(req.password),
        is_verified=True
    )
    db.add(new_user)
    db.commit()

    return {"message": "User registered successfully."}

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    otp_record = db.query(OTP).filter(
        OTP.identifier == req.identifier,
        OTP.code == req.code,
        OTP.expires_at > datetime.utcnow()
    ).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(
        (User.email == req.identifier) | (User.mobile == req.identifier)
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    db.delete(otp_record) # Delete OTP after successful use
    db.commit()

    return {"message": "Account verified successfully"}

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == req.identifier) | (User.mobile == req.identifier)
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": str(user.id), "name": f"{user.first_name} {user.last_name}"})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.id, "name": f"{user.first_name} {user.last_name}"}}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == req.identifier) | (User.mobile == req.identifier)
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    generate_and_send_otp(db, req.identifier)
    return {"message": "Password reset OTP sent to your console"}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    otp_record = db.query(OTP).filter(
        OTP.identifier == req.identifier,
        OTP.code == req.code,
        OTP.expires_at > datetime.utcnow()
    ).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(
        (User.email == req.identifier) | (User.mobile == req.identifier)
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(req.new_password)
    db.delete(otp_record)
    db.commit()

    return {"message": "Password reset successfully"}
