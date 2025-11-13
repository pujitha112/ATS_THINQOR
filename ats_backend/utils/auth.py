# ats_backend/utils/auth.py
from flask import request, session

def get_current_user():
    """
    Returns a dict like {"id": ..., "name": ..., "role": ..., "client_id": ...}
    Tries, in order:
      1) JWT (if you later add flask_jwt_extended)
      2) Flask session
      3) 'user' object in request.json (fallback used by your frontend)
    """
    # 1) JWT (optional)
    try:
        from flask_jwt_extended import get_jwt_identity
        ident = get_jwt_identity()
        if ident:  # typically a dict you set at login
            return ident
    except Exception:
        pass

    # 2) Flask session (if you store user there)
    if isinstance(session.get("user"), dict):
        return session["user"]

    # 3) Body fallback (your frontend can send { user: {...} })
    try:
        body = request.get_json(silent=True) or {}
        if isinstance(body.get("user"), dict):
            return body["user"]
    except Exception:
        pass

    # Fallback anonymous
    return {"id": None, "name": "Unknown", "role": "GUEST", "client_id": None}
