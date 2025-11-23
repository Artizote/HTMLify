
from .public import public
from .dashboard import dashboard
from .api import api

blueprints = [
    public,
    dashboard,
    api,
]

def register_blueprints(app):
    """Register blueprints in `app`"""

    for bp in blueprints:
        app.register_blueprint(bp)
