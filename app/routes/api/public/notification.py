from flask import request, g

from app.models import Notification
from .api import *


@public_api.get("/notification")
@auth_require
def get_notification_():
    id = request.args.get("id", 0, int)

    notification = Notification.by_id(id)
    if not notification:
        return error_respones_dict(APIErrors.NOT_FOUND), 404

    if notification.user_id != g.auth_user.id:
        return error_respones_dict(APIErrors.FORBIDDEN), 403

    return {
        "success": True,
        "notification": notification.to_dict()
    }


@public_api.patch("/notification")
@auth_require
def markview_notification_():
    id = request.args.get("id", 0, int)

    notification = Notification.by_id(id)
    if not notification:
        return error_respones_dict(APIErrors.NOT_FOUND), 404

    if notification.user_id != g.auth_user.id:
        return error_respones_dict(APIErrors.FORBIDDEN), 403

    notification.mark_viewed()

    return {
        "success": True,
        "notification": notification.to_dict()
    }


@public_api.get("/notifications")
@auth_require
def get_notifications_():
    notifications = Notification.select().where(Notification.user_id==g.auth_user.id)
    return {
        "success": True,
        "notifications": [n.to_dict() for n in notifications]
    }

