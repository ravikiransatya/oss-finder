import sys, os
sys.path.insert(0, os.path.dirname(__file__))
os.chdir(os.path.dirname(__file__))

from database import SessionLocal
from models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

user = db.query(User).filter(User.email == "ravichowdhary1432@gmail.com").first()
print("Found user:", user.id, user.email)
print("is_verified:", user.is_verified)
print("has password:", user.password is not None)

try:
    result = pwd_context.verify("test123", user.password)
    print("Password match:", result)
except Exception as e:
    print("Password error:", e)

# Check all columns exist
print("github_id:", user.github_id)
print("streak_days:", user.streak_days)
print("contributions:", user.contributions)
print("created_at:", user.created_at)
print("last_login:", user.last_login)
