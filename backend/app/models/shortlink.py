from peewee import Model, SqliteDatabase, AutoField, IntegerField, TextField, CharField

from ..utils import randstr
from ..config import SCHEME, SERVER_NAME

shortlink_db = SqliteDatabase("instance/shortlinks.db")


class ShortLink(Model):
    """ ShortLink """

    class Meta:
        database = shortlink_db

    id = AutoField()
    href : str | TextField = TextField()
    short : str | CharField = CharField(8, unique=True)
    visits : int | IntegerField = IntegerField(default=0)

    @classmethod
    def by_id(cls, id) -> "ShortLink":
        return cls.get_or_none(cls.id==id)

    @classmethod
    def by_short(cls, short) -> "ShortLink":
        return cls.get_or_none(cls.short==short)

    @classmethod
    def create(cls, href, new=False):
        q = cls.select().where(cls.href==href)
        if not new and q.count():
            return q.first()
        for l in range(4, 8):
            short = randstr(l)
            if not cls.by_short(short):
                break
        sl = super().create(
            short = short,
            href = href
        )
        return sl

    def hit(self):
        self.visits += 1
        self.save()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "href": self.href,
            "short": self.short,
            "hits": self.visits,
            "url": self.url,
        }

    @property
    def url(self) -> str:
        return f"{SCHEME}://{SERVER_NAME}/r/{self.short}"


shortlink_db.create_tables([ShortLink])
