from peewee import ModelBase, ModelSelect

from abc import ABC, ABCMeta, abstractmethod
from typing import Self, Iterable


class PeeweeABCMeta(ModelBase, ABCMeta):
    """ MetaClass for PeeWee Model and ABC"""
    pass


class BlobDependent(ABC):
    """ Base Class for Blob Dependent resources """

    @classmethod
    @abstractmethod
    def get_blob_dependents(cls, blob) -> ModelSelect | Iterable[Self]:
        """ Return iterable of all instance that depends on giving blob/hash """
        raise NotImplementedError

    @property
    @abstractmethod
    def blob_dependencies(self) -> list[str]:
        """ Return Blob hashes this resource depends on """
        raise NotImplementedError

