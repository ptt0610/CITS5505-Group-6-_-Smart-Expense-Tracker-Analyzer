from flask import render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime
from app import app, db
from app.models import User, Expense, SharedExpense
from werkzeug.utils import secure_filename
import os
from sqlalchemy import func, extract

# Allowed file extensions for profile pictures
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    print(f"Received request: {request.method} {request.url}")  # Debug
    if request.method == 'POST':
        print(f"Form data: {request.form}")  # Debug entire form
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        email = request.form.get('email')
        password = request.form.get('password')
        
        print(f"Parsed form - first_name: {first_name}, last_name: {last_name}, email: {email}, password: {password}")  # Debug
        if not email or not password:
            flash('Email and password are required.', 'danger')
            print("Validation failed: Missing email or password")  # Debug
            return redirect(url_for('signup'))
        if User.query.filter_by(email=email).first():
            flash('Email already registered.', 'danger')
            print(f"Validation failed: Email {email} already exists")  # Debug
            return redirect(url_for('signup'))
        
        print("Creating User instance")  # Debug
        user = User(email=email, first_name=first_name, last_name=last_name)
        user.set_password(password)
        print("User password set")  # Debug
        db.session.add(user)
        print("User added to session")  # Debug
        try:
            db.session.commit()
            print(f"User {email} saved to database")  # Debug
            flash('Registration successful. Please log in.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            print(f"Database error: {e}")  # Debug
            flash(f'Error registering user: {str(e)}', 'danger')
            return redirect(url_for('signup'))
    print("Rendering signup.html")  # Debug
    return render_template('signup.html')

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    print(f"DEBUG: Received request: {request.method} {request.url}")
    if request.method == 'POST':
        print(f"DEBUG: Form data received: {request.form}")
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        print(f"DEBUG: Parsed form - email: {email}, password: {password}, confirm_password: {confirm_password}")
        
        # Step 1: Validate inputs
        if not email:
            print("DEBUG: Validation failed: Email is missing")
            flash('Email is required.', 'danger')
            return redirect(url_for('forgot_password'))
        if not password:
            print("DEBUG: Validation failed: Password is missing")
            flash('New password is required.', 'danger')
            return redirect(url_for('forgot_password'))
        if not confirm_password:
            print("DEBUG: Validation failed: Confirm password is missing")
            flash('Confirm password is required.', 'danger')
            return redirect(url_for('forgot_password'))
        
        if password != confirm_password:
            print("DEBUG: Validation failed: Passwords do not match")
            flash('Passwords do not match.', 'danger')
            return redirect(url_for('forgot_password'))
        
        print("DEBUG: Input validation passed")
        
        # Step 2: Check if user exists
        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"DEBUG: Validation failed: No user found with email {email}")
            flash('No account found with that email address.', 'danger')
            return redirect(url_for('forgot_password'))
        
        print(f"DEBUG: User found - email: {user.email}, current password_hash: {user.password_hash}")
        
        # Step 3: Update password
        old_hash = user.password_hash
        try:
            print("DEBUG: Attempting to set new password")
            user.set_password(password)  # Hash the new password
            print(f"DEBUG: New password_hash generated: {user.password_hash}")
            db.session.flush()  # Test session validity
            print("DEBUG: Session flush successful")
            db.session.commit()
            print(f"DEBUG: Database commit successful for {email}, old hash: {old_hash}, new hash: {user.password_hash}")
            return redirect(url_for('change_password_successfully'))
        except Exception as e:
            db.session.rollback()
            print(f"DEBUG: Database error during commit: {str(e)}")
            flash(f'Error updating password: {str(e)}', 'danger')
            return redirect(url_for('forgot_password'))
    
    print("DEBUG: Rendering forgot_password.html for GET request")
    return render_template('forgot_password.html')

@app.route('/change_password_successfully')
def change_password_successfully():
    return render_template('change_password_successfully.html')

@app.route('/login', methods=['GET','POST'])
def login():
    print(f"DEBUG: Received request: {request.method} {request.url}")
    if current_user.is_authenticated:
        print("DEBUG: User already authenticated, redirecting to dashboard")
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        pw = request.form.get('password')
        print(f"DEBUG: Attempting to log in user: {email}")
        from sqlalchemy import func
        user = User.query.filter(func.lower(User.email) == email).first()
        if user:
            print(f"DEBUG: User found - email: {user.email}, password_hash: {user.password_hash}")
            print(f"DEBUG: Password check result: {user.check_password(pw)}")
        else:
            print(f"DEBUG: No user found for {email}")
        if user and user.check_password(pw):
            login_user(user)
            print(f"DEBUG: User {email} logged in successfully")
            flash('Log in successful', 'success')
            # Handle 'next' parameter for redirect
            next_page = request.args.get('next')
            from urllib.parse import urlparse, urljoin
            # Check if next_page is safe to prevent open redirect
            if next_page and urlparse(next_page).netloc == '':
                return redirect(next_page)
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password', 'danger')
            print(f"DEBUG: Login failed for {email}")
            return redirect(url_for('login'))
    print("DEBUG: Rendering login.html")
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

