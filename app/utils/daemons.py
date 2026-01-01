import os
from time import sleep

from app.config import *


def search_indexing_daemon(index_fn, File):
    """Index files for search engine"""
    while True:
        sleep(SEARCH_INDEXING_TIME_DELAY)
        for file in File.select():
            if not file.as_guest and not file.is_locked and file.mode_s != "hidden":
                index_fn(file)
                sleep(1)

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
        sleep(300)
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

def blob_purger(Blob, File, TmpFile, Pen):
    """Delete unused blobs"""
    to_be_delete = []
    while True:
        sleep(300)
        for blob in Blob:
            sleep(1)
            file_count = File.select().where(File.blob_hash == blob.hash).count()
            if file_count:
                if blob in to_be_delete:
                    to_be_delete.remove(blob)
                continue
            tmpfile_count = TmpFile.select().where(TmpFile.blob_hash == blob.hash)
            if tmpfile_count:
                if blob in to_be_delete:
                    to_be_delete.remove(blob)
                continue
            pen_count = Pen.select().where(
                    (Pen.head_blob_hash == blob.hash) |
                    (Pen.body_blob_hash == blob.hash) |
                    (Pen.css_blob_hash == blob.hash) |
                    (Pen.js_blob_hash == blob.hash)
                    ).count()
            if pen_count:
                if blob in to_be_delete:
                    to_be_delete.remove(blob)
                continue
            if blob in to_be_delete:
                to_be_delete.remove(blob)
                try:
                    os.remove(blob.filepath)
                except:
                    pass
                blob.delete_instance()
            else:
                to_be_delete.append(blob)

