from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from app import db, login

class User(UserMixin, db.Model):
    id            = db.Column(db.Integer, primary_key=True)
    email         = db.Column(db.String(120), unique=True, index=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    expenses      = db.relationship('Expense', backref='user', lazy='dynamic')

    def set_password(self, pw):
        self.password_hash = generate_password_hash(pw)

    def check_password(self, pw):
        return check_password_hash(self.password_hash, pw)

    def __repr__(self):
        return f'<User {self.email}>'

@login.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class Expense(db.Model):
    id        = db.Column(db.Integer, primary_key=True)
    amount    = db.Column(db.Float,   nullable=False)
    category  = db.Column(db.String(64), nullable=False)
    date      = db.Column(db.Date,    nullable=False, default=datetime.utcnow)
    user_id   = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Expense {self.id} ${self.amount}>'
