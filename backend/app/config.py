import json
import os
from typing import Any

# Config Variables
# Default values
SECRET_KEY = "REPLACE_WITH_YOUR_SECRET_KEY_OR_RUN_SETUP.PY"
SESSION_TOKENS_LIMIT = 1024
MAX_FILE_UPLOAD_LIMIT = 32
GIT_COMMAND_PATH = "git"
DOCKER_COMMAND_PATH = "docker"
GCC_COMMAND_PATH = "gcc"
MAX_FILES_ON_HOME = 128
SEARCH_INDEXING_TIME_DELAY = 3600
SERVER_NAME = "localhost:5000"
SCHEME = "http"
PROD = False

# Auth Config
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7
COOKIE_DOMAIN = ""
COOKIE_SAMESITE = "lax"
COOKIE_SECURE = False
COOKIE_MAX_AGE_ACCESS = 1800
COOKIE_MAX_AGE_REFRESH = 604800

config_vars = [
    ("SECRET_KEY", str),
    ("SESSION_TOKENS_LIMIT", int),
    ("MAX_FILE_UPLOAD_LIMIT", int),
    ("GIT_COMMAND_PATH", str),
    ("GCC_COMMAND_PATH", str),
    ("DOCKER_COMMAND_PATH", str),
    ("MAX_FILES_ON_HOME", int),
    ("SEARCH_INDEXING_TIME_DELAY", int),
    ("SERVER_NAME", str),
    ("SCHEME", str),
    ("PROD", bool),
    ("ACCESS_TOKEN_EXPIRE_MINUTES", int),
    ("REFRESH_TOKEN_EXPIRE_DAYS", int),
    ("COOKIE_DOMAIN", str),
    ("COOKIE_SAMESITE", str),
    ("COOKIE_SECURE", bool),
    ("COOKIE_MAX_AGE_ACCESS", int),
    ("COOKIE_MAX_AGE_REFRESH", int),
]

# Config loading
config_json = {}
if os.path.exists("config.json"):
    try:
        with open("config.json") as config_file:
            config_json = json.load(config_file)
    except:
        print(">>> Failed to load config from config.json")

def get_config(var_name: str, var_type: type, default_val: Any) -> Any:
    val = os.getenv(var_name)
    if val is not None:
        if var_type == bool:
            return val.lower() in ("true", "1", "yes")
        return var_type(val)
    
    if var_name in config_json:
        return var_type(config_json[var_name])
    
    return default_val

# Apply config
for var, t in config_vars:
    globals()[var] = get_config(var, t, globals()[var])

if __name__ == "__main__":
    for var, _ in config_vars:
        print(var + " " * (32 - len(var)), ":", globals()[var])
