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

def blob_purger(Blob, dependents: list):
    """Delete unused blobs"""
    delete_queue = []
    while True:
        sleep(300)
        for blob in Blob:
            sleep(1)
            queue_to_delete = True

            for dependent in dependents:
                instances = dependent.get_blob_dependents(blob)
                if instances.count():
                    queue_to_delete = False
                    if blob in delete_queue:
                        delete_queue.remove(blob)
                    break

            if not queue_to_delete:
                if blob in delete_queue:
                    delete_queue.remove(blob)
                continue
            
            if queue_to_delete:
                if blob not in delete_queue:
                    delete_queue.append(blob)
                else:
                    delete_queue.remove(blob)
                    filepath = blob.filepath
                    blob.delete_instance()
                    try:
                        os.remove(filepath)
                    except:
                        pass

