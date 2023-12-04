from flask import request
from flask_sqlalchemy import *
from datetime import datetime
from pygments import highlight, lexers, formatters
from random import randint
#from utils import *
from config import *



def randstr(n):
    s = ""
    chars = "qwertyuiopasdfghjklzxcvbnm1234567890"
    for _ in range(n):
        s += chars[randint(0, 35)]
    return s



db = SQLAlchemy()

class users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True)
    password = db.Column(db.String(64))
    email = db.Column(db.String(128), unique=True)
    files = db.relationship("files", backref="users")
    quata = db.Column(db.Integer, default=0)
    comments = db.relationship("comments", backref="users")
    notifications = db.relationship("Notification", backref="users")
    
    #stars = db.relationship("files", backref="files")
    
    # --------- to be add, start system ------------- #
    
    @classmethod
    def get_user(users, username):
        return users.query.filter_by(username=username).first()
    
    def file_count(user):
        return files.query.filter_by(owner=user.username).count()
    
    def view_count(user):
        return sum([file.views for file in files.query.filter_by(owner=user.username).all()])
    
    #def notify(user, content, href):
#        n = Notification(user=user.username, content=content, href=content)
#        db.session.add(n)
#        db.session.commit()

class files(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    path = db.Column(db.String(1024), unique=True)
    content = db.Column(db.String())
    ext = db.Column(db.String(8))
    type = db.Column(db.String())
    owner = db.Column(db.String(64), db.ForeignKey("users.username"))
    size = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    mode = db.Column(db.String(1), default="r")
    # mode - showmode of the file  r | p | s
    # r - raw mode, show as plain text
    # p - parse mode, for html documents only
    # s - show mode, enable syntex highlighting
    visibility = db.Column(db.String(1), default="p")
    # p - public, show file to all users
    # h - hidden, hide file from other users
    # o - once, file can be only seen once then visiblity will chnage to h
    comments = db.relationship("comments", backref="files")
    password = db.Column(db.String(64), default="")
    #stared = db.Column("")
    # --------- to be add, start system ------------- #
    
    @classmethod
    def by_path(files, path):
        return files.query.filter_by(path=path).first()
    
    def sizef(file):
        size = file.size
        units = ["", "K", "M", "G"]
        degre = 0
        while size // 1024 > 0:
            degre += 1
            size /= 1024
        size = round(size, 2)
        return str(size) + " " + units[degre] + "B"
    
    def highlighted(file):
        try:
            l = lexers.get_lexer_for_filename(file.path.split("/")[-1])
        except:
            l = lexers.get_lexer_for_filename("file.txt")
        return highlight(file.content, l, formatters.HtmlFormatter())

class comments(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file = db.Column(db.Integer, db.ForeignKey("files.id"))
    author = db.Column(db.String(64), db.ForeignKey("users.username"))
    content = db.Column(db.String())
    time = db.Column(db.DateTime, default=datetime.utcnow)
    # ------ to be imliment ---------#
    #  likes
    #  replies

class Token(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.String(32))
    ip = db.Column(db.String(), nullable=True)
    page = db.Column(db.String())
    
    
    @classmethod
    def generate(Token):
        t = randstr(32)
        page = request.url
        ip = request.remote_addr
        token = Token(value = t, page=page, ip=ip)
        with db.session.begin_nested():
            db.session.add(token)
            db.session.commit()
        return t
    
    @classmethod
    def verify(Token,token):
        Token.revoke()
        if token := Token.query.filter_by(value=token).first():
            Token.revoke(token.value)
            return True
            if token.page == request.url:
                db.session.delete(token)
                db.session.commit()
                return True
        return False
     
    @classmethod
    def revoke(Token, token=None):
        if t := Token.query.filter_by(value=token).first():
            db.session.delete(t)
            db.session.commit()
            return True
        token_count = Token.query.count()
        if  token_count > SESSION_TOKENS_LIMIT:
            tokens = Token.query.limit(token_count - SESSION_TOKENS_LIMIT).all()
            for token in tokens:
                db.session.delete(token)
            db.session.commit()
            return True
        return False


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.String(64), db.ForeignKey("users.username"))
    content = db.Column(db.String())
    href = db.Column(db.String())
    viewed = db.Column(db.Integer, default=0)
    # 0 -> not viewd
    # 1 -> viewd
    send_time = db.Column(db.DateTime,  default=datetime.utcnow)
    view_time = db.Column(db.DateTime, nullable=True)
    
    
    @classmethod
    def notify(ns, user, message, href):
        if not users.get_user(user): return None
        n = ns(user=user, content=message, href=href)
        db.session.add(n)
        db.session.commit()
    
    @classmethod
    def by_id(ns, id):
        return ns.query.filter_by(id=id).first()

