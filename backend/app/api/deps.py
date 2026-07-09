from fastapi import Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import User
from app.db.session import get_db
from app.services.auth import decode_access_token

async def get_current_user(
        authorization: str = Header(None),
        db: AsyncSession = Depends(get_db),
) -> User :
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    
    token = authorization.removeprefix("Bearer ")
    user_id = decode_access_token(token)

    if not user_id:
        raise HTTPException(401, "Invalid or expired token")
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(401, "User not found")
    
    return user 