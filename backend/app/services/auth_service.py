import jwt
from fastapi import Security, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader
from starlette import status

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from app.services.user_service import UserService, User
from app.config import SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS


oauth2_scheme = OAuth2PasswordBearer(
    "/v1/auth/token",
    auto_error=False
)

api_key_scheme = APIKeyHeader(
    name="X-API-Key",
    auto_error=False
)


class AuthService:

    SECRET_KEY = SECRET_KEY
    ALGORITHM = "HS256"

    @staticmethod
    def authenticate_user(username: str, password: str) -> Optional[User]:
        user = UserService.get_user(username)
        if not user:
            return None
        auth = UserService.auth_user(user, password)
        if auth:
            return user
        return None

    @staticmethod
    def jwt_encode(to_encode: Dict[str, Any]):
        return jwt.encode(to_encode, AuthService.SECRET_KEY, algorithm=AuthService.ALGORITHM)

    @staticmethod
    def jwt_decode(token: str | bytes):
        return jwt.decode(token, AuthService.SECRET_KEY, algorithms=[AuthService.ALGORITHM])

    @staticmethod
    def create_access_token(data: Dict[str, Any]) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = AuthService.jwt_encode(to_encode)
        return encoded_jwt

    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = AuthService.jwt_encode(to_encode)
        return encoded_jwt

    @staticmethod
    def get_user_by_token(token: str):
        try:
            payload = AuthService.jwt_decode(token)
            username = payload.get("sub")
            if not username:
                return None
            return UserService.get_user(username)
        except:
            return None

    @staticmethod
    def get_user_by_api_key(api_key: str):
        return UserService.get_user_by_api_key(api_key)

    @staticmethod
    def get_current_user(
        request: Request,
        token: str | None = Security(oauth2_scheme),
        api_key: str | None = Security(api_key_scheme),
    ) -> User:

        user = None

        if not token:
            token = request.cookies.get("access_token")

        if token:
            user = AuthService.get_user_by_token(token)

        if not user and api_key:
            user = AuthService.get_user_by_api_key(api_key)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

        return user

    @staticmethod
    def get_or_none_current_user(
        request: Request,
        token: str | None = Security(oauth2_scheme),
        api_key: str | None = Security(api_key_scheme),
    ) -> Optional[User]:
        user = None
        if not token:
            token = request.cookies.get("access_token")

        if token:
            user = AuthService.get_user_by_token(token)
        if not user and api_key:
            user = AuthService.get_user_by_api_key(api_key)
        return user


