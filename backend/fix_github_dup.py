import sys, os
sys.path.insert(0, os.path.dirname(__file__))
os.chdir(os.path.dirname(__file__))

from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Show all users with this github_id
    rows = conn.execute(text("SELECT id, email, github_id, username FROM users WHERE github_id = 189962778")).fetchall()
    print("Users with this github_id:", rows)

    # Clear github_id from all users except id=5 (your main account)
    conn.execute(text("UPDATE users SET github_id = NULL, github_url = '', avatar = '' WHERE github_id = 189962778 AND id != 5"))
    conn.commit()
    print("Cleared duplicate github_id from other users")

    # Verify
    rows = conn.execute(text("SELECT id, email, github_id FROM users")).fetchall()
    for r in rows:
        print(r)
