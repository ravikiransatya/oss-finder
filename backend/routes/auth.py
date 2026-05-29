from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from database import get_db
from models.user import User

import httpx
import os
import jwt

from dotenv import load_dotenv
from datetime import datetime, timedelta

from passlib.context import CryptContext
from pydantic import BaseModel
import secrets
from services.email import send_verification_email, send_reset_email

from urllib.parse import unquote

load_dotenv()

router = APIRouter()

# =========================
# ENV
# =========================

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "change-this-secret-in-production"
)

JWT_ALGORITHM = "HS256"

JWT_EXPIRE_DAYS = 30

# PASSWORD HASHING
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# =========================
# REQUEST MODELS
# =========================

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# =========================
# JWT HELPERS
# =========================

def create_token(user_id: int) -> str:

    payload = {
        "sub": str(user_id),

        "exp": datetime.utcnow()
        + timedelta(days=JWT_EXPIRE_DAYS),
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )


def verify_token(token: str) -> int:

    try:

        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        return int(payload["sub"])

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


# =========================
# AUTH USER
# =========================

def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:

    auth_header = request.headers.get(
        "Authorization",
        ""
    )

    if not auth_header.startswith("Bearer "):

        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    token = auth_header[7:]

    user_id = verify_token(token)

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


# =========================
# EMAIL REGISTER
# =========================

