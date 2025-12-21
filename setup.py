import os
import subprocess
import json
import shutil
import importlib.util
import urllib.request
import sys
from random import randint
from time import sleep
from zipfile import ZipFile
from textwrap import TextWrapper


textwrapper = TextWrapper()
segment_delay = 2
per_line_delay = 0.05


if "--nosegdalay" in sys.argv:
    segment_delay = 0

if "--nolinedelay" in sys.argv:
    per_line_delay = 0

if "--nodelay" in sys.argv:
    segment_delay = 0
    per_line_delay = 0


def segment():
    print()
    print("-" * 80)
    print()
    sleep(segment_delay)

def center_line(line):
    l = len(line)
    if l > 80:
        return line
    lpadding = "-" * (39 - (l//2))
    rpadding = "-" * (39 - (l//2)-l%2)
    return lpadding + line + rpadding

def indent_line(line, indent=1):
    return ("    " * indent) + line

def border_line(line):
    while (len(line)) < 78:
        line += " "
    return "|" + line + "|"

def switch_color(color=""):
    colors = {
        "error": "\033[91m",
        "warning": "\033[93m",
        "success": "\033[92m",
        "info": "\033[96m",
        "reset": "\033[0m"
    }
    code = colors.get(color, colors["reset"])
    print(code, end="", flush=True)

def setup_print(text, color="", center=False, indent=1):
    wrapped = textwrapper.wrap(text)
    switch_color(color)
    for line in wrapped:
        if center:
            line = center_line(line)
        line = indent_line(line, indent)
        line = border_line(line)
        sleep(per_line_delay)
        print(line)
    switch_color("reset")


# setup

setup_print("SETUP", "", True, 0)
segment()


# CONFIG FILE

setup_print("CONFIG FILE", "info", True, 0)

if os.path.exists("config.json"):
    setup_print("config.json found", "success")
    config_file = open("config.json", "r")
    try:
        config_dict = json.load(config_file)
    except:
        setup_print("config.json is malformed, deleting.", "error", indent=2)
        config_file.close()
        os.remove("config.json")

if not os.path.exists("config.json"):
    setup_print("config.json not found")
    config_file = open("config.json", "w")
    session_key = str(randint(0, 10**10-1)).zfill(10)
    config_dict = {
        "SECRET_KEY": session_key,
        "SERVER_NAME": "localhost:5000",
    }
    config_str = json.dumps(config_dict, indent=4)
    config_file.write(config_str)
    config_file.close()
    setup_print("config.json generated", "success", indent=2)

setup_print("DONE", "success", True, 0)
segment()


# COMMANDS AND UTILITIES

setup_print("COMMANDS/UTILITES", "info", True, 0)

def check_command(command):
    try:
        subprocess.run(
            [command, "--version"],
            stdout = subprocess.PIPE,
            stderr = subprocess.PIPE,
            check = True,
        )
        return True
    except:
        return False

has_pip     = check_command("pip")
has_pip3    = check_command("pip3")
has_python  = check_command("python")
has_python3 = check_command("python3")
has_git     = check_command("git") or check_command(config_dict.get("GIT_COMMAND_PATH", "git"))
has_docker  = check_command("docker") or check_command(config_dict.get("DOCKER_COMMEND_PATH", "docker"))
has_gcc     = check_command("gcc") or check_command(config_dict.get("GCC_COMMAND_PATH", "gcc"))

pip_command = python_command = ""

if has_pip:
    pip_command = "pip"
if has_pip3:
    pip_command = "pip3"
if has_python:
    python_command = "python"
if has_python3:
    python_command = "python3"

pip_command = "pip" if has_pip else "pip3"
python_com3mand = "python" if has_python else "python3"

if not has_pip and not has_pip3:
    setup_print("Faild to find the pip command", "error")
    setup_print("pip is required for packages installation", "error")
    setup_print("exiting...", "error")
    exit(1)
else:
    setup_print("has pip", "success")

if not has_python and not has_python3:
    setup_print("Faild to find python command", "error")
    setup_print("How did this script ran?", "error")
    setup_print("exiting...", "error")
    exit(1)
else:
    setup_print("has python", "success")

if has_git:
    setup_print("has get", "success")
else:
    setup_print("Failed to find git", "warning")

if has_docker:
    setup_print("has docker", "success")
else:
    setup_print("Failed to find docker", "warning")

setup_print("DONE", "success", True, 0)
segment()


# REQUIREMENTS

setup_print("REQUIREMENTS", "info", True, 0)

try:
    requirements = open("requirements.txt").read().split()
except:
    setup_print("unable to read requirements", "error")
    setup_print("exiting...", "error")
    exit(1)

for requirement in requirements:
    spec = importlib.util.find_spec(requirement)
    if spec:
        setup_print("Requirement satisfied: " + requirement, "success")
        continue

    setup_print("Instaling " + requirement)
    output = subprocess.run(
        [pip_command, "install", requirement],
        capture_output=True,
        text=True,
    )

    if output.returncode:
        setup_print("some error happen while instaling requirements", "error")
        setup_print("")
        setup_print(output.stderr, "error")
        exit(1)

    setup_print("Installed " + requirement, "success")

setup_print("DONE", "success", True, 0)
segment()


# DIRECTORIES

setup_print("DIRECTORIES", "info", True, 0)

for r_dir in [
        ["app", "static", "vendor"],
        ["files"],
        ["files", "blob"],
        ["files", "dp"],
        ["files", "tmp"],
        ["files", "qr"],
        ["instance"],
    ]:
    d = os.path.join(*r_dir)
    if not os.path.exists(d):
        setup_print("Directory not found: " + d)
        os.mkdir(d)
        setup_print("Directory created: " + d, "success")
    else:
        setup_print("Directory exists: " + d, "success")

setup_print("DONE", "success", True, 0)
segment()


# VENDORS

setup_print("VENDORS", "info", True, 0)

tmp_dir = os.path.join("files", "tmp")
codemirror_dir = os.path.join("app", "static", "vendor", "codemirror")

if os.path.exists(codemirror_dir):
    setup_print("Vendor exists: codemirror", "success")
else:
    setup_print("Setting up codemirror")
    setup_print("Downloading codemirror", indent=2)
    try:
        codemirror_zip_path, _ = urllib.request.urlretrieve("https://codemirror.net/5/codemirror.zip")
    except Exception as e:
        setup_print("Error while downoalding", "error", indent=3)
        setup_print(str(e), "error")
        setup_print("exiting...", "error")
        exit(1)

    setup_print("Downloaded codemirror", indent=2)
    setup_print("Extracting codemirror", indent=2)
    try:
        codemirror_tmp_dir = os.path.join(tmp_dir, "codemirror")
        try:
            shutil.rmtree(codemirror_tmp_dir)
        except:
            pass
        codemirror_zip = ZipFile(codemirror_zip_path, "r")
        codemirror_zip.extractall(codemirror_tmp_dir)
        main_dir = os.listdir(codemirror_tmp_dir)[0]
        shutil.move(os.path.join(codemirror_tmp_dir, main_dir), codemirror_dir)
        shutil.rmtree(codemirror_tmp_dir)
    except Exception as e:
        setup_print("Error while extracting", "error", indent=3)
        setup_print(str(e), "error")
        setup_print("exiting...", "error")
        exit(1)
    setup_print("Extracted codemirror", indent=2)

    setup_print("Setuped vendor: codemirror", "success")

setup_print("DONE", "success", True, 0)
segment()


# END

setup_print("The environment is ready for development", "success")
setup_print("Press enter to exit, r for run the app")

i = input("     [<enter>/r]: ").lower()

if i == "r":
    subprocess.run(
        [python_command, "run.py"],
    )

setup_print("DONE", "success", True, 0)
