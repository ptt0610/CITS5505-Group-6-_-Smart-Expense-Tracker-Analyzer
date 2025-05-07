from flask import render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime
from app import db
from app.models import User, Expense
from app import create_app

app = create_app()  # make sure routes.py runs _after_ create_app

#
#  Authentication
#
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        pw    = request.form['password']
        if User.query.filter_by(email=email).first():
            flash('Email already registered.', 'danger')
            return redirect(url_for('signup'))
        u = User(email=email)
        u.set_password(pw)
        db.session.add(u)
        db.session.commit()
        flash('Registration successful. Please log in.', 'success')
        return redirect(url_for('login'))
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        pw    = request.form['password']
        u = User.query.filter_by(email=email).first()
        if u is None or not u.check_password(pw):
            flash('Invalid credentials.', 'danger')
            return redirect(url_for('login'))
        login_user(u)
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

#
#  Dashboard & Records
#
@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/records')
@login_required
def records():
    return render_template('records.html')

# API: fetch all of current user’s expenses
@app.route('/get_records')
@login_required
def get_records():
    data = [
        {
          'id':       e.id,
          'amount':   e.amount,
          'category': e.category,
          'date':     e.date.isoformat()
        }
        for e in current_user.expenses.order_by(Expense.date.desc())
    ]
    return jsonify(data)

# API: add or update
@app.route('/save_records', methods=['POST'])
@login_required
def save_records():
    js = request.get_json()
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

# API: delete
@app.route('/delete_record', methods=['POST'])
@login_required
def delete_record():
    rid = request.get_json().get('record_id')
    e = Expense.query.get(rid)
    if not e or e.user_id != current_user.id:
        return jsonify(error='Not found'), 404
    db.session.delete(e)
    db.session.commit()
    return jsonify(success='Deleted Successfully')
