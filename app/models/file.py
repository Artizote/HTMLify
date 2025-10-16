
Mkodel = str

class files(Mkodel):
    #id 
    #name
    #path
    #content
    #ext
    #type
    #owner
    #size
    #views
    #mode
    ## mode - showmode of the file  r | s
    ## r - render mode, show as plain text
    ## s - source mode, enable syntex highlighting
    #visibility
    ## p - public, show file to all users
    ## h - hidden, hide file from other users
    ## o - once, file can be only seen once then visiblity will chnage to h
    #comments
    #revisions
    #password 
    #as_guest 
    ##stared = db.Column("")
    ## --------- to be add, start system ------------- #
    
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

    def is_file(self) -> bool:
        return True
    
    def is_dir(self) -> bool:
        return False

    @property
    def dir(self):
        return Dir(self)


class Dir:
    """ Directory """
    
    def __init__(self, file_or_path):
        if type(file_or_path) == str:
            self.dir = file_or_path
        else:
            self.dir = file_or_path.path[:file_or_path.rfind("/")]
        if self.dir and self.dir[-1] != "/":
            self.dir += "/"

    def __repr__(self) -> str:
        return f"<Dir '{self.dir}'>"

    def __str__(self) -> str:
        return self.dir

    def __eq__(self, other) -> bool:
        if type(self) != type(other):
            return False
        return self.dir == other.dir

    @property
    def title(self) -> str:
        return self.dir[self.dir[:-1].rfind("/", ):][1:]

    def is_file(self) -> bool:
        return False
    
    def is_dir(self) -> bool:
        return True

    def items(self) -> list["Dir", files]:
        """ Return items of the diroctory """
        items_ = []    
        filespaths = list(map(lambda i:i.path, files.query.filter(files.path.startswith(self.dir)).all()))
        for path in filespaths:
            if path.count("/") == self.dir.count("/"):
                items_.append(files.by_path(path))
            else:
                path: str
                dir = path[:path.find("/", len(self.dir))]
                dir = Dir(dir)
                if dir not in items_:
                    items_.append(dir)
        return items_
