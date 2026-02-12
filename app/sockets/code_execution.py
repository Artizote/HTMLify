from flask_socketio import join_room, Namespace

from typing import Callable, Tuple

from app.services.executor import CodeExecution
from .socketio import socketio


class CodeExecutionNamespace(Namespace):
    """ Code Execution Namespace """

    def emit(self, *args, **kwargs):
        kwargs["namespace"] = "/code-execution"
        socketio.emit(*args, **kwargs)

    def get_ce(self, data: dict) -> CodeExecution | None:
        ce_id = data.get("id")
        if not ce_id:
            return
        ce = CodeExecution.by_id(ce_id)
        return ce

    def get_and_auth_ce(self, data: dict) -> Tuple[CodeExecution | None, bool]:
        ce = self.get_ce(data)
        if not ce:
            return None, False
        auth_code = data.get("auth_code", "")
        authrized = ce.auth_code == auth_code
        return ce, authrized

    def ce_room_name(self, ce) -> str:
        return f"code-execution-{ce.id}"

    def ce_start_callback(self, ce) -> Callable:
        def start_callback():
            self.emit("started", to=self.ce_room_name(ce))
        return start_callback

    def ce_end_callback(self, ce) -> Callable:
        def end_callback():
            self.emit("ended", to=self.ce_room_name(ce))
        return end_callback

    def ce_stream_callback(self, ce) -> Callable:
        def stream_callback(b: bytes):
            self.emit("stream", b, to=self.ce_room_name(ce))
        return stream_callback

    def on_connect(self):
        pass

    def on_disconnect(self):
        pass

    def on_join(self, data: dict):
        ce = self.get_ce(data)
        if not ce:
            return
        join_room(self.ce_room_name(ce))

    def on_start(self, data: dict):
        ce, auth = self.get_and_auth_ce(data)
        if not ce or not auth:
            return
        ce.add_start_callback(self.ce_start_callback(ce))
        ce.add_end_callback(self.ce_end_callback(ce))
        ce.add_stream_callback(self.ce_stream_callback(ce))
        ce.start()

    def on_input(self, data: dict):
        ce, auth = self.get_and_auth_ce(data)
        if not ce or not auth:
            return
        input = data.get("input", "")
        ce.send_input(input)

    def on_resize(self, data: dict):
        ce, auth = self.get_and_auth_ce(data)
        if not ce or not auth:
            return
        try:
            rows = int(data.get("rows", 24))
            cols = int(data.get("cols", 80))
            ce.set_pty_size(rows, cols);
        except:
            pass

    def on_stop(self, data: dict):
        ce, auth = self.get_and_auth_ce(data)
        if not ce or not auth:
            return
        ce.terminate()
        ce.kill()


socketio.on_namespace(CodeExecutionNamespace("/code-execution"))
