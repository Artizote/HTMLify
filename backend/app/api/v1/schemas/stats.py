from enum import StrEnum, auto



class StatsResourceEnum(StrEnum):
    USER      = auto()
    BLOB      = auto()
    FILE      = auto()
    PEN       = auto()
    SHORTLINK = auto()
    TMPFILE   = auto()
    TMPFOLDER = auto()


