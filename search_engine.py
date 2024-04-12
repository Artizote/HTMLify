from peewee import *
from models import files
from re import findall
from time import sleep
from hashlib import sha1

def hash(s):
    if isinstance(s,str):
       return sha1(s.encode()).hexdigest()
    return sha1(s).hexdigest()

search_index_database = SqliteDatabase("instance/search.db")

class TermFrequency(Model):
    class Meta:
        database = search_index_database

    term = CharField()
    term_rev = CharField()
    file = IntegerField()
    content = IntegerField(default=0)
    title = IntegerField(default=0)
    comments = IntegerField(default=0)
    path = IntegerField(default=0)

    def __repr__(self):
        return "<TermFrequency of " + self.term + " in file id " + str(self.file) + " >"

    def __str__(self):
        return "<TermFrequency of " + self.term + " in file id " + str(self.file) + " >"


    @staticmethod
    def feed(id): # Run Withing Flask App context
        file = files.query.filter_by(id=id).first()
        if not file:
            return False

        if not ContentHashes.is_changed(id):
            return True

        text = (
            file.content if file.type == "text" else "" +
            file.name +
            file.path[file.path.find("/")].replace("/", " ") +
            "".join([comment.content for comment in file.comments])
        ).lower()

        # Removing removed words
        for term in TermFrequency.select().where(TermFrequency.file == id):
            if not term.term in text[:1024*1024]:
                term.delete_instance()

        words = findall(r"\b\w+\b", text[:1024*1024])
        for word in words:
            tf = TermFrequency.select().where(
                TermFrequency.term == word).where(
                TermFrequency.file == id).first()
            if not tf:
                tf = TermFrequency.create(
                    term = word,
                    term_rev = word[::-1],
                    file = id,
                )
            tf.content = file.content.count(word) if file.type == "text" else 0
            tf.title = file.name.count(word)
            tf.path = file.name[file.path.find("/"):].count(word)
            tf.comments = 0
            for comment in file.comments:
                tf.comments + comment.content.count(word)
            tf.save()

    def file_views(self, id=None):
        if not id:
            id = self.file
        file = files.query.filter_by(id=id).first()
        if not file:
            return 0
        return file.views

class ContentHashes(Model):
    class Meta:
        database = search_index_database

    id = AutoField()
    hash = CharField()

    @classmethod
    def is_changed(CH, file):
        if isinstance(file, int):
            file = files.query.filter_by(id=file).first()
        if not file: return None

        OCH = CH.get_or_none(file.id)
        if not OCH:
            CH.feed(file)
            return True
        return OCH.hash != hash(file.content)

    @classmethod
    def feed(CH, file):
        if isinstance(file, int):
            file = files.query.filter_by(id=file).first()
        if not file: return None

        OCH = CH.get_or_none(file.id)

        if not OCH:
            CH.create(
                id =file.id,
                hash = hash(file.content)
            )
            return True

        content_hash = hash(file.content)

        if content_hash != OCH.hash:
            OCH.hash = content_hash
            OCH.save()




def query(term: str) -> list[dict]:

    if len(term.split()) > 1:
        terms = term.split()
        results = []
        for t in terms:
            results.extend(query(t))
        return sorted(results, key = lambda x: -x["score"])

    terms = TermFrequency.select().where(TermFrequency.term == term)
    files_ = [term.file for term in terms]
    results = []
    weights = {
        "content": 1,
        "path": 2,
        "comments": 0.1,
        "title": 0.1,
    }
    total_views = 0
    for file in files_:
        f_terms = terms.where(TermFrequency.file == file)
        score = 0
        for f_term in f_terms:
            if f_term.content > 5:
                score += 5 - ((f_term.content - 5) / 10)
            else:
                score += f_term.content

            if f_term.path > 3:
                score += 6 * weights["path"]
            else:
                score += f_term.path * weights["path"]

            if f_term.title < 5:
                score += f_term.title * weights["title"]
            else:
                score -= (f_term.title * weights["title"]) *2

            score += f_term.comments * weights["comments"]

        file = files.query.filter_by(id = file).first()

        if not file:
            continue

        fa = file.content.find(term)
        fc = file.content[abs(fa-100): fa +100]
        fc = fc.replace("<", "&lt;").replace(">", "&gt;").lower()
        fc = fc.replace(term, "<span class=\"search-found\">"+term+"</span>")

        total_views += file.views
        results.append({
            "id": file.id,
            "name": file.name,
            "owner": file.owner,
            "views": file.views,
            "path": file.path,
            "mode": file.mode,
            "comments": str(len(file.comments)),
            "score": score,
            "snippet": fc
        })

    views_avg = total_views / (len(results) if results else 1)
    for r in results:
        r["score"] = r["score"]*((r["views"]*views_avg)/100)
    return sorted(results, key = lambda x: -x["score"])


def file(id):
    return files.query.filter_by(id=id).first()

def search_indexing_daemon(TermFrequency, app, files):
    with app.app_context():
        while True:
            sleep(5)
            file_count = files.query.order_by(files.id.desc()).first()
            for id in range(1, file_count.id+1):
                TermFrequency.feed(id)

search_index_database.create_tables([TermFrequency, ContentHashes])
