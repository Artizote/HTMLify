from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from app.models import User
from app.services.auth_service import AuthService
from app.services.user_service import *
from ..schemas.user import *


router = APIRouter(tags=["User"])


@router.post("/users")
def create_user(data: UserCreateRequest) -> UserFullInfo:
    try:
        user = UserService.create_user(data.username, data.email, data.password)
    except UsernameIsTooLong:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Username is not available")
    except UsernameNotAvailable:
        raise HTTPException(status.HTTP_409_CONFLICT, "Username not available")
    except UsernameNotValid:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Username not valid")
    except EmailNotValid:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Email is not valid")
    except EmailIsTaken:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email is taken")
    except:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal Error")

    return UserFullInfo.from_orm(user)

@router.get("/users/me")
def get_my_info(user: User = Depends(AuthService.get_current_user)) -> UserFullInfo:
    return UserFullInfo.from_orm(user)

@router.patch("/users/me")
def update_my_info(data: UserUpdateRequest, user: User = Depends(AuthService.get_current_user)) -> UserFullInfo:
    if data.name:
        UserService.update_user_name(str(user.username), data.name)
    if data.bio:
        UserService.update_user_bio(str(user.username), data.bio)
    if data.password:
        UserService.update_user_password(str(user.username), data.password)

    updated_user = UserService.get_user(str(user.username))
    return UserFullInfo.from_orm(updated_user)

@router.get("/users/{username}")
def get_user_info(username: str) -> UserPublicInfo:
    user = UserService.get_user(username)
    if not user:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "User not found with this username"
        )
    return UserPublicInfo.from_orm(user)

@router.get("/users/me/api-key")
def get_my_api_key(user: User = Depends(AuthService.get_current_user)) -> APIKeyResponse:
    return APIKeyResponse(api_key=str(user.api_key))

