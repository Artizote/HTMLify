from flask import Flask
from flask_jwt_extended import JWTManager

from datetime import timedelta
from threading import Thread

from .routes import register_blueprints
from .routes.public import PROCESS_POOL
from .executors import *
from .models import TmpFile, TmpFolder, FileMode, FileType, FileVisibility, BlobType
from .search_engine import *
from .utils.daemons import *
from .config import *

app = Flask(__name__, subdomain_matching=True)

app.secret_key = SECRET_KEY

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=28)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SERVER_NAME"] = SERVER_NAME

jwt = JWTManager(app)

@app.context_processor
def context_processor():
    return {
        "SCHEME": SCHEME,
        "SERVER_NAME": SERVER_NAME,
        "FileType": FileType,
        "FileMode": FileMode,
        "FileVisibility": FileVisibility,
        "BlobType": BlobType,
    }

register_blueprints(app)

def run_daemons():
    # TODO: update/rewrote search engine
    # Thread(target=search_indexing_daemon,   args=(TermFrequency, app, files),   daemon=True).start()
    Thread(target=process_pool_purger,      args=(PROCESS_POOL,),               daemon=True).start()
    Thread(target=tmp_file_purger,          args=(TmpFile,),                    daemon=True).start()
    Thread(target=tmp_folder_purger,        args=(TmpFolder,),                  daemon=True).start()

def run_app(debug=True):
    run_daemons()
    app.run(debug=debug)

if __name__ == "__main__":
    run_app()
