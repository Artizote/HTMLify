from time import sleep

from app.config import *


def search_indexing_daemon(TermFrequency, app, files):
    with app.app_context():
        while True:
            sleep(SEARCH_INDEXING_TIME_DELAY)
            file_count = files.query.order_by(files.id.desc()).first()
            if not file_count:
                continue
            for id in range(1, file_count.id+1):
                TermFrequency.feed(id)

def process_pool_purger(process_pool):
    """Removes completed process from `process_pool`"""
    while True:
        sleep(60)
        for p in process_pool:
            if p["proc"].poll() is not None:
                process_pool.remove(p)

def tmp_file_purger(TmpFile):
    """Deletes expire temp files"""
    while True:
        sleep(60)
        TmpFile.purge()

def tmp_folder_purger(TmpFolder):
    """Deletes empty temp folders"""
    to_be_delete = []
    while True:
        sleep(600)
        for folder in to_be_delete:
            if not folder.files:
                folder.delete_instance()
        to_be_delete = list(TmpFolder.select().where(TmpFolder.file_codes==""))
