from time import sleep

def process_pool_purger(process_pool):
    """Removes completed process frim `process_pool`"""
    while True:
        sleep(60)
        for p in process_pool:
            if p["proc"].poll() is not None:
                process_pool.remove(p)
