from flask import Flask

from datetime import timedelta
from threading import Thread

from .routes import register_blueprints
from .routes.public import PROCESS_POOL
from .executors import *
from .models import db, TmpFile, TmpFolder
from .search_engine import *
from .utils.daemons import *
from .config import *

app = Flask(__name__)

app.secret_key = SECRET_KEY

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=28)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"

db.init_app(app)

register_blueprints(app)

def run_daemons():
    Thread(target=search_indexing_daemon,   args=(TermFrequency, app, files),   daemon=True).start()
    Thread(target=process_pool_purger,      args=(PROCESS_POOL,),               daemon=True).start()
    Thread(target=tmp_file_purger,          args=(TmpFile,),                    daemon=True).start()
    Thread(target=tmp_folder_purger,        args=(TmpFolder,),                  daemon=True).start()

def run_app(debug=True):
    run_daemons()
    app.run(debug=debug)

if __name__ == "__main__":
    run_app()
