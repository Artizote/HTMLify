import os
import pty
import json
import fcntl
import shutil
import struct
import termios
import subprocess
from time import time, sleep
from threading import Thread, Lock
from typing import Callable, Optional

from app.utils import randstr, file_path
from app.config import *

## Executor Meta Scheema
# "name": {
#     "name": str
#     "title": str,
#     "lang": str,
#     "extensions": list[str]
# }
executors: dict = json.load(open(os.path.join("app", "services", "executor", "executors.json")))


class CodeExecution(subprocess.Popen):
    """ Code Execution """

    EXECUTIONS = []

    def __init__(self, image_tag: str, timeout: int | float = 300):
        self.id = image_tag
        self.image_tag = image_tag
        self.timeout   = timeout

        self.auth_code = randstr(8)

        self._started: bool = False
        self._ended:   bool = False

        self.creation_time:    int  | float = time()
        self.start_time:       int  | float = 0
        self.end_time:         int  | float = 0
        self.termination_time: int  | float = 0

        self.start_callback:  Callable | None = None
        self.stream_callback: Callable | None = None
        self.end_callback:    Callable | None = None

        self.combined_buffer:          str  = ""
        self.writing_combined_buffer: bool = False

        self.master_fd, self.slave_fd = pty.openpty()
        self.stream_buffer: bytes = bytes()

        self.stream_buffer_lock = Lock()

        os.set_blocking(self.master_fd, True)
        os.set_blocking(self.slave_fd, True)

        self.set_pty_size(24, 80)

        CodeExecution.EXECUTIONS.append(self)


    def __repr__(self):
        if hasattr(self, "pid"):
            return f"<CodeExcution  tag:{self.image_tag} pid:{self.pid}>"
        else:
            return f"<CodeExcution  tag:{self.image_tag}>"

    @classmethod
    def by_id(cls, id: str) -> Optional["CodeExecution"]:
        for ce in cls.EXECUTIONS:
            if ce.id == id:
                return ce

    @classmethod
    def purge(cls):
        while True:
            if not len(CodeExecution.EXECUTIONS):
                break
            execution = CodeExecution.EXECUTIONS[0]
            if execution.creation_time + 3600 < time():
                if not execution.ended:
                    execution.terminate()
                    execution.kill()
                CodeExecution.EXECUTIONS.remove(execution)
                continue
            break

    def start(self):
        if self.started:
            return

        self.start_time = time()
        self.termination_time = self.start_time + self.timeout
        super().__init__(
            [
                DOCKER_COMMAND_PATH,
                "run",
                "--rm",                   # remove container when stoped
                "--cpus", "0.1",          # limit the CPU usage
                "-m", "512m",             # limit the memory usage
                '-q',                     # queite
                "-it",                    # intractive
                "--name", self.image_tag, # tag the container
                self.image_tag
            ],
            stdin=self.slave_fd,
            stdout=self.slave_fd,
            stderr=self.slave_fd,
            text=True
        )
        self.started = True
        Thread(target=self.termination_thread).start()
        Thread(target=self.stream_reader_thread).start()
        Thread(target=self.stream_handler).start()

    def end(self):
        self.terminate()
        self.kill()
        self.ended = True

    def termination_thread(self):
        while self.poll() is None:
            if self.termination_time < time():
                self.end()
            sleep(0.1)
        self.ended = True
        subprocess.run([DOCKER_COMMAND_PATH, "rm", "-f", self.image_tag], capture_output=True)
        subprocess.run([DOCKER_COMMAND_PATH, "rmi", "-f", self.image_tag], capture_output=True)

    def add_start_callback(self, callback: Callable):
        self.start_callback = callback

    def remove_start_callback(self):
        self.start_callback = None

    def add_stream_callback(self, callback: Callable):
        self.stream_callback = callback

    def remove_stream_callback(self):
        self.stream_callback = None

    def add_end_callback(self, callback: Callable):
        self.end_callback = callback

    def remove_end_callback(self):
        self.end_callback = None

    def clear_stream_buffer(self):
        self.stream_buffer = b""

    def set_pty_size(self, rows: int, cols: int):
        winsize = struct.pack("HHHH", rows, cols, 0, 0)
        fcntl.ioctl(self.slave_fd, termios.TIOCSWINSZ, winsize)

    def send_input(self, input: bytes | str):
        if isinstance(input, str):
            input = input.encode()
        os.write(self.master_fd, input)

    def stream_reader_thread(self):
        while not self.ended:
            sleep(0.01)
            capture = os.read(self.master_fd, 1024)
            if not capture:
                break
            with self.stream_buffer_lock:
                self.stream_buffer += capture

        while True:
            capture = os.read(self.master_fd, 1024)
            if not capture:
                break
            with self.stream_buffer_lock:
                self.stream_buffer += capture

    def stream_handler(self):
        attemp_reading = 5
        while attemp_reading:
            sleep(0.01)
            with self.stream_buffer_lock:
                if self.stream_buffer:
                    if self.stream_callback:
                        self.stream_callback(self.stream_buffer)
                    self.clear_stream_buffer()
            if self.ended:
                attemp_reading -= 1
                sleep(0.5)

    def to_dict(self, show_auth_code=False) -> dict:
        auth_code = None
        if show_auth_code:
            auth_code = self.auth_code
        pid = None
        if hasattr(self, "pid"):
            pid = self.pid

        return {
            "id": self.id,
            "pid": pid,
            "image_tag": self.image_tag,
            "auth_code": auth_code
        }

    @property
    def is_running(self):
        return self.started and not self.ended

    @property
    def started(self):
        return self._started

    @started.setter
    def started(self, value: bool):
        self._started = value
        if self._started and self.start_callback:
                self.start_callback()

    @property
    def ended(self):
        return self._ended

    @ended.setter
    def ended(self, value: bool):
        self._ended = value
        if self._ended and self.end_callback:
            self.end_callback()



