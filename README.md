# CITS5505-Group-6-_-Smart-Expense-Tracker-Analyzer
Bulding an app for Smart Expense Tracker &amp; Analyzer


## Project Setup

1. Create python virtual environment
    ``python3 -m venv venv``

2. Enable the virtual environment
    for linux/mac users:
    ``source venv/bin/activate``

    for windows users:
    ``venv\Scripts\activate.bat``

    for powershell:
    ``venv\Scripts\Activate.ps1``

3. Install dependencies
    ``pip install -r requirements.txt``
4. Run ``app.py`` and copy the IP address to a browser to run the app
5. (Optional) Initiate the database and migration folder- in case you want to create a new database different from the remaining one
   - Activate virtual environment
   - ``flask db init``
   - ``flask db migrate -m "Recreate migration for User, Expense, SharedExpense"``
   - ``flask db upgrade``
6. You can use Sqlite Studio to view app.db and check all data with:
   ``SELECT * from user;``
   ``SELECT * from expense;`` 
   
