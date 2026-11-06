from app.models import *
from app.utils import TimedCache


class StatsService:
    """Statistics Service for Resources"""

    cache = TimedCache(900)


    @classmethod
    def all_stats(cls):
        return {
            "user":      cls.user_stats(),
            "blob":      cls.blob_stats(),
            "file":      cls.file_stats(),
            "pen":       cls.pen_stats(),
            "shortlink": cls.shortlink_stats(),
            "tmpfile":   cls.tmpfile_stats(),
            "tmpfolder": cls.tmpfolder_stats()
        }


    # User
    @classmethod
    def user_stats(cls):
        return {
            "count": cls.user_count()
        }

    @staticmethod
    @cache.cache_fetcher
    def user_count():
        return User.select().count()


    # Blob
    @classmethod
    def blob_stats(cls):
        return {
            "count": cls.blob_count(),
            "size": cls.blob_size(),
        }

    @staticmethod
    @cache.cache_fetcher
    def blob_count():
        return Blob.select().count()

    @staticmethod
    @cache.cache_fetcher
    def blob_size():
        return sum(map(lambda x:x.size, Blob.select(Blob.size)))


    # File
    @classmethod
    def file_stats(cls):
        return {
            "count": cls.file_count(),
            "size": cls.file_size(),
            "hits": cls.file_hits(),
        }

    @staticmethod
    @cache.cache_fetcher
    def file_count():
        return File.select().count()

    @staticmethod
    @cache.cache_fetcher
    def file_size():
        size = 0
        for file in File.select():
            size += file.size
        return size

    @staticmethod
    @cache.cache_fetcher
    def file_hits():
        return sum(map(lambda x:x.views, File.select(File.views)))


    # Pen
    @classmethod
    def pen_stats(cls):
        return {
            "count": cls.pen_count(),
            "hits": cls.pen_hits(),
        }

    @staticmethod
    @cache.cache_fetcher
    def pen_count():
        return Pen.select().count()

    @staticmethod
    @cache.cache_fetcher
    def pen_hits():
        return sum(map(lambda x:x.views, Pen.select(Pen.views)))


    # ShortLink
    @classmethod
    def shortlink_stats(cls):
        return {
            "count": cls.shortlink_count(),
            "hits": cls.shortlink_hits(),
        }

    @staticmethod
    @cache.cache_fetcher
    def shortlink_count():
        return ShortLink.select().count()

    @staticmethod
    @cache.cache_fetcher
    def shortlink_hits():
        return sum(map(lambda x:x.views, Pen.select(Pen.views)))


    # TmpFile
    @classmethod
    def tmpfile_stats(cls):
        return {
            "count": cls.tmpfile_count(),
            "size": cls.tmpfile_size(),
        }

    @staticmethod
    @cache.cache_fetcher
    def tmpfile_count():
        return TmpFile.select().count()

    @staticmethod
    @cache.cache_fetcher
    def tmpfile_size():
        s = 0
        for tmpfile in TmpFile.select():
            s += tmpfile.blob.size
        return s


    # TmpFolder
    @classmethod
    def tmpfolder_stats(cls):
        return {
            "count": cls.tmpfolder_count(),
        }

    @staticmethod
    @cache.cache_fetcher
    def tmpfolder_count():
        return TmpFolder.select().count()


