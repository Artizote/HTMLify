from functools import wraps
from time import time


class TimedCache:
    """Timed Cache"""

    def __init__(self, ttl: int = 60):
        self._ttl = ttl
        self._cache = {} # {key: (expiry, value)}

    def get(self, key):
        expiry, value = self._cache.get(key, (None, None))
        if not expiry:
            return None
        if time() > expiry:
            self.clear(key)
            return None
        return value

    def set(self, key, value, ttl: int | None = None):
        self._cache[key] = (int(time() + (ttl or self._ttl)), value)

    def clear(self, key):
        if key not in self._cache: return
        del self._cache[key]

    def cache_fetch(self, key, fetcher, ttl: int | None = None):
        value = self.get(key)
        if value is not None:
            return value
        value = fetcher()
        self.set(key, value, ttl)
        return value

    def cache_fetcher(self, fetcher, ttl: int | None = None):
        @wraps(fetcher)
        def cached_fetcher():
            return self.cache_fetch(hash(fetcher), fetcher, ttl)
        return cached_fetcher

