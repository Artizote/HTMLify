
from .public import public
from .user import user
from .actions import action
from .api import api


blueprints = [
    public,
    user,
    action,
    api,
]

def register_blueprints(app):
    """Register blueprints in `app`"""

    for bp in blueprints:
        app.register_blueprint(bp)
