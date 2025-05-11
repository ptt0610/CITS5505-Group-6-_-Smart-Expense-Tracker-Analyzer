import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
login = LoginManager()

app = Flask(
    __name__,
    template_folder=os.path.join(os.path.dirname(__file__), '..', 'templates'),
    static_folder=os.path.join(os.path.dirname(__file__), '..', 'static')
)

# Load configuration from config.py
app.config.from_object(Config)

# Print the URI to check it
print("SQLAlchemy Database URI:", app.config['SQLALCHEMY_DATABASE_URI'])

# Initialize extensions
db.init_app(app)
migrate.init_app(app, db)
login.init_app(app)
login.login_view = 'login'
login.login_message_category = 'info'

# Define user_loader callback for Flask-Login
@login.user_loader
def load_user(user_id):
    from app.models import User
    return User.query.get(int(user_id))

# Import models to ensure they are registered with SQLAlchemy
from app.models import User, Expense, SharedExpense

# Import routes to register them with the app
from app import routes