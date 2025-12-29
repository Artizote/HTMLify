from peewee import SqliteDatabase, Model, CharField, IntegerField

from abc import abstractmethod
from base64 import b64encode, b64decode

from ..utils import file_path, hash_sha256


blob_db = SqliteDatabase(
        "instance/blobs.db",
        pragmas={
            "journal_mode": "wal",
            "synchronous":  2,
            "busy_timeout": 8000,
        })


class BlobType:
    """ Blob Type """
    TEXT    = 1
    BINARY  = 2

    text    = 1
    binary  = 2


class BlobMeta(type(Model)):
    """ Blob Metaclass """

    def __getitem__(self, hash: str):
        hash = hash.lower()
        return self.by_hash(hash)

    @abstractmethod
    def by_hash(cls, hash):
        pass


class Blob(Model, metaclass=BlobMeta):
    """ Blob """

    class Meta:
        database = blob_db

    hash : str | CharField = CharField(64, primary_key = True)
    size : int | IntegerField = IntegerField()
    type : int | IntegerField = IntegerField()

    def __repr__(self):
        return f"<Blob: {self.short_hash}>"

    def __str__(self):
        return self.get_str()

    def __hash__(self):
        return hash(self.hash)

    def __bytes__(self):
        return self.get_bytes()

    def __bool__(self):
        return bool(self.hash)

    def __len__(self):
        return self.size

    def __add__(self, other):
        return Blob(self.get_binary() + other.get_binary())

    def __eq__(self, other):
        if isinstance(other, str):
            return self.get_text() == other
        if isinstance(other, bytes):
            return self.get_binary() == other
        return self.hash == other.hash

    def __lt__(self, other):
        return self.size < other.size

    def __gt__(self, other):
        return self.size > other.size

    @classmethod
    def by_hash(cls, hash: str) -> "Blob":
        return cls.get_or_none(cls.hash == hash)

    @classmethod
    def from_base64(cls, data: str) -> "Blob":
        return cls.create(b64decode(data))

    @classmethod
    def from_bytes(cls, data: bytes) -> "Blob":
        return cls.create(data)

    @classmethod
    def from_file(cls, filepath: str) -> "Blob":
        with open(filepath, "rb") as file:
            data = file.read()
        return cls.create(data)

    @classmethod
    def from_str(cls, data: str) -> "Blob":
        return cls.create(data)

    @classmethod
    def create(cls, content: str | bytes) -> "Blob":
        hash = hash_sha256(content)
        size = len(content)
        filepath = file_path("blob", hash)

        if blob := cls.by_hash(hash):
            return blob

        if isinstance(content, bytes):
            try:
                content = content.decode()
            except:
                pass

        if isinstance(content, bytes):
            with open(filepath, "wb") as file:
                file.write(content)
            type = BlobType.BINARY
        else:
            with open(filepath, "wb") as file:
                file.write(content.encode())
            type = BlobType.TEXT

        blob = Blob(
            hash = hash,
            size = size,
            type = type
        )

        if not blob.verify():
            return Blob()

        blob = super().create(
            hash = hash,
            size = size,
            type = type
        )
        return blob

    def get_bytes(self) -> bytes:
        file = open(self.filepath, "rb")
        content = file.read()
        file.close()
        return content

    def get_str(self) -> str:
        content = self.get_bytes()
        try:
            return content.decode()
        except:
            return ""

    def get_binary(self) -> bytes:
        return self.get_bytes()

    def get_text(self) -> str:
        return self.get_str()

    def get_content(self) -> str | bytes:
        content = self.get_bytes()
        try:
            return content.decode()
        except:
            return content

    def get_base64(self) -> str:
        return b64encode(self.get_binary()).decode()

    def verify(self) -> bool:
        with open(self.filepath, "rb") as file:
            content = file.read()
            content_hash = hash_sha256(content)
        return content_hash == self.hash

    def to_bytes(self) -> bytes:
        return self.get_bytes()

    def to_str(self) -> str:
        return self.get_str()

    def to_base64(self) -> str:
        return self.get_base64()

    def to_dict(self, show_content=True) -> dict:
        return {
            "hash": self.hash,
            "size": self.size,
            "type": self.type_s,
            "content": self.get_base64() if show_content else None
        }

    @property
    def filepath(self) -> str:
        return file_path("blob", self.hash)

    @property
    def short_hash(self) -> str:
        return self.hash[:8]

    @property
    def content(self) -> str | bytes:
        return self.get_content()

    @property
    def is_text(self) -> bool:
        return BlobType.text == self.type

    @property
    def is_binary(self) -> bool:
        return BlobType.binary == self.type

    @property
    def type_s(self) -> str:
        match self.type:
            case BlobType.BINARY:
                return "binary"
            case BlobType.TEXT:
                return "text"
            case _:
                return ""


blob_db.create_tables([Blob])
