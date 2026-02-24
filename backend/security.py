import os
import hashlib
import bcrypt
from datetime import datetime, timedelta
import jwt

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "clawshield_super_secret_key_123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

def prep_password(password: str) -> bytes:
    # Pre-hash password with sha256 to avoid bcrypt's 72 byte length limit
    # and return as bytes for bcrypt
    return hashlib.sha256(password.encode('utf-8')).hexdigest().encode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    prepared_pw = prep_password(plain_password)
    return bcrypt.checkpw(prepared_pw, hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    prepared_pw = prep_password(password)
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(prepared_pw, salt).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