@router.post("/auth/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = pwd_context.hash(
        data.password
    )

    user = User(
        github_id=None,
        username=data.username,
        name=data.username,
        avatar="",
        bio="",
        email=data.email,
        github_url="",
        password=hashed_password,
        skills=[],
        experience="beginner",
        is_verified=0,
        verify_token=secrets.token_urlsafe(32),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        send_verification_email(user.email, user.username, user.verify_token)
    except Exception:
        pass  # don't block registration if email fails

    return {"message": "Registration successful. Please check your email to verify your account."}


# =========================
# VERIFY EMAIL
# =========================

@router.get("/auth/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verify_token == token).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")

    user.is_verified = 1
    user.verify_token = None
    db.commit()

    return {"message": "Email verified successfully. You can now sign in."}


# =========================
# EMAIL LOGIN
# =========================

@router.post("/auth/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not user.password:
        raise HTTPException(status_code=401, detail="Use GitHub login")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before signing in")

    valid_password = pwd_context.verify(
        data.password,
        user.password
    )

    if not valid_password:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_token(user.id)

    return {
        "access_token": token,
        "user": user_to_dict(user)
    }


# =========================
# FORGOT PASSWORD
# =========================

@router.post("/auth/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    # Always return success to prevent email enumeration
    if user and user.password:
        user.reset_token = secrets.token_urlsafe(32)
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        try:
            send_reset_email(user.email, user.username, user.reset_token)
        except Exception:
            pass
    return {"message": "If that email exists, a reset link has been sent."}


# =========================
# RESET PASSWORD
# =========================

@router.post("/auth/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == data.token).first()
    if not user or not user.reset_token_expiry:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    if datetime.utcnow() > user.reset_token_expiry:
        raise HTTPException(status_code=400, detail="Reset link has expired")
    user.password = pwd_context.hash(data.password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    return {"message": "Password reset successfully. You can now sign in."}


# =========================
# GITHUB LOGIN URL
# =========================

@router.get("/auth/github")
def github_login(state: str = "login"):
    # state = "login" for new login, or JWT token for linking to existing account
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&scope=read:user,user:email"
        f"&redirect_uri={frontend_url}/auth/callback"
        f"&state={state}"
    )
    return {"url": url}


# =========================
# GITHUB CALLBACK (handles both login + link)
# =========================

@router.get("/auth/github/callback")
async def github_callback(code: str, state: str = "login", db: Session = Depends(get_db)):
    print(f"GitHub callback received: code={code[:10]}..., state={state}")
    
    try:
        # Exchange code for GitHub access token
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(
                "https://github.com/login/oauth/access_token",
                json={"client_id": GITHUB_CLIENT_ID, "client_secret": GITHUB_CLIENT_SECRET, "code": code},
                headers={"Accept": "application/json"},
            )
            token_data = token_resp.json()
            print(f"GitHub token response: {token_data}")
            
            access_token = token_data.get("access_token")
            if not access_token:
                print(f"No access token in response: {token_data}")
                raise HTTPException(status_code=400, detail="Failed to get GitHub token")

            gh_resp = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"token {access_token}"},
            )
            gh_user = gh_resp.json()
            print(f"GitHub user data: {gh_user.get('login', 'unknown')}")

        # --- LINK MODE: state is a gh_link_ key (resolved by frontend) or raw JWT ---
        if state != "login":
            try:
                # Accept both raw JWT and gh_link_ resolved JWT
                token_to_verify = unquote(state)
                user_id = verify_token(token_to_verify)
                db_user = db.query(User).filter(User.id == user_id).first()
                if not db_user:
                    raise HTTPException(status_code=401, detail="User not found")
                print(f"Linking GitHub to existing user: {db_user.username}")
                db_user.github_id  = gh_user["id"]
                db_user.github_url = gh_user.get("html_url", db_user.github_url)
                db_user.avatar     = gh_user.get("avatar_url", db_user.avatar)
                db_user.last_login = datetime.utcnow()
                db.commit()
                db.refresh(db_user)
                return {"access_token": create_token(db_user.id), "user": user_to_dict(db_user)}
            except HTTPException:
                raise
            except Exception as e:
                print(f"Link mode failed: {e}")
                # state was not a valid JWT — fall through to login mode
                pass

        # --- LOGIN MODE: find or create user by github_id ---
        db_user = db.query(User).filter(User.github_id == gh_user["id"]).first()

        # Also check if email already exists (merge accounts)
        gh_email = gh_user.get("email") or ""
        if not db_user and gh_email:
            db_user = db.query(User).filter(User.email == gh_email).first()

        if not db_user:
            print(f"Creating new user for GitHub: {gh_user.get('login')}")
            db_user = User(
                github_id=gh_user["id"],
                username=gh_user.get("login", ""),
                name=gh_user.get("name") or gh_user.get("login", ""),
                avatar=gh_user.get("avatar_url", ""),
                bio=gh_user.get("bio") or "",
                email=gh_email,
                github_url=gh_user.get("html_url", ""),
                skills=[],
                experience="beginner",
                is_verified=1,
            )
            db.add(db_user)
        else:
            print(f"Updating existing user: {db_user.username}")
            # Existing user — only update GitHub fields
            db_user.github_id  = gh_user["id"]
            db_user.github_url = gh_user.get("html_url", db_user.github_url)
            db_user.avatar     = gh_user.get("avatar_url", db_user.avatar)
            db_user.last_login = datetime.utcnow()

        db.commit()
        db.refresh(db_user)
        print(f"GitHub auth successful for user: {db_user.username}")
        return {"access_token": create_token(db_user.id), "user": user_to_dict(db_user)}
        
    except Exception as e:
        print(f"GitHub callback error: {e}")
        raise HTTPException(status_code=500, detail=f"GitHub authentication failed: {str(e)}")


# =========================
# GOOGLE LOGIN URL
# =========================

@router.get("/auth/google")
def google_login():
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={frontend_url}/auth/google/callback"
        f"&response_type=code"
        f"&scope=openid email profile"
        f"&access_type=offline"
    )
    return {"url": url}


# =========================
# GOOGLE CALLBACK
# =========================

@router.get("/auth/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": f"{frontend_url}/auth/google/callback",
            },
        )
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to get Google token")

        user_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        g_user = user_resp.json()

    email = g_user.get("email", "")
    db_user = db.query(User).filter(User.email == email).first()

    if not db_user:
        db_user = User(
            github_id=None,
            username=email.split("@")[0],
            name=g_user.get("name", ""),
            avatar=g_user.get("picture", ""),
            bio="",
            email=email,
            github_url="",
            skills=[],
            experience="beginner",
            is_verified=1,
        )
        db.add(db_user)
    else:
        db_user.avatar = g_user.get("picture", db_user.avatar)
        db_user.name = g_user.get("name", db_user.name)
        db_user.is_verified = 1
        db_user.last_login = datetime.utcnow()

    db.commit()
    db.refresh(db_user)
    jwt_token = create_token(db_user.id)
    return {"access_token": jwt_token, "user": user_to_dict(db_user)}


# =========================
# SERIALIZER
# =========================

def user_to_dict(user: User) -> dict:

    return {
        "id": user.id,

        "github_id": user.github_id,

        "username": user.username,

        "name": user.name,

        "avatar": user.avatar,

        "bio": user.bio,

        "email": user.email,

        "github_url": user.github_url,

        "skills": user.skills or [],

        "experience": user.experience,

        "streak_days": user.streak_days,

        "contributions": user.contributions,

        "created_at":
            user.created_at.isoformat()
            if user.created_at
            else None,

        "last_login":
            user.last_login.isoformat()
            if user.last_login
            else None,
    }