from fastapi import APIRouter, Depends, HTTPException, Query, Form, UploadFile, File as FFile, Path
from fastapi.responses import PlainTextResponse
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

@router.get("/pens/{id}/content/{part}")
def get_pen_content(
    pen: Pen = Depends(PenService.pen_from_path_dependency),
    part: PenPart = Path(),
) -> str | bytes:
    match part:
        case "head":
            return pen.head_content
        case "body":
            return pen.body_content
        case "css":
            return pen.css_content
        case "js":
            return pen.js_content
    raise HTTPException(status.HTTP_400_BAD_REQUEST)

@router.put("/pens/{id}/content/{part}", status_code=status.HTTP_204_NO_CONTENT)
async def update_pen_content(
    pen: Pen = Depends(PenService.pen_from_path_dependency),
    user: User = Depends(AuthService.get_current_user),
    part: PenPart = Path(),
    file: UploadFile = FFile(None),
    content: Optional[str | bytes] = Form(None),
):
    if pen.user != user:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You are not authrized for this operation")
    
    if file:
        content = await file.read()

    match part:
        case "head":
            pen.head_content = content or ""
        case "body":
            pen.body_content = content or ""
        case "css":
            pen.css_content = content or ""
        case "js":
            pen.js_content = content or ""

    pen.save()
    pen.update_modified_time()

@router.patch("/pens/{id}/update")
async def update_pen_by_form(
    pen: Pen = Depends(PenService.pen_from_path_dependency),
    user: User = Depends(AuthService.get_current_user),
    title: Optional[str] = Form(None),
    head_file: Optional[UploadFile] = FFile(None),
    head_content: Optional[str | bytes] = Form(None),
    body_file: Optional[UploadFile] = FFile(None),
    body_content: Optional[str | bytes] = Form(None),
    css_file: Optional[UploadFile] = FFile(None),
    css_content: Optional[str | bytes] = Form(None),
    js_file: Optional[UploadFile] = FFile(None),
    js_content: Optional[str | bytes] = Form(None),
    show_content: bool = Query(False),
) -> PenRead:

    if head_file:
        head_content = await head_file.read()
    if body_file:
        body_content = await body_file.read()
    if css_file:
        css_content = await css_file.read()
    if js_file:
        js_content = await js_file.read()

    updated_pen = PenService.update_pen(
        user,
        pen,
        title,
        head_content,
        body_content,
        css_content,
        js_content
    )

    return PenRead.from_orm(updated_pen, show_content=show_content)

