from app.services.executor import *
from .api import *


@public_api.get("/exec")
def get_exec():
    id = request.args.get("id")
    if not id:
        return error_respones_dict(APIErrors.NOT_FOUND)
    for ce in CodeExecution.EXECUTIONS:
        if ce.id == id:
            return {
                "success": True,
                "code_execution": ce.to_dict()
            }
    return error_respones_dict(APIErrors.NOT_FOUND)

@public_api.post("/exec")
def start_exec():
    json = g.json

    code          = json.get("code")
    executor_name = json.get("executor")

    if code is None or executor_name is None:
        return error_respones_dict(APIErrors.MISSING_PARAMETERS)

    executor = Executor(executor_name)
    if not executor.valid:
        return error_respones_dict(APIErrors.INVALID_DATA)

    ce = executor(code)
    if not ce:
        return error_respones_dict(APIErrors.INTERNAL_ERROR)

    return {
        "success": True,
        "code_execution": ce.to_dict(show_auth_code=True)
    }

