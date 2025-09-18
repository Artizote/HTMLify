import os
import subprocess


# command checking

print("checking commands/utilies")

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

has_pip = check_command("pip")
has_pip3 = check_command("pip3")
has_python = check_command("python")
has_python3 = check_command("python3")
has_git = check_command("git")
# has_git_from_config = check_command(GIT_COMMAND_PATH)
has_docker = check_command("docker")
# has_docker_from_config_path = check_command(DOCKER_COMMAND_PATH)

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
    print("Faild to find the pip command")
    print("pip is required for packages installation")
    print("exiting...")
    exit()
else:
    print("\thas pip")

if not has_python and not has_python3:
    print("Warning: Failed to find python")
else:
    print("\thas python")

if not has_git: #and not has_git_from_config:
    print("Warning: Failed to find git")
else:
    print("\thas get")

if not has_docker: #and not has_docker_from_config_path:
    print("Warning: Failed to find docker")
else:
    print("\thas docker")

print()

# requirements

print("installing requirements")


subprocess.run(
    [pip_command, "install", "-r", "requirements.txt"],
    stdout = subprocess.PIPE,
)

print("\tinstalled requirements")
print()


# directories

print("creating directories")

for r_dir in ["media", "media/dp", "media/qr", "instance"]:
    if not os.path.exists(r_dir):
        os.mkdir(r_dir)
        print("created directory", r_dir)

print("\tdirectories created")
print()


# database

print("creating database")

from app import app, db

with app.app_context():
    db.create_all()

print("\tdatabase created")
print()


# end

print("The environment is ready for development")
print("Press enter to exit, r for run the app")

from app import run_app

i = input("[enter/r]: ").lower()

if i == "r":
    subprocess.run(
        [python_command, "run.py"],
    )
