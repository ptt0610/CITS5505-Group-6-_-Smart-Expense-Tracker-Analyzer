import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask import Blueprint
from config import Config

db = SQLAlchemy()
migrate = Migrate()
login = LoginManager()
core = Blueprint('core', __name__)

def create_application():
    app = Flask(
        __name__,
        template_folder=os.path.join(os.path.dirname(__file__), '..', 'templates'),
        static_folder=os.path.join(os.path.dirname(__file__), '..', 'static')
    )
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    login.init_app(app)
    login.login_view = 'core.login'
    login.login_message_category = 'info'

    from app import routes
    app.register_blueprint(core)

    from app.models import User, Expense, SharedExpense

    @login.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    return app

app = create_application()