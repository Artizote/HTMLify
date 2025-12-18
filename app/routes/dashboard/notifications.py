from flask import g, redirect, render_template

from app.models import Notification
from .dashboard import dashboard


@dashboard.route("/notifications")
def veiw_notifications():
    notifications = g.user.notifications
    return render_template("notifications.html", notifications=notifications)

@dashboard.route("/notifications/<int:id>")
def notification_redirect(id):
    notification = Notification.by_id(id)
    if not notification:
        return redirect("/notifications")
    if notification.user_id != g.user.id:
        return redirect("/")
    return redirect(notification.href)

