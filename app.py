from flask import Flask
from flask import request, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/records')
def records():
    return render_template('records.html')


@app.route('/save_records', methods=['POST'])
def save_records():
    # grab and process form data here
    record_id = request.json['record_id']
    amount = request.json['amount']
    category = request.json['category']
    date = request.json['date']

    # TODO: Save to DB

    if record_id != "":  # Edit mode
        # TODO: Find record by ID and update it
        print(f"[UPDATE] ID: {record_id} | Amount: {amount}, Category: {category}, Date: {date}")
        return jsonify({
        'success': 'Updated Successfully'
    })
    else:  # New record
        # TODO: Save as new record
        print(f"[NEW] Amount: {amount}, Category: {category}, Date: {date}")
        return jsonify({
        'success': 'Saved Successfully'
    })


@app.route('/delete_record', methods=['POST'])
def delete_record():

    record_id = request.json['record_id']

    # TODO: Find the record by ID and delete it from the database
    print(f"[DELETE] ID: {record_id}")

    return jsonify({
        'success': 'Deleted Successfully'
    })
    # logic to delete from DB


@app.route('/share')
def share():
    return render_template('share.html')

@app.route('/share_history')
def share_history():
    return render_template('share_history.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)
