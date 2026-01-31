from flask import Flask, render_template, session
from flask_jwt_extended import JWTManager
from werkzeug.exceptions import HTTPException

from datetime import timedelta
from threading import Thread

from .routes import register_blueprints
from .routes.public import PROCESS_POOL
from .services.search import index_item
# from .executors import *
from .models import *
from .models.base import BlobDependent
from .utils.daemons import *
from .config import *

app = Flask(__name__, subdomain_matching=True)

app.secret_key = SECRET_KEY

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=28)
app.config["SERVER_NAME"] = SERVER_NAME

jwt = JWTManager(app)

@app.context_processor
def context_processor():
    return {
        "SCHEME":         SCHEME,
        "SERVER_NAME":    SERVER_NAME,
        "FileType":       FileType,
        "FileMode":       FileMode,
        "FileVisibility": FileVisibility,
        "BlobType":       BlobType,
    }

@app.before_request
def before_request():
    session.permanent = True
    connect_all_dbs()

@app.teardown_request
def teardown_request(_):
    close_all_dbs()

@app.errorhandler(HTTPException)
def http_exception(error):
    return render_template("error.html", error=error), error.code

@app.teardown_appcontext
def teardown_appcontext(_):
    close_all_dbs()

register_blueprints(app)

def run_daemons():
    Thread(target=search_indexing_daemon, args=(index_item, File, Pen),                daemon=True).start()
    Thread(target=search_index_purger,    args=(SearchResult,),                        daemon=True).start()
    # Thread(target=process_pool_purger,    args=(PROCESS_POOL,),                        daemon=True).start()
    Thread(target=tmp_file_purger,        args=(TmpFile,),                             daemon=True).start()
    Thread(target=tmp_folder_purger,      args=(TmpFolder,),                           daemon=True).start()
    Thread(target=blob_purger,            args=(Blob, BlobDependent.__subclasses__()), daemon=True).start()

def run_app(debug=True):
    run_daemons()
    app.run(debug=debug)

if __name__ == "__main__":
    run_app()
