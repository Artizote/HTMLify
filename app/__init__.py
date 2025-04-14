from flask import Flask

from datetime import timedelta
from threading import Thread

from .routes import register_blueprints
from .routes.public import PROCESS_POOL
from .executors import *
from .models import db
from .search_engine import *
from .config import *

app = Flask(__name__)

app.secret_key = SECRET_KEY

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=28)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"

db.init_app(app)

register_blueprints(app)

def run_app(debug=True):
    Thread(target=search_indexing_daemon, args=(TermFrequency, app, files), daemon=True).start()
    Thread(target=process_pool_purger, args=(PROCESS_POOL,), daemon=True).start()
    app.run(debug=debug)

if __name__ == "__main__":
    run_app()
