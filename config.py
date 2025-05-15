import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'TRUNG'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')  # Place app.db in project root
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(basedir, 'static/uploads/profile_pics')
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}
    SESSION_PERMANENT = False  # Disable permanent sessions
    PERMANENT_SESSION_LIFETIME = 1800  # Sessions expire after 30 minutes
    SESSION_COOKIE_HTTPONLY = True  # Prevent JavaScript access to cookies
    SESSION_COOKIE_SAMESITE = 'Lax'  # Protect against CSRF
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS