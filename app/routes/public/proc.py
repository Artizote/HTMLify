from flask import request, jsonify

from app.models import User
from .public import public


# TODO: Improve the Process management
PROCESS_POOL = []
@public.get("/proc/<int:pid>")
def _proc_info(pid):
    global PROCESS_POOL
    for p in PROCESS_POOL:
        if p["pid"] == pid:
            ce = p["proc"]
            return jsonify({
                "pid": ce.pid,
                "termination-time": ce.termination_time,
                "running": ce.poll() is None,
            })
    return jsonify({}), 404


@public.post("/proc/<int:pid>/communicate")
def _proc_communicate(pid):
    ce = None
    for p in PROCESS_POOL:
        if p["pid"] == pid:
            process = p
            ce = p["proc"]
    if not ce:
        return jsonify({
            "error": True,
            "message": "process not found",
        }), 404
    if "api-key" in process:
        user = User.by_username(username=request.form.get("username", ""))
        if not user or not user.api_key == process["api-key"]:
            return jsonify({
                "error": True,
                "message": "you are not authenticated for this process"
            }), 403

    input = request.form.get("input")

    out, err = ce.communicate(input, 1)

    return jsonify({
        "stdout": out,
        "stderr": err,
        "running": ce.poll() is None,
        "pid": ce.pid,
        "termination-time": ce.termination_time,
    })

