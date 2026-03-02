from pydantic import BaseModel


class BlobInfo(BaseModel):
    hash: str
    size: int

