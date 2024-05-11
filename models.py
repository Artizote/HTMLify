from flask import request
from flask_sqlalchemy import *
from datetime import datetime, timedelta
from pygments import highlight, lexers, formatters
from random import randint
from re import compile, sub, match, findall
#from utils import *
from config import *



def randstr(n):
    s = ""
    chars = "qwertyuiopasdfghjklzxcvbnm1234567890"
    for _ in range(n):
        s += chars[randint(0, 35)]
    return s

def escape_html(code) -> str:
    entitys = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    }
    for e in entitys.keys():
        code = code.replace(e, entitys[e])
    return code

def api_key():
    return randstr(32)


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
    api_key = db.Column(db.String(32), default=api_key)
    
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
    owner = db.Column(db.String(64), db.ForeignKey("users.username"), nullable=True)
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
    revisions = db.relationship("Revision", backref="files")
    password = db.Column(db.String(64), default="")
    as_guest = db.Column(db.Boolean, default=False)
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

    def get_sub_directories(path: str) -> list[str]:
        if path and path[-1] != "/":
            path += "/"
        tree = files.query.filter(files.path.startswith(path)).all()
        sd = []
        for item in tree:
            if item.path.find("/", len(path)) == -1:
                continue
            directory = item.path[:item.path.find("/", len(path))]
            if directory not in sd:
                sd.append(directory)
        sd.remove(path)
        return sd

    def get_tree(path: str) -> list[str]:
        if path and path[-1] != "/":
            path += "/"
            tree = list(map(lambda i:i.path, files.query.filter(files.path.startswith(path)).all()))
        return tree

    def get_directory_tree(path: str) -> list[str]:
        if path and path[-1] != "/":
            path += "/"
        tree = files.query.filter(files.path.startswith(path)).all()
        dtree = []
        for item in tree:
            directory = item.path[:item.path.rfind("/")]
            if directory not in dtree:
                dtree.append(directory)
        return dtree

    @classmethod
    def create_as_guest(files, username, filecontent, password="", ext="txt", visibility="p", mode="s"):

        if not users.query.filter_by(username=username):
            return

        path = randstr(10)
        while files.by_path("guest/"+path+"."+ext):
            path = randstr(10)

        file = files(
            path = "guest"+path+"."+ext,
            owner = username,
            title = title,
            password = password,
            ext = ext,
            type = "text",
            content = filecontent,
            visibility = visibility,
            mode = mode,
        )
        db.session.add(file)
        db.session.commit()

        return file.path

    def shortlink(self):
        return ShortLink.create("/"+self.path)

    def last_revision(self):
        return Revision.query.filter_by(file=self.id).order_by(Revision.time.desc()).first()



class comments(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file = db.Column(db.Integer, db.ForeignKey("files.id"))
    author = db.Column(db.String(64), db.ForeignKey("users.username"))
    content = db.Column(db.String())
    time = db.Column(db.DateTime, default=datetime.utcnow)
    # ------ to be imliment ---------#
    #  likes
    #  replies

    @classmethod
    def comment(comments, on, by, content):
        if not content or set(content) == {" "}: return False

        file = files.query.filter_by(id=on).first()
        user = users.query.filter_by(id=by).first()

        if not all((file, user)): return False

        content = escape_html(content).replace("\n", "<br>")

        valid_tags = {"b", "u", "i", "s", "sub", "sup", "code"
                      "B", "U", "I", "S", "SUB", "SUP", "CODE"}

        for tag in valid_tags:
            content = content.replace("&lt;" + tag + "&gt;", "<" + tag + ">")
            content = content.replace("&lt;/" + tag + "&gt;", "</" + tag + ">")

        for tag in valid_tags:
            open_tags = content.count("<" + tag + ">")
            close_tags = content.count("</" + tag + ">")
            if open_tags > close_tags:
                content += ("</" + tag + ">") * (open_tags - close_tags)

        content = sub(r'@([\w/\.-]+)', r'<a href="/\1">@\1</a>', content)

        comment = comments(file=on, author=user.username, content=content)

        mp = compile(r"@([\w\.-]+)")
        mentions = set(findall(mp, content))

        db.session.add(comment)
        db.session.commit()
        for mention in mentions:
            Notification.notify(mention, "<b>" + user.username + "</b> mentioned you in the comment", "/src/"+file.path + "#comment-" + str(comment.id))
        if file.owner != user.username:
            Notification.notify(file.owner, "<b>" + user.username + "</b> comment something on " + file.name, "/src/"+file.path + "#comment-" + str(comment.id))
        return comment


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
    def notify_all(ns, all_users:list[users] ,message, href):
        if not all_users:
            all_users = map(lambda u: u.username, users.query.all())
        for user in all_users:
            n = ns(user=user, content=message, href=href)
            db.session.add(n)
        db.session.commit()

    @classmethod
    def by_id(ns, id):
        return ns.query.filter_by(id=id).first()

    @classmethod
    def purge(ns, username):
        expiry_period = timedelta(days=28)
        for n in ns.query.filter_by(user=username).filter_by(viewed=1).all():
            if not n.view_time:
                db.session.delete(n)
                continue
            if expiry_period > datetime.utcnow() - n.view_time:
                db.session.delete(n)
        db.session.commit()

class Revision(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file = db.Column(db.Integer, db.ForeignKey("files.id"))
    content = db.Column(db.String())
    time = db.Column(db.DateTime, default=datetime.utcnow)

    @classmethod
    def get(R, id):
        return R.query.filter_by(id=id).first()

    def next(self):
        rs = Revision.query.filter_by(file=self.file).order_by(Revision.time).all()
        for r in rs:
            if r.time > self.time:
                return r

    def prev(self):
        rs = Revision.query.filter_by(file=self.file).order_by(Revision.time.desc()).all()
        for r in rs:
            if r.time < self.time:
                return r

    @classmethod
    def make_for(rv, file: int | files):
        if isinstance(file, int):
            file = files.query.filter_by(id=file).first()
        if not file or file.type != "text":
            return None
        r = rv(
            file = file.id,
            content = file.content,
        )
        db.session.add(r)
        db.session.commit()


class ShortLink(db.Model):
    id = db.Column(db.Integer, primary_key=True, )
    href = db.Column(db.String)
    short = db.Column(db.String, unique=True)
    visits = db.Column(db.Integer, default=0)

    @classmethod
    def create(SL, href, new=False):
        link = SL.query.filter_by(href=href).first()
        if not new and link:
            return link.short
        for l in range(4, 10):
            short = randstr(l)
            if not SL.query.filter_by(short=short).first():
                break
        link = SL(href=href, short=short)
        db.session.add(link)
        db.session.commit()
        return link.short

    @classmethod
    def get(SL, id: "id or short"):
        if isinstance(id, int):
            return SL.query.filter_by(id=id).first()
        return SL.query.filter_by(short=id).first()

    def hit(self):
        self.visits += 1
        db.session.commit()


