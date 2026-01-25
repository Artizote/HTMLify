from peewee import SqliteDatabase, Model, CharField, IntegerField, FloatField, TimestampField

from datetime import datetime, UTC
from time import sleep

from .file import File
from .pen import Pen


search_db = SqliteDatabase(
        "instance/search.db",
        pragmas={
            "journal_mode": "wal",
            "synchronous":  2,
            "busy_timeout": 8000,
        })

class SearchResultItemType:
    FILE = 1
    PEN  = 2

    file = 1
    pen  = 2


class SearchIndexStatus(Model):
    class Meta:
        database = search_db

    item_type:        int      | IntegerField   = IntegerField() # SearchResultItemType
    item_id:          str      | CharField      = CharField()
    last_index_time:  datetime | TimestampField = TimestampField(default=datetime.fromtimestamp(0))
    last_index_views: int      | IntegerField   = IntegerField(default=0)

    @classmethod
    def get_status(cls, item: File | Pen):
        item_type = 0
        item_id = ""

        if isinstance(item, File):
            item_type = SearchResultItemType.FILE
            item_id = str(item.id)
        if isinstance(item, Pen):
            item_type = SearchResultItemType.PEN
            item_id = str(item.id)

        if not item_type or not item_id:
            return None

        status, _= cls.get_or_create(
            item_id = item_id,
            item_type = item_type
        )
        return status

    def update_last_index_time(self):
        self.last_index_time = datetime.now(UTC)
        self.save()

    def update_last_index_views(self, views: int):
        self.last_index_views = views
        self.save()


class SearchResult(Model):
    class Meta:
        database = search_db

    token:     str   | CharField    = CharField(16,  index=True)
    score:     float | FloatField   = FloatField()
    item_type: int   | IntegerField = IntegerField() # SearchResultItemType
    item_id:   str   | CharField    = CharField(16)

    @classmethod
    def purge(cls):
        rs = cls.select()
        for r in rs:
            if not r.item:
                cls.delete().where(
                    cls.item_type==r.item_type
                    ).where(
                    cls.item_id==cls.item_id
                    ).execute()
            sleep(0.1)

    @classmethod
    def for_item(cls, item: File | Pen):
        item_type = 0
        item_id = ""
        if isinstance(item, File):
            item_type = SearchResultItemType.FILE
            item_id = str(item.id)
        if isinstance(item, Pen):
            item_type = SearchResultItemType.PEN
            item_id = str(item.id)

        return cls.select().where(cls.item_id==item_id).where(cls.item_type==item_type)

    @property
    def item_type_s(self) -> str:
        match self.item_type:
            case SearchResultItemType.FILE:
                return "file"
            case SearchResultItemType.PEN:
                return "pen"
            case _:
                return ""

    @property
    def item(self) -> File | Pen | None:
        item = None
        match self.item_type:
            case SearchResultItemType.FILE:
                item = File.by_id(self.item_id)
            case SearchResultItemType.PEN:
                item = Pen.by_id(self.item_id)
        return item

    @property
    def path(self) -> str:
        item = self.item
        if not item:
            return ""
        return str(item.path)

    @property
    def url(self) -> str:
        item = self.item
        if not item:
            return ""
        return str(item.url)


search_db.create_tables([SearchIndexStatus, SearchResult])
