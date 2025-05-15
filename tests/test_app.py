import unittest
import sys
import os
from datetime import datetime
from flask import Flask, url_for
from flask_testing import TestCase
from bs4 import BeautifulSoup

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import db
from app.models import User, Expense, SharedExpense
from app import routes

class ExpenseTrackerTests(TestCase):
    def create_app(self):
        # Create app with test config
        app = Flask(
            __name__,
            template_folder=os.path.join(os.path.dirname(__file__), '..', 'templates'),
            static_folder=os.path.join(os.path.dirname(__file__), '..', 'static')
        )
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['SECRET_KEY'] = 'test-secret-key'
        app.config['UPLOAD_FOLDER'] = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'static/uploads/profile_pics')
        
        # Initialize extensions
        db.init_app(app)
        app.register_blueprint(routes.core)
        
        # Set up Flask-Migrate and Flask-Login
        from flask_migrate import Migrate
        from flask_login import LoginManager
        migrate = Migrate()
        login = LoginManager()
        migrate.init_app(app, db)
        login.init_app(app)
        login.login_view = 'core.login'
        login.login_message_category = 'info'
        
        @login.user_loader
        def load_user(user_id):
            return db.session.get(User, int(user_id))
        
        print("SQLAlchemy Database URI in create_app:", app.config['SQLALCHEMY_DATABASE_URI'])
        return app

    def setUp(self):
        db.create_all()
        user1 = User(email='test1@example.com', first_name='Test', last_name='One')
        user1.set_password('password')
        user2 = User(email='test2@example.com', first_name='Test', last_name='Two')
        user2.set_password('password')
        db.session.add_all([user1, user2])
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_signup(self):
        response = self.client.get(url_for('core.signup'))
        response = self.client.post(url_for('core.signup'), data={
            'first_name': 'New',
            'last_name': 'User',
            'email': 'newuser@example.com',
            'password': 'password'
        }, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Welcome Back!', response.data)
        user = User.query.filter_by(email='newuser@example.com').first()
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, 'New')
        self.assertEqual(user.last_name, 'User')

    def test_signup_invalid_email(self):
        response = self.client.get(url_for('core.signup'))
        response = self.client.post(url_for('core.signup'), data={
            'first_name': 'Test',
            'last_name': 'One',
            'email': 'test1@example.com',
            'password': 'password'
        }, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Email already registered', response.data)

    def test_login(self):
        response = self.client.get(url_for('core.login'))
        response = self.client.post(url_for('core.login'), data={
            'email': 'test1@example.com',
            'password': 'password'
        }, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Dashboard', response.data)
        user = User.query.filter_by(email='test1@example.com').first()
        self.assertIsNotNone(user)

    def test_login_invalid_password(self):
        response = self.client.get(url_for('core.login'))
        response = self.client.post(url_for('core.login'), data={
            'email': 'test1@example.com',
            'password': 'wrongpassword'
        }, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Invalid email or password', response.data)

    def test_add_record(self):
        self.login('test1@example.com', 'password')
        self.client.get(url_for('core.records'))
        response = self.client.post(url_for('core.save_records'), json={
            'amount': 100.0,
            'category': 'Food',
            'date': '2025-05-15'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Saved Successfully', response.data)
        expense = Expense.query.filter_by(amount=100.0, category='Food').first()
        self.assertIsNotNone(expense)
        self.assertEqual(expense.user.email, 'test1@example.com')
        self.assertEqual(expense.date.isoformat(), '2025-05-15')

    def test_add_record_unauthenticated(self):
        response = self.client.post(url_for('core.save_records'), json={
            'amount': 100.0,
            'category': 'Food',
            'date': '2025-05-15'
        })
        self.assertEqual(response.status_code, 401)
        expense = Expense.query.filter_by(amount=100.0).first()
        self.assertIsNone(expense)

    def test_delete_record(self):
        self.login('test1@example.com', 'password')
        expense = Expense(
            amount=50.0,
            category='Travel',
            date=datetime.now().date(),
            user=User.query.filter_by(email='test1@example.com').first()
        )
        db.session.add(expense)
        db.session.commit()
        self.client.get(url_for('core.records'))
        response = self.client.post(url_for('core.delete_record'), json={
            'record_id': expense.id
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Deleted Successfully', response.data)
        deleted_expense = db.session.get(Expense, expense.id)
        self.assertIsNone(deleted_expense)

    def test_delete_record_invalid_id(self):
        self.login('test1@example.com', 'password')
        self.client.get(url_for('core.records'))
        response = self.client.post(url_for('core.delete_record'), json={
            'record_id': 999
        })
        self.assertEqual(response.status_code, 404)
        self.assertIn(b'Not found', response.data)

    def test_share_expense(self):
        self.login('test1@example.com', 'password')
        expense = Expense(
            amount=75.0,
            category='Entertainment',
            date=datetime.now().date(),
            user=User.query.filter_by(email='test1@example.com').first()
        )
        db.session.add(expense)
        db.session.commit()
        user2 = User.query.filter_by(email='test2@example.com').first()
        self.client.get(url_for('core.share'))
        response = self.client.post(url_for('core.share_expenses'), json={
            'recipient_id': user2.id,
            'expense_ids': [expense.id]
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Shared 1 expenses successfully', response.data)
        shared_expense = SharedExpense.query.filter_by(
            sharer_id=User.query.filter_by(email='test1@example.com').first().id,
            recipient_id=user2.id,
            expense_id=expense.id
        ).first()
        self.assertIsNotNone(shared_expense)

    def test_share_expense_invalid_recipient(self):
        self.login('test1@example.com', 'password')
        expense = Expense(
            amount=75.0,
            category='Entertainment',
            date=datetime.now().date(),
            user=User.query.filter_by(email='test1@example.com').first()
        )
        db.session.add(expense)
        db.session.commit()
        self.client.get(url_for('core.share'))
        response = self.client.post(url_for('core.share_expenses'), json={
            'recipient_id': 999,
            'expense_ids': [expense.id]
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn(b'Invalid recipient', response.data)

    def login(self, email, password):
        response = self.client.get(url_for('core.login'))
        return self.client.post(url_for('core.login'), data={
            'email': email,
            'password': password
        }, follow_redirects=True)

if __name__ == '__main__':
    unittest.main()