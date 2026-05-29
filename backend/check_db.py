import sys, os
sys.path.insert(0, os.path.dirname(__file__))
os.chdir(os.path.dirname(__file__))

from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    rows = conn.execute(text("SELECT id, email, password IS NOT NULL as has_pw, is_verified FROM users")).fetchall()
    for r in rows:
        print(r)
