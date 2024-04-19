from os import system
from sys import version_info as ver
ver = ver.major
from random import randint
try:
    from app import app, db
    with app.app_context():
        db.create_all()
    i = input("all things set, run the app with \"flask run\", \"python app.py\" or python3 run press enter to exit , r for run the app\n")
    if i == "r":
        system("flask run")
except:
    print("installing required packages")
    if ver < 3:
        system("pip install -r requirements.txt")
    else:
        system("pip3 install -r requirements.txt")
    print("packags installed\nmaking required directories")
    system("mkdir media")
    system("mkdir media/dp")
    system("mkdir instance")
#    print("genrating a secue key..")
#    key = ""
#    for _ in range(256):
#        key += "qwertyuiopasdfghjklzxcvbnm,.';[]\\\"?><1234567890-=+_)(*&^%$#@!~`"[randint(0, 64)]
#    open("config.py", 'w').write("SECRET_KEY=\""+ key +"\"")
#    print("key genrated")
    if ver == 3:
        system("python3 setup.py")
    else:
        system("python setup.py")