@app.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    print(f"Received request: {request.method} {request.url}")  # Debug
    print(f"Form data: {request.form}")  # Debug
    print(f"Files: {request.files}")  # Debug

    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    username = request.form.get('username')
    dob = request.form.get('dob')
    email = request.form.get('email')
    company = request.form.get('company')
    salary = request.form.get('salary')
    password = request.form.get('password')
    confirm_password = request.form.get('confirm_password')

    print(f"Parsed form - first_name: {first_name}, last_name: {last_name}, username: {username}, dob: {dob}, email: {email}, company: {company}, salary: {salary}, password: {password}, confirm_password: {confirm_password}")  # Debug

    if not first_name or not last_name or not username or not dob or not email:
        print("Validation failed: Missing required fields")  # Debug
        return jsonify(error="All required fields must be filled."), 400
    if password and password != confirm_password:
        print("Validation failed: Passwords do not match")  # Debug
        return jsonify(error="Passwords do not match."), 400
    if User.query.filter_by(email=email).first() and email != current_user.email:
        print(f"Validation failed: Email {email} already exists")  # Debug
        return jsonify(error="Email already registered."), 400
    if User.query.filter_by(username=username).first() and username != current_user.username:
        print(f"Validation failed: Username {username} already exists")  # Debug
        return jsonify(error="Username already taken."), 400

    profile_pic = request.files.get('profile_image')
    if profile_pic and allowed_file(profile_pic.filename):
        filename = secure_filename(profile_pic.filename)
        upload_folder = app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, filename)
        profile_pic.save(file_path)
        current_user.profile_pic = f'uploads/profile_pics/{filename}'
        print(f"Profile picture saved: {file_path}")  # Debug
    elif profile_pic:
        print("Validation failed: Invalid file type")  # Debug
        return jsonify(error="Invalid file type. Allowed: jpg, jpeg, png, gif."), 400

    current_user.first_name = first_name
    current_user.last_name = last_name
    current_user.username = username
    try:
        current_user.dob = datetime.strptime(dob, '%Y-%m-%d').date() if dob else None
    except ValueError:
        print("Validation failed: Invalid date format")  # Debug
        return jsonify(error="Invalid date format."), 400
    current_user.email = email
    current_user.company = company
    current_user.salary = float(salary) if salary else None
    if password:
        current_user.set_password(password)

    try:
        db.session.commit()
        print("Profile updated and saved to database")  # Debug
        return jsonify(success="Profile updated successfully!")
    except Exception as e:
        db.session.rollback()
        print(f"Database error: {e}")  # Debug
        return jsonify(error=f"Error updating profile: {str(e)}"), 500

