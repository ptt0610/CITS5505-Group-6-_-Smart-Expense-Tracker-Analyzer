from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(64))
    last_name = db.Column(db.String(64))
    username = db.Column(db.String(64), unique=True)
    dob = db.Column(db.Date)
    company = db.Column(db.String(120))
    salary = db.Column(db.Float)
    profile_pic = db.Column(db.String(256))
    expenses = db.relationship('Expense', backref='user', lazy='dynamic')
    shared_expenses = db.relationship('SharedExpense', foreign_keys='SharedExpense.sharer_id', backref='sharer', lazy='dynamic')
    received_expenses = db.relationship('SharedExpense', foreign_keys='SharedExpense.recipient_id', backref='recipient', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(64), nullable=False)
    date = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    shared = db.relationship('SharedExpense', backref='expense', lazy='dynamic')

class SharedExpense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sharer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    expense_id = db.Column(db.Integer, db.ForeignKey('expense.id'), nullable=False)
    shared_date = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())