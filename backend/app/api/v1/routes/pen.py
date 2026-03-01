from fastapi import APIRouter, Depends, HTTPException, Query
from starlette import status

from app.services.pen_service import PenService
from app.services.auth_service import AuthService
from app.models import Pen, User
from ..schemas.pen import *


router = APIRouter(tags=["Pen"])


@router.get("/pens")
def get_user_pens(user: User = Depends(AuthService.get_current_user)) -> list[PenRead]:
    pens = PenService.get_user_pens(str(user.username))
    return [PenRead.from_orm(pen) for pen in pens]

@router.get("/pens/{id}")
def get_pen_by_id(pen: Pen = Depends(PenService.pen_from_path_dependency), show_content: bool = Query(False)) -> PenRead:
    return PenRead.from_orm(pen, show_content=show_content)

@router.post("/pens")
def create_pen(data: PenCreate, user: User = Depends(AuthService.get_current_user)) -> PenRead:
    pen = PenService.create_pen(str(user.username), data.title)
    return PenRead.from_orm(pen)

@router.patch("/pens/{id}")
def update_pen(
    data: PenUpdate,
    user: User = Depends(AuthService.get_current_user),
    pen: Pen = Depends(PenService.pen_from_path_dependency),
    show_content: bool = Query(False)
) -> PenRead:
    if pen.user != user:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "You are not authrized to edit this pen"
        )

    if data.title:
        pen.title = data.title
    if data.head_content:
        pen.head_content = data.head_content.encode()
    if data.body_content:
        pen.body_content = data.body_content.encode()
    if data.css_content:
        pen.css_content = data.css_content.encode()
    if data.js_content:
        pen.js_content = data.js_content.encode()

    pen.save()

    return PenRead.from_orm(pen, show_content=show_content)

@router.delete("/pens/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pen(user: User = Depends(AuthService.get_current_user), pen: Pen = Depends(PenService.pen_from_path_dependency)):
    if pen.user != user:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "You are not authrized to delete this pen"
        )
    pen.delete_instance()

