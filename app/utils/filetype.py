
# Constants 

IMAGE_FILE_EXTENTIONS = [
    "png", "jpg", "jpeg", "gif", "tif",
    "tiff", "bmp", "eps", "raw", "cr2",
    "nef", "orf", "sr2", "webp"
]
AUDIO_FILE_EXTENTIONS = [
    "3gp", "amr", "m4a", "m4b", "m4p", "mp3",
    "off", "oga", "ogg", "wav"
]
DOCUMENT_FILE_EXTENTIONS = [
    "pdf", "docx", "pptx"
]

VIDEO_FILE_EXTENTIONS = [
    "mp4", "m4v", "mpg", "mp2", "mpeg",
    "mpe", "mpv", "mpg", "mpeg", "m2v",
    "amv", "asf", "viv", "mkv", "webm"
]

TEXT_FILE_EXTENTIONS = [
    'abap', 'adb', 'adoc', 'asm', "b", 'bat', "befunge", 'bf', "c",
    'cbl', 'cljs', 'cmd', 'cobra', 'coffee', 'cpp',
    'cpy', 'cs', 'css', 'dart', 'dmd',
    'dockerfile', 'drt', 'elm', 'exs', 'f90',
    'fs', 'gem', 'gemspec', 'go', 'gql',
    'graphqls', 'groovy', 'gsp', 'h', 'hrl',
    'hs', 'html', 'ijl', 'init', 'ipynb',
    'java', 'jl', 'js', 'json', 'jsonld',
    'jsonschema', 'kt', 'kts', 'lisp', 'lua',
    'm', 'md', 'mlx', 'mm', 'mof',
    'php', 'phtml', 'pks', 'pl', 'pp',
    'proto', 'ps1', 'ps1xml', 'psd1', 'psm1',
    'purs', 'py', 'r', 'rb', 're',
    'resource', 'robot', 'rs', 'scala', 'sh',
    'shrc', 'sjs', 'sql', 'ss', 'suite',
    'sv', "svg", 'swift', 'tb', 'tex', 'tk',
    'ts', "txt", 'var', 'vbs', 'vhd', 'vpack',
    'vpkg', 'wasm', 'wat', 'ws', 'xml', 'xsd',
    'yaml', 'yml',
]

def filetype(ext):
    ext = ext.strip().lower()
    if ext in IMAGE_FILE_EXTENTIONS   : return "image"
    if ext in AUDIO_FILE_EXTENTIONS   : return "audio"
    if ext in VIDEO_FILE_EXTENTIONS   : return "video"
    if ext in TEXT_FILE_EXTENTIONS    : return "text"
    if ext in DOCUMENT_FILE_EXTENTIONS: return "document"
    return "unknown"

def get_extentions(type):
    type = type.lower()
    extentions = []
    if type == "text":
        extentions = TEXT_FILE_EXTENTIONS
    if type == "iamge":
        extentions = IMAGE_FILE_EXTENTIONS
    if type == "audio":
        extentions = AUDIO_FILE_EXTENTIONS
    if type == "video":
        extentions = VIDEO_FILE_EXTENTIONS
    if type == "document":
        extentions = DOCUMENT_FILE_EXTENTIONS
    for ext in extentions:
        yield ext
