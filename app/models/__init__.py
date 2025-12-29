from .blob         import Blob, BlobType, blob_db
from .comment      import Comment, comment_db
from .file         import File, FileMode, FileType, FileVisibility, Dir, file_db
from .notification import Notification, notification_db
from .pen          import Pen, pen_db
from .revision     import Revision, revision_db
from .shortlink    import ShortLink, shortlink_db
from .tmpfile      import TmpFile, TmpFolder, tmpfile_db
from .user         import User, user_db

dbs = (
    blob_db,
    comment_db,
    file_db,
    notification_db,
    pen_db,
    revision_db,
    shortlink_db,
    tmpfile_db,
    user_db,
)

def connect_all_dbs():
    for db in dbs:
        if db.is_closed():
            db.connect()

def close_all_dbs():
    for db in dbs:
        if not db.is_closed():
            db.close()
