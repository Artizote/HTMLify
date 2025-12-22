from app.executors import execute
from .api import *


# TODO: Make process pool part of executor module
PROCESS_POOL = []
@public_api.post("/exec")
def start_exec_():
    json = g.json

    code        = json.get("code")
    executor    = json.get("code")
    user        = g.auth_user
    api_key     = user.api_key if user else None

    if not (code or executor):
        return error_respones_dict(APIErrors.MISSING_PARAMETERS)

    ce = execute(code, executor)
    if not ce:
        return error_respones_dict(APIErrors.INVALID_PARAMETERS)

    proc = {
        "proc": ce,
        "pid": ce.pid,
    }

    if api_key:
        proc["api-key"] = api_key

    global PROCESS_POOL
    PROCESS_POOL.append(proc)

    return {
        "success": True,
        "message": "process started",
        "status-code": 0,
        "pid": ce.pid
    }

