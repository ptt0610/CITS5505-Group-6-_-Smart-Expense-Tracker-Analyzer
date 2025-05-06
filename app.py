import os
from datetime import datetime
from flask import (
    Flask, request, jsonify, render_template,
    redirect, url_for, flash
)
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import (
    LoginManager, login_user, logout_user,
    login_required, current_user, UserMixin
)
from werkzeug.security import generate_password_hash, check_password_hash

# ─── App & Database Setup ─────────────────────────────────────────────────────
app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'you-will-never-guess')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db      = SQLAlchemy(app)
migrate = Migrate(app, db)
login   = LoginManager(app)
login.login_view = 'login'      # if not logged in, redirect here

# ─── Models ────────────────────────────────────────────────────────────────────
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
    id       = db.Column(db.Integer, primary_key=True)
    amount   = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(64), nullable=False)
    date     = db.Column(db.Date, default=datetime.utcnow, nullable=False)
    user_id  = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Expense {self.id} ${self.amount}>'

# ─── Page Routes ───────────────────────────────────────────────────────────────
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        # grab form values
        first = request.form.get('first_name')
        last  = request.form.get('last_name')
        email = request.form.get('email')
        pw    = request.form.get('password')

        # check for existing email
        if User.query.filter_by(email=email).first():
            flash('Email already registered.', 'danger')
            return redirect(url_for('signup'))

        # create & save user
        user = User(email=email)
        user.set_password(pw)
        # if you’ve added first_name/last_name columns, assign them here:
        # user.first_name = first
        # user.last_name  = last

        db.session.add(user)
        db.session.commit()              # ← this actually writes to app.db
        flash('Registration successful—please log in.', 'success')
        return redirect(url_for('login'))

    # GET just shows the blank form
    return render_template('signup.html')


@app.route('/forgot-password')
def forgot_password():
    return render_template('forgot_password.html')

# ─── UPDATED login route ───────────────────────────────────────────────────────
@app.route('/login', methods=['GET','POST'])
def login():
    # already logged in?
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        email = request.form.get('email')
        pw    = request.form.get('password')
        user = User.query.filter_by(email=email).first()

        if user and user.check_password(pw):
            login_user(user)
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password', 'danger')
            return redirect(url_for('login'))

    # GET
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/records')
@login_required
def records():
    return render_template('records.html')

@app.route('/share')
def share():
    return render_template('share.html')

@app.route('/share_history')
def share_history():
    return render_template('share_history.html')

# ─── AJAX / JSON APIs for Expense CRUD ─────────────────────────────────────────
@app.route('/get_records')
@login_required
def get_records():
    data = [{
        'id':       e.id,
        'amount':   e.amount,
        'category': e.category,
        'date':     e.date.isoformat()
    } for e in current_user.expenses.order_by(Expense.date.desc())]
    return jsonify(data)

@app.route('/save_records', methods=['POST'])
@login_required
def save_records():
    js  = request.get_json()
    rid = js.get('record_id')
    if rid:
        e = Expense.query.get(rid)
        if not e or e.user_id != current_user.id:
            return jsonify(error='Not found'), 404
        e.amount   = js['amount']
        e.category = js['category']
        e.date     = datetime.fromisoformat(js['date']).date()
        msg = 'Updated Successfully'
    else:
        e = Expense(
            amount   = js['amount'],
            category = js['category'],
            date     = datetime.fromisoformat(js['date']).date(),
            user     = current_user
        )
        db.session.add(e)
        msg = 'Saved Successfully'
    db.session.commit()
    return jsonify(success=msg)

@app.route('/delete_record', methods=['POST'])
@login_required
def delete_record():
    rid = request.get_json().get('record_id')
    e   = Expense.query.get(rid)
    if not e or e.user_id != current_user.id:
        return jsonify(error='Not found'), 404
    db.session.delete(e)
    db.session.commit()
    return jsonify(success='Deleted Successfully')

# ─── Error Handler ────────────────────────────────────────────────────────────
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

# ─── Run the App ───────────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True)
