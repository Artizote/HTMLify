from peewee import SqliteDatabase, Model, AutoField, IntegerField, TextField, BooleanField, TimestampField

from typing import Optional 
from datetime import timedelta, datetime, UTC


notification_db = SqliteDatabase("notifications.db")


class Notification(Model):
    class Meta:
        database = notification_db

    id : int | AutoField = AutoField()
    user_id : int | IntegerField = IntegerField()
    content : str | TextField = TextField()
    href : str | TextField = TextField()
    viewed : bool | BooleanField = BooleanField(default=False)
    send_time : datetime | TimestampField = TimestampField(utc=True)
    view_time : datetime | TimestampField = TimestampField(default=0)

    @classmethod
    def by_id(cls, id) -> Optional["Notification"]:
        return cls.get_or_none(cls.id==id)

    @classmethod
    def notify(cls, user, message: str, href: str) -> Optional["Notification"]:
        """Send notification to `user`"""
        from .user import User
        if isinstance(user, str):
            user = User.by_username(user)
        if isinstance(user, int):
            user = User.by_id(user)
        if not user:
            return

        if not user.is_active:
            return

        n = cls.create(
            user_id = user.id,
            content = message,
            href = href
        )

        return n

    @classmethod
    def notify_all(cls, users, message: str, href: str) -> tuple[int, int]:
        """Send notification to all `users`"""
        total = 0
        sent = 0
        for user in users:
            n = cls.notify(user, message, href)
            if n:
                sent += 1
            total += 1
        return sent, total 

    @classmethod
    def broadcast(cls, message: str, href: str) -> tuple[int, int]:
        """Send notification to all users"""
        from .user import User
        users = User.select()
        total = int(users.count())
        sent = 0
        for user in users:
            n = cls.notify(user, message, href)
            if n:
                sent += 1
        return sent, total

    @classmethod
    def purge(cls):
        ns = cls.select().where(cls.viewed==True)
        expiry_period = timedelta(days=28).seconds
        for n in ns:
            if expiry_period > n.view_time - datetime.now(UTC):
                n.delete_instance()

    def mark_viewed(self):
        if self.viewed:
            return
        self.viewed = True
        self.view_time = datetime.now(UTC)
        self.save()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user": self.user_id,
            "content": self.content,
            "viewed": bool(self.viewed),
            "href": self.href,
            "send_time": self.send_time.timestamp(),
            "view_time": 0 if not self.view_time else self.view_time.timestamp(),
        }


notification_db.create_tables([Notification])
