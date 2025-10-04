from time import sleep

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
