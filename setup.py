import os
import subprocess
import json
import shutil
import importlib.util
import urllib.request
from random import randint
from time import sleep
from zipfile import ZipFile
from textwrap import TextWrapper


textwrapper = TextWrapper()


def segment():
    print()
    print("-" * 80)
    print()
    sleep(2)

def center_line(line):
    l = len(line)
    if l > 80:
        return line
    padding = "-" * (40 - (l//2))
    return padding + line + padding

def indent_line(line, indent=1):
    return ("    " * indent) + line

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

def setup_print(text, color="", center=False, indent=0):
    wrapped = textwrapper.wrap(text)
    switch_color(color)
    for line in wrapped:
        if center:
            line = center_line(line)
        line = indent_line(line, indent)
        print(line)
    switch_color("reset")


# setup

setup_print("SETUP", "", True)
segment()


# config checking

setup_print("CONFIG FILE", "info", True)

if os.path.exists("config.json"):
    config_file = open("config.json", "r")
    try:
        config_dict = json.load(config_file)
    except:
        setup_print("config.json found but invalid, deleting.", "error")
        config_file.close()
        os.remove("config.json")

if not os.path.exists("config.json"):
    print("config not found")
    config_file = open("config.json", "w")
    session_key = str(randint(100000, 999999))
    config_dict = {
        "SECRET_KEY": session_key,
        "SERVER_NAME": "localhost:5000",
    }
    config_str = json.dumps(config_dict, indent=4)
    config_file.write(config_str)
    config_file.close()
    setup_print("config.json generated", "success", indent=1)

setup_print("DONE", "success", center=True)
segment()


# COMMANDS AND UTILITIES

setup_print("COMMANDS/UTILITES", "info", True)

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
    setup_print("has pip", "success", indent=1)

if not has_python and not has_python3:
    print("Warning: Failed to find python")
    setup_print("Faild to find python command", "error")
    setup_print("How did this script ran?", "error")
    setup_print("exiting...", "error")
    exit(1)
else:
    setup_print("has python", "success", indent=1)

if has_git:
    setup_print("has get", "success", indent=1)
else:
    setup_print("Failed to find git", "warning")

if has_docker:
    setup_print("has docker", "success", indent=1)
else:
    setup_print("Failed to find docker", "warning")

setup_print("DONE", "success", center=True)
segment()


# REQUIREMENTS

setup_print("REQUIREMENTS", "info", True)

try:
    requirements = open("requirements.txt").read().split()
except:
    setup_print("unable to read requirements", "error")
    setup_print("exiting...", "error")
    exit(1)

for requirement in requirements:
    spec = importlib.util.find_spec(requirement)
    if spec:
        setup_print("Requirement satisfied: " + requirement, "success", indent=1)
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

    setup_print("Installed " + requirement, "success", indent=1)

setup_print("DONE", "success", center=True)
segment()


# DIRECTORIES

setup_print("DIRECTORIES", "info", True)

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
        os.mkdir(d)
        setup_print("Directory created: " + d, "success", indent=1)
    else:
        setup_print("Directory exists: " + d, "success", indent=1)

setup_print("DONE", "success", center=True)
segment()


# VENDORS

tmp_dir = os.path.join("files", "tmp")
codemirror_dir = os.path.join("app", "static", "vendor", "codemirror")

if os.path.exists(codemirror_dir):
    setup_print("Vendor exists: codemirror", "success", indent=1)
else:
    setup_print("Setting up codemirror")
    setup_print("Downloading codemirror")
    try:
        codemirror_zip_path, _ = urllib.request.urlretrieve("https://codemirror.net/5/codemirror.zip")
    except Exception as e:
        setup_print("Error while downoalding", "error")
        setup_print(str(e), "error")
        setup_print("exiting...", "error")
        exit(1)

    setup_print("Setting up codemirror")
    setup_print("Downloading codemirror")
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
        setup_print("Error while extracting", "error")
        setup_print(str(e), "error")
        setup_print("exiting...", "error")
        exit(1)

    setup_print("Setup vendor: codemirror", "success", indent=1)


# END

setup_print("The environment is ready for development", "success", indent=1)
setup_print("Press enter to exit, r for run the app", indent=1)

i = input("    [<enter>/r]: ").lower()

if i == "r":
    subprocess.run(
        [python_command, "run.py"],
    )

setup_print("DONE", "success", True)
