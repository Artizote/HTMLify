from typing import Optional

from app.models import Blob


class BlobService:

    @staticmethod
    def get_blob(hash: str) -> Optional[Blob]:
        blob = Blob[hash]
        return blob

