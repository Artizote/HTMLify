from peewee import Model, SqliteDatabase, AutoField, CharField, DateTimeField, TextField

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

    def to_dict(self):
        return {
            "name": self.name,
            "code": self.code,
            "expire": self.expiry,
        }

    @property
    def filepath(self) -> str:
        return os.path.abspath(os.path.join("media", "tmp", "tmp-file-" + str(self.id)))


class TmpFolder(Model):
    class Meta:
        database = tmpfile_database

    id = AutoField()
    name = CharField(default="")
    code = CharField(default=lambda:randstr(5))
    file_codes = TextField(default="")
    auth_code = CharField(default=lambda:randstr(10))

    @classmethod
    def by_code(cls, code: str) -> "TmpFolder":
        return cls.get_or_none(cls.code == code)

    def add_file(self, code_or_tmpfile):
        code = code_or_tmpfile
        if isinstance(code_or_tmpfile, TmpFile):
            code = code_or_tmpfile.code

        file = TmpFile.by_code(code)
        if not file:
            return

        codes = self.file_codes.split()
        if code not in codes:
            codes.append(code)
        self.file_codes = " ".join(codes)
        self.save()

    def remove_file(self, code_or_tmpfile):
        code = code_or_tmpfile
        if isinstance(code_or_tmpfile, TmpFile):
            code = code_or_tmpfile.code

        codes = self.file_codes.split()
        if code in codes:
            codes.remove(code)
            self.file_codes = " ".join(codes)
            self.save()

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "code": self.code,
            "files": [ file.to_dict() for file in self.files ],
        }

    @property
    def files(self) -> list[TmpFile]:
        tmp_files = []
        codes = self.file_codes.split()
        for code in codes:
            f = TmpFile.by_code(code)
            if f:
                tmp_files.append(f)
        return tmp_files

tmpfile_database.create_tables([TmpFile, TmpFolder])
