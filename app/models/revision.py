from peewee import SqliteDatabase, Model, AutoField, IntegerField, CharField, DateTimeField

from datetime import datetime, UTC


revision_db = SqliteDatabase("instance/revisions.db")


class Revision(Model):
    """ Revision """

    class Meta:
        database = revision_db

    id = AutoField()
    file_id : int | IntegerField = IntegerField()
    blob_hash : str | CharField = CharField(64)
    timestamp : datetime | DateTimeField = DateTimeField(default=lambda:datetime.now(UTC))

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

    def prev(self):
        q = Revision.select().where(
            (Revision.file_id == self.file_id) &
            (Revision.timestamp < self.timestamp)
            )
        if q.count():
            return q.first()

    def next(self):
        q = Revision.select().where(
            (Revision.file_id == self.file_id) &
            (Revision.timestamp > self.timestamp)
            ).order_by(Revision.id.desc())
        if q.count():
            return q.first()

    @property
    def blob(self):
        from .blob import Blob
        return Blob[self.blob_hash]

    @property
    def content(self):
        blob = self.blob
        if blob:
            return blob.get_content()
        return None


revision_db.create_tables([Revision])
