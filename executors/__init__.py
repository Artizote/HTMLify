# Excutors

import os.path
import subprocess
from time import time, sleep
from hashlib import sha256
from threading import Thread

from utils import *
from config import *

MODULE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCKERFILES_DIR = os.path.join(MODULE_DIR, 'Dockerfiles')

executors = {
    "cat": {
        "name": "cat",
        "lang": "Plaintext",
        "filename": "file",
        "extentions": [
            "*",
            ".txt",
        ]
    },
    "java": {
        "name": "java",
        "lang": "Java",
        "filename": "Main.java",
        "extentions": [
            ".java",
        ]
    },
    "python": {
        "name": "python",
        "lang": "Python",
        "filename": "main.py",
        "extentions": [
            ".py",
        ]
    },
    "node.js": {
        "name": "node.js",
        "lang": "Node",
        "filename": "app.js",
        "extentions": [
            ".js",
        ]
    },
}



class CodeExecution(subprocess.Popen):
    def __init__(self, image_tag, timeout=60):
        self.start_time = time()
        self.termination_time = self.start_time + timeout
        self.image_tag = image_tag
        self.stdout_buffer = ""
        self.stop_stdout_capture = False
        self.stderr_buffer = ""
        self.stop_stderr_capture = False
        super().__init__(
            [DOCKER_COMMAND_PATH, "run", "--rm", "-i", "--name", image_tag, image_tag],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        self.start_threads()

    def __repr__(self):
        return f"<CodeExcution  tag:{self.image_tag} pid:{self.pid}>"

    def start_threads(self):
        Thread(target=self.termination_thread).start()
        Thread(target=self.stdout_capture_thread).start()
        Thread(target=self.stderr_capture_thread).start()

    def termination_thread(self):
        while self.poll() is None:
            if self.termination_time < time():
                self.terminate()
                self.kill()
            sleep(0.1)
        subprocess.run([DOCKER_COMMAND_PATH, "rm", "-f", self.image_tag])
        subprocess.run([DOCKER_COMMAND_PATH, "rmi", "-f", self.image_tag])

    def stdout_capture_thread(self):
        while self.poll() is None:
            if self.stop_stdout_capture:
                sleep(0.1)
                continue
            capture = self.stdout.read(1)
            self.stdout_buffer += capture
            sleep(0.01)
        leftover = self.stdout.read()
        self.stdout_buffer += leftover

    def stderr_capture_thread(self):
        while self.poll() is None:
            if self.stop_stderr_capture:
                sleep(0.1)
                continue
            capture = self.stderr.read(1)
            self.stderr_buffer += capture
            sleep(0.01)
        leftover = self.stderr.read()
        self.stderr_buffer += leftover

    def communicate(self, input: str|None = None, delay: float|None = None) -> tuple[str, str]:
        """
        Interact with the process in real-time.
        - Sends `input` to the process's stdin if provided.
        - Waits for `delay` seconds if provided.
        - Returns captured stdout and stderr as a tuple.
        """
        if input:
            self.stdin.write(input)
            try:
                self.stdin.flush()
            except (BrokenPipeError, IOError) as e:
                print(e) # no raise

        if delay:
            sleep(delay)

        self.stop_stdout_capture = True
        self.stop_stderr_capture = True

        stdout_capture = self.stdout_buffer
        stderr_capture = self.stderr_buffer

        self.stdout_buffer = ""
        self.stderr_buffer = ""

        self.stop_stdout_capture = False
        self.stop_stderr_capture = False

        return (stdout_capture, stderr_capture)

def get_executer(name: str) -> dict | None:
    if name in executors:
        return executors[name]

def suggest_executors(filename: str) -> list[dict]:
    suggestions = []
    ext = "." + filename.split(".")[-1]
    if "." not in filename:
        ext = ""

    for executor in executors.values():
        if ext in executor["extentions"]:
            suggestions.insert(0, executor)
        elif "*" in executor["extentions"]:
            suggestions.append(executor)

    return suggestions

def execute(code: str|bytes, executer: str, timeout: int = 60) -> CodeExecution:
    """Return a CodeExecution (subprocess.Popen like) object"""

    executer = get_executer(executer)
    if not executer:
        return None
    if isinstance(code, str):
        code = code.encode()

    tag = randstr(16)
    temp_directory = os.path.join(MODULE_DIR, tag)
    r = subprocess.run(["/usr/bin/mkdir", temp_directory])
    if r.returncode:
        return None

    subprocess.run(["/usr/bin/cp", f"{DOCKERFILES_DIR}/{executer['name']}", f"{temp_directory}/Dockerfile"])

    with open(f"{temp_directory}/{executer['filename']}", "wb") as f:
        f.write(code)

    if subprocess.run([
        DOCKER_COMMAND_PATH, "build", "-t", tag, f"{temp_directory}"
    ]).returncode:
        return None

    proc = CodeExecution(tag, timeout)

    rmtree(temp_directory)

    return proc

