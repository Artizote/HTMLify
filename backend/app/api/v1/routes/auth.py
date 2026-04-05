from fastapi import APIRouter, Depends, HTTPException, Request, Response
from starlette import status
from fastapi.security import OAuth2PasswordRequestForm

from typing import Annotated

from app.services.auth_service import AuthService
from ..schemas.auth import *


router = APIRouter(tags=["Auth"])

from app.config import (
    COOKIE_DOMAIN,
    COOKIE_SAMESITE,
    COOKIE_SECURE,
    COOKIE_MAX_AGE_ACCESS,
    COOKIE_MAX_AGE_REFRESH,
)



def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=COOKIE_MAX_AGE_ACCESS,
        domain=COOKIE_DOMAIN if COOKIE_DOMAIN else None,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=COOKIE_MAX_AGE_REFRESH,
        domain=COOKIE_DOMAIN if COOKIE_DOMAIN else None,
    )


@router.post("/auth/token")
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response
) -> TokenResponse:
    user = AuthService.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = AuthService.create_access_token({"sub": user.username})
    refresh_token = AuthService.create_refresh_token({"sub": user.username})
    _set_auth_cookies(response, access_token, refresh_token)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.get("/auth/refresh")
def refresh_access_token(request: Request, response: Response) -> RefreshTokenResponse:
    """Read refresh_token from httponly cookie and issue a new access_token cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No refresh token provided")

    try:
        jwt_data = AuthService.jwt_decode(refresh_token)
    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired refresh token")

    if jwt_data.get("type") != "refresh":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token type")

    username = jwt_data.get("sub")
    if not username:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token payload")

    access_token = AuthService.create_access_token({"sub": username})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=COOKIE_MAX_AGE_ACCESS,
        domain=COOKIE_DOMAIN if COOKIE_DOMAIN else None,
    )
    return RefreshTokenResponse(access_token=access_token)


@router.post("/auth/logout")
def logout(response: Response):
    """Clear both auth cookies."""
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"detail": "Logged out"}
