from app.models import *


class StatsService:
    """Statistics Service for Resources"""

    # TODO: time based caching


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
    def blob_count():
        return Blob.select().count()

    @staticmethod
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
    def file_count():
        return File.select().count()

    @staticmethod
    def file_size():
        size = 0
        for file in File.select():
            size += file.size
        return size

    @staticmethod
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
    def pen_count():
        return Pen.select().count()

    @staticmethod
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
    def shortlink_count():
        return ShortLink.select().count()

    @staticmethod
    def shortlink_hits():
        return sum(map(lambda x:x.views, Pen.select(Pen.views)))


    # TmpFile
    @classmethod
    def tmpfile_stats(cls):
        return {
            "count": cls.tmpfile_count(),
        }

    @staticmethod
    def tmpfile_count():
        return TmpFile.select().count()


    # TmpFolder
    @classmethod
    def tmpfolder_stats(cls):
        return {
            "count": cls.tmpfolder_count(),
        }

    @staticmethod
    def tmpfolder_count():
        return TmpFolder.select().count()


