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

config_vars = [
    ("SECRET_KEY", str),
    ("SESSION_TOKENS_LIMIT", int),
    ("MAX_FILE_UPLOAD_LIMIT", int),
    ("GIT_COMMAND_PATH", str),
    ("DOCKER_COMMAND_PATH", str),
    ("MAX_FILES_ON_HOME", int),
    ("SEARCH_INDEXING_TIME_DELAY", int),
]

# Config loading
config = None
if os.path.exists("dev-config.json"):
    try:
        config_file = open("dev-config.json")
        config = json.load(config_file)
        config_file.close()
    except:
        print(">>>  Faild to load config from dev-config.json")

if os.path.exists("prod-config.json"):
    try:
        config_file = open("prod-config.json")
        config = json.load(config_file)
        config_file.close()
    except:
        print(">>>  Falid to load config from prod-config.json")

if config:
    for var_and_type in config_vars:
        var, t = var_and_type
        globals()[var] = t(config.get(var, globals()[var]))

