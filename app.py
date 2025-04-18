from flask import Flask, render_template
from flask import request

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/records', methods=['GET', 'POST'])
def records():
    if request.method == 'POST':
        # grab and process form data here
        amount = request.form.get('amount')
        category = request.form.get('category')
        date = request.form.get('date')
        # TODO: Save to DB
        print(amount, category, date)
    return render_template('records.html')


@app.route('/share')
def share():
    return render_template('share.html')

@app.route('/shared_with_me')
def shared_with_me():
    return render_template('shared_with_me.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)
