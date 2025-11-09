from peewee import SqliteDatabase, Model, AutoField, IntegerField, TextField, TimestampField

import re

from ..utils import escape_html


comment_db = SqliteDatabase("instance/comments.db")


class Comment(Model):
    """ Comment """

    class Meta:
        database = comment_db

    id = AutoField()
    file_id = IntegerField()
    user_id = IntegerField()
    content = TextField()
    timestamp = TimestampField(utc=True)

    @classmethod
    def by_id(cls, id) -> "Comment":
        return cls.get_or_none(cls.id==id)

    @classmethod
    def comment(cls, on, by, content):
        from .file import File
        from .user import User
        from .notification import Notification

        if not content or set(content) == {" "}:
            return False

        if isinstance(on, File):
            file = on
        else:
            file = File.by_id(on)

        if isinstance(by, User):
            user = by
        else:
            user = User.by_id(by)

        if not user or not file:
            return False

        if file.visibility_s != "public":
            return False

        content = content[:1024]
        content = escape_html(content.replace("\n", "<br>"))

        valid_tags = {
            "b", "u", "i", "s", "sub", "sup", "code", "br",
            "B", "U", "I", "S", "SUB", "SUP", "CODE", "BR",
        }

        for tag in valid_tags:
            content = content.replace("&lt;" + tag + "&gt;", "<" + tag + ">")
            content = content.replace("&lt;/" + tag + "&gt;", "</" + tag + ">")

        for tag in valid_tags:
            if tag.casefold() == "br":
                continue
            open_tags = content.count("<" + tag + ">")
            close_tags = content.count("</" + tag + ">")
            if open_tags > close_tags:
                content += ("</" + tag + ">") * (open_tags - close_tags)

        content = re.sub(r'@([\w/\.-]+)', r'<a href="/\1">@\1</a>', content)

        comment = cls.create(
            file_id = file.id,
            user_id = user.id,
            content = content
        )

        mp = re.compile(r"@([\w\.-]+)")
        mentions = set(re.findall(mp, content))

        for mention in mentions:
            Notification.notify(mention, "<b>" + user.username + "</b> mentioned you in the comment", "/src/"+file.path + "#comment-" + str(comment.id))
        if file.user.username != user.username:
            Notification.notify(file.user.username, "<b>" + user.username + "</b> comment something on " + file.name, "/src/"+file.path + "#comment-" + str(comment.id))

        return comment

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user": self.user_id,
            "file": self.file_id,
            "content": self.content,
            "timestamp": self.timestamp
        }

    @property
    def user(self) -> "User":
        from .user import User
        return User.by_id(self.user_id)

    @property
    def file(self) -> "File":
        from .file import File
        return File.by_id(self.file_id)


comment_db.create_tables([Comment])
