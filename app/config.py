import json
import os

# Config Variables
# default values
SECRET_KEY="REPLACE_WITH_YOUR_SECRATE_KEY_OR_RUN_SETUP.PY"
SESSION_TOKENS_LIMIT=1024
MAX_FILE_UPLOAD_LIMIT=32
GIT_COMMAND_PATH = "git"
DOCKER_COMMAND_PATH = "docker"
MAX_FILES_ON_HOME = 128
SEARCH_INDEXING_TIME_DELAY = 5
SERVER_NAME = "localhost:5000"
SCHEME = "http"

config_vars = [
    ("SECRET_KEY", str),
    ("SESSION_TOKENS_LIMIT", int),
    ("MAX_FILE_UPLOAD_LIMIT", int),
    ("GIT_COMMAND_PATH", str),
    ("DOCKER_COMMAND_PATH", str),
    ("MAX_FILES_ON_HOME", int),
    ("SEARCH_INDEXING_TIME_DELAY", int),
    ("SERVER_NAME", str),
    ("SCHEME", str),
]

# Config loading
config = None
if os.path.exists("config.json"):
    try:
        config_file = open("config.json")
        config = json.load(config_file)
        config_file.close()
    except:
        print(">>>  Faild to load config from config.json")

if config:
    for var_and_type in config_vars:
        var, t = var_and_type
        globals()[var] = t(config.get(var, globals()[var]))

