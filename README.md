# Smart Expense Tracker & Analyzer

## 📌 Purpose of the Application

The **Smart Expense Tracker & Analyzer** is a web application developed to help users manage their personal finances by logging expenses, viewing trends, and analyzing spending patterns across categories. Designed with an intuitive dashboard and interactive charts, the application enables users to:

- Add and manage daily expense records.
- View key performance indicators (KPIs) such as total and average spending.
- Filter and visualize expenses over time and by category through dynamic charts.
- Identify top spending categories for better financial decision-making.
- Share insights securely with others if desired.

The system is built with a modular design using **Flask** (Python), **SQLite**, **HTML/CSS/JavaScript**, and **Chart.js**. It follows best practices in user authentication, data storage, and client-server communication.

---

## External Libraries and Attribution

This project uses the following external libraries and resources:

- **SB Admin 2 Bootstrap Template**  
  - **Source:** [SB Admin 2 by Start Bootstrap](https://startbootstrap.com/theme/sb-admin-2)    
  - **Usage:** Used a customised version of this as the base layout and styling framework for our Flask web interface. HTML, CSS, and JS assets were adapted to suit our project needs.

- **Chart.js**  
  - **Source:** [Chart.js](https://www.chartjs.org/)    
  - **Usage:**  Used for rendering dynamic charts and visualizations in the dashboard.

- **DataTables jQuery Plugin**  
  - **Source:** [DataTables](https://datatables.net/)   
  - **Usage:** Integrated for enhanced table features like pagination, and live searching in the records tables.

- **Flask & Python Packages**  
  - **Source:** Listed in `requirements.txt`  
  - **Usage:** All third-party Python libraries (e.g., Flask, pandas) were installed via pip and are necessary to run the backend logic of the project.

---

## 👥 Masters_gc_Group_gc_6: Group Members 

| UWA ID       | Name                           | GitHub Username      |
|--------------|--------------------------------|----------------------|
| 24312467     | Maneesha Mudugamuwa Arachchi   | NishArc              |
| 24627403     | Nafisa Tabassum                | Nafisa42             |
| 24329992     | Umaama Tayyab Mohammad         | Umaama09             |
| 24026638     | Trung Pham                     | ptt0610              |

---

## 🚀 Project Setup

To launch the application locally:

1. Clone the Repository
    ```bash
    git clone https://github.com/ptt0610/CITS5505-Group-6-_-Smart-Expense-Tracker-Analyzer

2. Create python virtual environment
    ```bash
    python3 -m venv venv

3. Enable the virtual environment
    for linux/mac users:
    ``source venv/bin/activate``

    for windows users:
    ``venv\Scripts\activate``

    for powershell:
    ``venv\Scripts\Activate``

4. Install dependencies
    ``pip install -r requirements.txt``

5. Run ``python app.py`` and copy the IP address to a browser to run the app

6. (Optional) Initiate the database and migration folder- in case you want to create a new database different from the remaining one
   - Activate virtual environment
   - ``flask db init``
   - ``flask db migrate -m "Recreate migration for User, Expense, SharedExpense"``
   - ``flask db upgrade``

7. (Optional) You can use Sqlite Studio to view app.db and check all data with:
   ``SELECT * from user;``
   ``SELECT * from expense;`` 

---
## 📊 How to Use the Application

Follow these simple steps to get started with the Smart Expense Tracker & Analyzer:

1. Sign Up

- Create a personal account using your email and a secure password.
- Registration is quick and ensures your data is safely stored.

2. Log In

- Enter your credentials to securely access your personalized dashboard.
- Once logged in, you’ll be redirected to your dashboard.

3. Add Expenses

- Navigate to the "Add Expense" tab.
- Enter details such as amount, category, and date.
- Submit to log the transaction into your records.
- View all recorded data in "Expense Record" table.

4. View Dashboard Insights

- Go to the "Dashboard" to see:
    - Total Spending
    - Average Monthly Spending
    -Top Spending Category
    - Number of Transactions
    -Visual Charts: Expenses over time, pie/bar charts by category, top 5 category progress bars, etc.

- Use filters to refine chart results by category or date range.

5. Share Expenses

    Visit the "Share" tab.

- Select specific records that needs to be shared.
- Select user to share with
- Click on 'Share Selected' button

    Ideal for budgeting discussions with family or flatmates.

6. View Share History

    Navigate to the "View Share History" tab to track sharing activity:

- "My Shared Expenses" table shows:
    - People you’ve shared expenses with
    - Dates shared
    - Shared records

- "Expenses Shared With Me" table shows:
    - Who shared expenses with you
    - Dates received
    - Shared records

7. Manage Your Profile

    Under the "Profile" (top right) section, update account information or change your password.

8. Log Out

    End your session securely by logging out from the top navigation menu.

---

## 🧪 Running the Tests

This project uses Unit Testing for testing the backend logic and System Testing for testing the full user experience in the browser.
> 💡 **Note:** Before running the tests, make sure:
> - The Flask application is running ( ``python app.py`` )
> - In a different terminal where you run the tests, Python virtual environment is activated ( ``venv\Scripts\activate`` )

### 🧪 Unit Tests

The Unit Tests validate the core backend functionality, including user authentication, expense processing, and data validation in routes.py. They mock dependencies like database interactions and external APIs (e.g., email validation) to isolate and test individual functions without relying on the Flask server or real data. This ensures robust testing of business logic, such as signup, login, and profile updates, in a controlled environment.

``python -m unittest tests/test_app.py``

### 🧪 Selenium Tests

The System testing is done through **end-to-end Selenium tests**, that will simulate real user interactions to verify key flows such as signup, login, form validation, page redirection, dashboard filtering, record management, sharing, and profile updates.


To run the tests:

``python -m unittest tests/seleniumTests.py``

