import os
import json
import shutil
import subprocess
from time import time, sleep
from threading import Thread
from io import TextIOWrapper
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

        # STDIN
        self.stdin:           TextIOWrapper
        self.stdin_callback:  Callable | None = None
        self.stdin_buffer:    str      = ""
        # STDOUT
        self.stdout:          TextIOWrapper
        self.stdout_callback: Callable | None = None
        self.stdout_buffer:   str      = ""
        # STDERR
        self.stderr:          TextIOWrapper
        self.stderr_callback: Callable | None = None
        self.stderr_buffer:   str      = ""

        self.start_callback: Callable | None = None
        self.end_callback:   Callable | None = None

        self.combined_buffer:          str  = ""
        self.writing_combined_buffer: bool = False

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
                "-i",                     # intractive
                "--name", self.image_tag, # tag the container
                self.image_tag
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        self.started = True
        Thread(target=self.termination_thread).start()
        Thread(target=self.stdout_handler).start()
        Thread(target=self.stderr_handler).start()

    def termination_thread(self):
        while self.poll() is None:
            if self.termination_time < time():
                self.terminate()
                self.kill()
            sleep(0.1)
        self.ended = True
        subprocess.run([DOCKER_COMMAND_PATH, "rm", "-f", self.image_tag], capture_output=True)
        subprocess.run([DOCKER_COMMAND_PATH, "rmi", "-f", self.image_tag], capture_output=True)

    def add_start_callback(self, callback: Callable):
        self.start_callback = callback

    def remove_start_callback(self):
        self.start_callback = None

    def add_stdin_callback(self, callback: Callable):
        self.stdin_callback = callback

    def remove_stdin_callback(self):
        self.stdin_callback = None

    def add_stdout_callback(self, callback: Callable):
        self.stdout_callback = callback

    def remove_stdout_callback(self):
        self.stdout_callback = None

    def add_stderr_callback(self, callback: Callable):
        self.stderr_callback = callback

    def remove_stderr_callback(self):
        self.stderr_callback = None

    def add_end_callback(self, callback: Callable):
        self.end_callback = callback

    def remove_end_callback(self):
        self.end_callback = None

    def clear_stdin_buffer(self):
        self.stdin_buffer = ""

    def clear_stdout_buffer(self):
        self.stdout_buffer = ""

    def clear_stderr_buffer(self):
        self.stderr_buffer = ""

    def clear_combined_buffer(self):
        self.combined_buffer = ""

    def send_input(self, input: str):
        if self.stdin_callback:
            self.stdin_callback(input)
        self.stdin_buffer += input
        self.stdin.write(input)
        try:
            self.stdin.flush()
        except:
            pass
        self.append_to_combined_buffer(input)

    def stdout_handler(self):
        while not self.ended:
            sleep(0.1)
            capture = self.stdout.read(1)
            if not capture:
                continue

            self.stdout_buffer += capture
            if self.stdout_callback:
                self.stdout_callback(capture)
            self.append_to_combined_buffer(capture)

        leftover = self.stdout.read()
        self.stdout_buffer += leftover
        if self.stdout_callback:
            self.stdout_callback(leftover)
        self.append_to_combined_buffer(leftover)

    def stderr_handler(self):
        while not self.ended:
            sleep(0.1)
            capture = self.stderr.read(1)
            if not capture:
                continue

            self.stderr_buffer += capture
            if self.stderr_callback:
                self.stderr_callback(capture)
            self.append_to_combined_buffer(capture)

        leftover = self.stderr.read()
        self.stderr_buffer += leftover
        if self.stderr_callback:
            self.stderr_callback(leftover)
        self.append_to_combined_buffer(leftover)

    def append_to_combined_buffer(self, text: str):
        while self.writing_combined_buffer:
            sleep(0.1)
        self.writing_combined_buffer = True
        self.combined_buffer += text
        self.writing_combined_buffer = False

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
