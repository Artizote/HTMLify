from peewee import SqliteDatabase, Model, AutoField, IntegerField, CharField, TimestampField

from datetime import datetime, UTC


revision_db = SqliteDatabase("instance/revisions.db")


class Revision(Model):
    """ Revision """

    class Meta:
        database = revision_db

    id = AutoField()
    file_id : int | IntegerField = IntegerField()
    blob_hash : str | CharField = CharField(64)
    timestamp : datetime | TimestampField = TimestampField(default=lambda:datetime.now(UTC))

    @classmethod
    def by_id(cls, id):
        return cls.get_or_none(cls.id==id)

    @classmethod
    def make_for(cls, file):
        from .file import File
        if isinstance(file, int):
            file = File.by_id(file)
        if not file:
            return
        
        revision = cls.create(
            file_id = file.id,
            blob_hash = file.blob_hash
        )
        return revision

    def to_dict(self, show_content: bool = True):
        if show_content:
            content = self.blob.get_base64()
        else:
            content = None
        return {
            "id": self.id,
            "file": self.file_id,
            "blob_hash": self.blob_hash,
            "prev": self.prev.id if self.prev else None,
            "next": self.next.id if self.next else None,
            "timestamp": self.timestamp.timestamp(),
            "content": content,
        }

    @property
    def prev(self):
        q = Revision.select().where(
            (Revision.file_id == self.file_id) &
            (Revision.timestamp < self.timestamp)
            )
        if q.count():
            return q.first()

    @property
    def next(self):
        q = Revision.select().where(
            (Revision.file_id == self.file_id) &
            (Revision.timestamp > self.timestamp)
            ).order_by(Revision.id.desc())
        if q.count():
            return q.first()

    @property
    def blob(self) -> "Blob":
        from .blob import Blob
        return Blob[self.blob_hash]

    @property
    def content(self):
        blob = self.blob
        if blob:
            return blob.get_content()
        return None

    @property
    def file(self):
        from .file import File
        file = File.by_id(self.file_id)
        return file


revision_db.create_tables([Revision])
