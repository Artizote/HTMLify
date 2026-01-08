from peewee import Model, SqliteDatabase, AutoField, CharField, DateTimeField, TextField

from datetime import datetime, timedelta, UTC
from io import BytesIO

from .blob import Blob
from .base import PeeweeABCMeta, BlobDependent
from app.utils.helpers import randstr
from app.config import SCHEME, SERVER_NAME

tmpfile_db = SqliteDatabase("instance/tmpfiles.db")

class TmpFile(Model, BlobDependent, metaclass=PeeweeABCMeta):
    class Meta:
        database = tmpfile_db

    name : str | CharField = CharField()
    code : str | CharField = CharField(unique=True, index=True, default=lambda:TmpFile.new_code())
    blob_hash : str | CharField = CharField(64)
    password : str | CharField = CharField(default="")
    expiry = DateTimeField(default=lambda:datetime.now(UTC)+timedelta(days=1))
    
    @classmethod
    def by_code(cls, code: str) -> "TmpFile":
        return cls.get_or_none(cls.code == code)

    @classmethod
    def get_blob_dependents(cls, blob):
        if not isinstance(blob, str):
            blob_hash = blob.hash
        else:
            blob_hash = blob
        return cls.select().where(cls.blob_hash == blob_hash)

    @classmethod
    def create_with_buffer(cls, buffer) -> "TmpFile":
        name = buffer.name if buffer.name else "TmpFile"
        tb = BytesIO()
        
        if buffer.__class__.__name__ == "FileStorage": # werkzeug's datastructer
            buffer.save(tb)
        else:
            tb.write(buffer.getvalue())

        blob = Blob.create(tb.getvalue())
        tf = cls.create_with_blob(blob, name)
        return tf

    @classmethod
    def create_with_blob(cls, blob: Blob, name: str = "Temp File") -> "TmpFile":
        tf = cls.create(
            name = name,
            blob_hash = blob.hash
        )
        return tf

    @classmethod
    def new_code(cls) -> str:
        d = 5
        code = randstr(d)
        while cls.by_code(code):
            code = randstr(d)
            d += 1
        return code

    @classmethod
    def purge(cls):
        cls.delete().where(cls.expiry < datetime.now(UTC)).execute()

    def get_file(self):
        try:
            f = open(self.filepath, "rb")
            return f
        except:
            return None

    def to_dict(self, show_content=False) -> dict:
        return {
            "name": self.name,
            "code": self.code,
            "blob_hash": self.blob_hash,
            "content": self.blob.get_base64() if show_content else None,
            "expire": self.expiry,
            "url": f"{SCHEME}://{SERVER_NAME}/tmp/{self.code}"
        }

    @property
    def blob_dependencies(self) -> list[str]:
        return [str(self.blob_hash)]

    @property
    def blob(self) -> Blob:
        return Blob.by_hash(self.blob_hash)

    @property
    def filepath(self) -> str:
        return self.blob.filepath

    @property
    def path(self) -> str:
        return f"/tmp/{self.code}"

    @property
    def url(self) -> str:
        return f"{SCHEME}://{SERVER_NAME}{self.path}"

    @property
    def depends_on(self) -> list[Blob]:
        return [self.blob]


class TmpFolder(Model):
    class Meta:
        database = tmpfile_db

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

    def to_dict(self, show_auth_code=False) -> dict:
        return {
            "name": self.name,
            "code": self.code,
            "files": [ file.to_dict() for file in self.files ],
            "url": f"{SCHEME}://{SERVER_NAME}/tmp/f/{self.code}",
            "auth_code": self.auth_code if show_auth_code else None,
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

tmpfile_db.create_tables([TmpFile, TmpFolder])
