import resend
import os
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY", "")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
FROM_EMAIL   = os.getenv("FROM_EMAIL", "onboarding@resend.dev")


def send_verification_email(to_email: str, username: str, token: str):
    verify_url = f"{FRONTEND_URL}/auth/verify-email?token={token}"
    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": to_email,
        "subject": "Verify your OSS Finder account",
        "html": f"""
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="font-size:22px;color:#0a0c10;margin-bottom:8px">Verify your email</h2>
          <p style="color:#6b7280;font-size:15px;margin-bottom:24px">
            Hi <strong>{username}</strong>, click the button below to verify your OSS Finder account.
          </p>
          <a href="{verify_url}"
             style="display:inline-block;background:#0f62fe;color:#fff;padding:12px 28px;
                    border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
            Verify Email
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">
            Link expires in 24 hours. If you didn't sign up, ignore this email.
          </p>
        </div>
        """
    })


def send_reset_email(to_email: str, username: str, token: str):
    reset_url = f"{FRONTEND_URL}/auth/reset-password?token={token}"
    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": to_email,
        "subject": "Reset your OSS Finder password",
        "html": f"""
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="font-size:22px;color:#0a0c10;margin-bottom:8px">Reset your password</h2>
          <p style="color:#6b7280;font-size:15px;margin-bottom:24px">
            Hi <strong>{username}</strong>, click the button below to reset your password.
          </p>
          <a href="{reset_url}"
             style="display:inline-block;background:#0f62fe;color:#fff;padding:12px 28px;
                    border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
            Reset Password
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">
            Link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
        </div>
        """
    })
