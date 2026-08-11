from fastapi import Header, HTTPException, status
from typing import Optional, Dict, Any
from app.auth_utils import decode_jwt_token
from app.db import db

async def get_current_user(
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="x-auth-token")
) -> Dict[str, Any]:
    token = None
    
    # 1. Extract token from Authorization header or x-auth-token
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    elif x_auth_token:
        token = x_auth_token
        
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "No token, authorization denied"}
        )
        
    # 2. Decode token
    payload = decode_jwt_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Token is invalid or expired"}
        )
        
    user_id = payload.get("id")
    
    # 3. Find user
    user = None
    if user_id:
        user = await db.find_user_by_id(user_id)
        
    if not user:
        # Create a fallback user dictionary matching Node.js structure
        fallback_id = user_id if user_id else "000000000000000000000001"
        user = {
            "_id": fallback_id,
            "id": fallback_id,
            "name": "Learner",
            "email": "user@wetalk.com",
            "isFallbackUser": True,
            "xp": 0,
            "coins": 0,
            "wtCoins": 0,
            "streak": 0,
            "progressData": {},
        }
        
    return user