class Executor:
    """ Executor """

    EXECUTORS = {}

    def __new__(cls, name: str):
        name = name.lower().strip()
        if name in cls.EXECUTORS:
            return cls.EXECUTORS[name]
        instance = super().__new__(cls)
        return instance

    def __init__(self, name: str):
        if not hasattr(self, "catched"):
            self.name = name.lower().strip()
            self.title = name
            self.dockerfile_path = os.path.join("app", "services", "executor", "dockerfiles", self.name + ".dockerfile")
            self.has_dockerfile = None
            if self.dockerfile_exists():
                meta = executors.get(name)
                if meta:
                    self.title = meta["title"]
                Executor.EXECUTORS[name] = self
                self.catched = True

    def __call__(self, code: str | bytes, timeout: int | float = 300) -> CodeExecution | None:
        return self.execute(code, timeout)

    def __repr__(self):
        return f"<Executor {self.name}>"

    @classmethod
    def suggest_executors(cls, filename: str) -> list["Executor"]:
        suggestions = []

        for name, meta in executors.items():
            for ext in meta.get("extensions", []):
                if filename.endswith(ext):
                    executor = cls(name)
                    if executor not in suggestions:
                        suggestions.append(executor)
                if latest_name := meta.get("latest"):
                    executor = cls(latest_name)
                    if executor not in suggestions:
                        suggestions.insert(0, executor)

        # adding with wildcard extensions
        for name, meta in executors.items():
            if "*" in meta.get("extensions", []):
                executor = cls(name)
                if executor not in suggestions:
                    suggestions.append(executor)

        return suggestions

    def dockerfile_exists(self) -> bool:
        if self.has_dockerfile is None:
            has = os.path.exists(self.dockerfile_path)
            self.has_dockerfile = has
        return self.has_dockerfile

    def execute(self, code: str | bytes, timeout: int | float = 300) -> CodeExecution | None:
        """ Return a CodeExecution (subprocess.Popen like) object """

        if not self.has_dockerfile:
            return None

        if isinstance(code, str):
            code = code.encode()

        tag = randstr(16)
        temp_directory = file_path("tmp", tag)
        os.mkdir(temp_directory)

        shutil.copyfile(self.dockerfile_path, os.path.join(temp_directory, "Dockerfile"))

        with open(os.path.join(temp_directory, "file"), "wb") as f:
            f.write(code)

        if subprocess.run([
            DOCKER_COMMAND_PATH, "build", "-q", "-t", tag, f"{temp_directory}"
        ], capture_output=True).returncode:
            return None

        proc = CodeExecution(tag, timeout)

        shutil.rmtree(temp_directory)

        return proc

    @property
    def valid(self):
        return self.dockerfile_exists()
