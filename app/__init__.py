from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from config import Config

db      = SQLAlchemy()
migrate = Migrate()
login   = LoginManager()
login.login_view = 'login'

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    login.init_app(app)

    # import routes & models so Flask sees them
    from app import routes, models

    return app
