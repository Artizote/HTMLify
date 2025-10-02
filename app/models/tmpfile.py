from peewee import Model, SqliteDatabase, AutoField, CharField, DateTimeField

import os
from datetime import datetime, timedelta

from app.utils.helpers import randstr

tmpfile_database = SqliteDatabase("instance/tmpfiles.db")

class TmpFile(Model):
    class Meta:
        database = tmpfile_database

    id = AutoField
    name = CharField()
    code = CharField()
    password = CharField(default="")
    expiry = DateTimeField(default=lambda:datetime.utcnow()+timedelta(days=1))
    
    @classmethod
    def by_code(cls, code: str) -> "TmpFile":
        return cls.get_or_none(cls.code == code)

    @classmethod
    def create_with_buffer(cls, buffer) -> "TmpFile":
        code = randstr(5)
        while cls.by_code(code):
            code = randstr(5)
         
        tf = TmpFile.create(
            name = buffer.name,
            code = code,
        )
         
        if buffer.__class__.__name__ == "FileStorage": # werkzeug's datastructer
            buffer.save(tf.filepath)
        else:
            f = open(tf.filepath, "wb")
            f.write(buffer.getvalue())
            f.close()

        cls.purge()

        return tf

    @classmethod
    def purge(cls):
        cls.delete().where(cls.expiry < datetime.utcnow()).execute()

    def delete_instance(self, **kwargs):
        os.remove(self.filepath)
        return super().delete_instance(**kwargs)

    def get_file(self):
        try:
            f = open(self.filepath, "rb")
            return f
        except:
            return None

    @property
    def filepath(self) -> str:
        return os.path.abspath(os.path.join("media", "tmp", "tmp-file-" + str(self.id)))

tmpfile_database.create_tables([TmpFile])
