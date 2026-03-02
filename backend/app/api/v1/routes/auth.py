from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from fastapi.security import OAuth2PasswordRequestForm

from typing import Annotated

from app.services.auth_service import AuthService
from ..schemas.auth import *


router = APIRouter(tags=["Auth"])


@router.post("/auth/token")
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) ->  TokenResponse:
    user = AuthService.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Inocorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token = AuthService.create_access_token({"sub": user.username})
    refresh_token = AuthService.create_refresh_token({"sub": user.username})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.get("/auth/refresh")
def refresh_access_token(data: RefreshTokenRequest):
    try:
        jwt_data = AuthService.jwt_decode(data.refresh_token)
    except Exception as e:
        print(e)
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Invalid or expired token"
        )

    type = jwt_data.get("type")
    if not type or type != "refresh":
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Invalid token type"
        )

    username = jwt_data.get("sub")
    if not username:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Invald token"
        )

    access_token = AuthService.create_access_token({"sub": username})

    return RefreshTokenResponse(access_token=access_token)