@app.route('/dashboard')
@login_required
def dashboard():
    # Get filter parameters
    category = request.args.get('category', 'All')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # Base query for user's expenses
    query = Expense.query.filter_by(user_id=current_user.id)

    # Apply filters
    if category != 'All':
        query = query.filter_by(category=category)
    if start_date:
        query = query.filter(Expense.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        query = query.filter(Expense.date <= datetime.strptime(end_date, '%Y-%m-%d').date())

    # Get expenses
    expenses = query.all()

    # Calculate KPIs
    total_spending = sum(e.amount for e in expenses) if expenses else 0
    num_transactions = len(expenses)
    avg_spending = total_spending / num_transactions if num_transactions > 0 else 0

    # Get categories and spending by category
    categories = db.session.query(Expense.category).filter_by(user_id=current_user.id).distinct().all()
    categories = [c[0] for c in categories]
    spending_by_category = []
    for cat in categories:
        cat_total = sum(e.amount for e in query.filter_by(category=cat).all())
        spending_by_category.append(cat_total)

    # Get top category
    top_category = None
    if spending_by_category:
        max_spending = max(spending_by_category)
        if max_spending > 0:
            top_category = categories[spending_by_category.index(max_spending)]

    # Get monthly spending for line chart
    monthly_data = (
        db.session.query(
            extract('year', Expense.date).label('year'),
            extract('month', Expense.date).label('month'),
            func.sum(Expense.amount).label('total')
        )
        .filter_by(user_id=current_user.id)
        .group_by('year', 'month')
        .order_by('year', 'month')
        .all()
    )
    monthly_labels = [f"{int(m.year)}-{int(m.month):02d}" for m in monthly_data]
    monthly_spending = [float(m.total) for m in monthly_data]

    return render_template(
        'dashboard.html',
        categories=categories,
        spending_by_category=spending_by_category,
        total_spending=f"{total_spending:.2f}",
        avg_spending=f"{avg_spending:.2f}",
        top_category=top_category or "None",
        num_transactions=num_transactions,
        monthly_labels=monthly_labels,
        monthly_spending=monthly_spending
    )

@app.route('/records')
@login_required
def records():
    return render_template('records.html')

@app.route('/share')
@login_required
def share():
    categories = db.session.query(Expense.category).filter_by(user_id=current_user.id).distinct().all()
    categories = [c[0] for c in categories]
    return render_template('share.html', categories=categories)

@app.route('/share_history')
@login_required
def share_history():
    return render_template('share_history.html')

@app.route('/get_records')
@login_required
def get_records():
    data = [{
        'id': e.id,
        'amount': e.amount,
        'category': e.category,
        'date': e.date.isoformat()
    } for e in current_user.expenses.order_by(Expense.date.desc())]
    return jsonify(data)

@app.route('/save_records', methods=['POST'])
@login_required
def save_records():
    js = request.get_json()
    rid = js.get('record_id')
    if rid:
        e = Expense.query.get(rid)
        if not e or e.user_id != current_user.id:
            return jsonify(error='Not found'), 404
        e.amount = js['amount']
        e.category = js['category']
        e.date = datetime.fromisoformat(js['date']).date()
        msg = 'Updated Successfully'
    else:
        e = Expense(
            amount=js['amount'],
            category=js['category'],
            date=datetime.fromisoformat(js['date']).date(),
            user=current_user
        )
        db.session.add(e)
        msg = 'Saved Successfully'
    db.session.commit()
    return jsonify(success=msg)

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

@app.route('/get_users', methods=['GET'])
@login_required
def get_users():
    users = User.query.filter(User.id != current_user.id).all()
    return jsonify([{
        'id': user.id,
        'name': user.username or f"{user.first_name} {user.last_name}"
    } for user in users])

@app.route('/get_shareable_expenses', methods=['GET'])
@login_required
def get_shareable_expenses():
    query = Expense.query.filter_by(user_id=current_user.id)
    
    # Apply filters
    category = request.args.get('category')
    min_date = request.args.get('min_date')
    max_date = request.args.get('max_date')
    min_amount = request.args.get('min_amount')
    max_amount = request.args.get('max_amount')
    
    if category:
        query = query.filter_by(category=category)
    if min_date:
        query = query.filter(Expense.date >= datetime.strptime(min_date, '%Y-%m-%d').date())
    if max_date:
        query = query.filter(Expense.date <= datetime.strptime(max_date, '%Y-%m-%d').date())
    if min_amount:
        query = query.filter(Expense.amount >= float(min_amount))
    if max_amount:
        query = query.filter(Expense.amount <= float(max_amount))
    
    expenses = query.order_by(Expense.date.desc()).all()
    return jsonify([{
        'id': e.id,
        'date': e.date.isoformat(),
        'category': e.category,
        'amount': e.amount
    } for e in expenses])

@app.route('/share_expenses', methods=['POST'])
@login_required
def share_expenses():
    data = request.get_json()
    recipient_id = data.get('recipient_id')
    expense_ids = data.get('expense_ids')
    
    if not recipient_id or not expense_ids:
        return jsonify(error='Recipient and expenses are required'), 400
    
    recipient = User.query.get(recipient_id)
    if not recipient or recipient.id == current_user.id:
        return jsonify(error='Invalid recipient'), 400
    
    shared_count = 0
    for expense_id in expense_ids:
        expense = Expense.query.get(expense_id)
        if expense and expense.user_id == current_user.id:
            shared_expense = SharedExpense(
                sharer_id=current_user.id,
                recipient_id=recipient_id,
                expense_id=expense_id
            )
            db.session.add(shared_expense)
            shared_count += 1
    
    try:
        db.session.commit()
        return jsonify(success=f'Shared {shared_count} expenses successfully')
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f'Error sharing expenses: {str(e)}'), 500

@app.route('/get_share_history', methods=['GET'])
@login_required
def get_share_history():
    # My shared expenses
    my_shared = SharedExpense.query.filter_by(sharer_id=current_user.id).all()
    my_shared_data = []
    for s in my_shared:
        expense = Expense.query.get(s.expense_id)
        if expense:  # Ensure expense exists
            my_shared_data.append({
                'shared_with': User.query.get(s.recipient_id).username or f"{User.query.get(s.recipient_id).first_name} {User.query.get(s.recipient_id).last_name}".strip(),
                'date': s.shared_date.isoformat(),
                'records': [{
                    'category': expense.category,
                    'amount': float(expense.amount),
                    'date': expense.date.isoformat()
                }]
            })

    # Expenses shared with me
    shared_with_me = SharedExpense.query.filter_by(recipient_id=current_user.id).all()
    shared_with_me_data = []
    for s in shared_with_me:
        expense = Expense.query.get(s.expense_id)
        if expense:  # Ensure expense exists
            shared_with_me_data.append({
                'shared_by': User.query.get(s.sharer_id).username or f"{User.query.get(s.sharer_id).first_name} {User.query.get(s.sharer_id).last_name}".strip(),
                'date': s.shared_date.isoformat(),
                'records': [{
                    'category': expense.category,
                    'amount': float(expense.amount),
                    'date': expense.date.isoformat()
                }]
            })

    return jsonify({
        'my_shared': my_shared_data,
        'shared_with_me': shared_with_me_data
    })

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404