from app import app  # Import app instance from _init_.py
from app.routes import *  # Import all route functions from routes.py

# Run the app
if __name__ == '__main__':
    app.run(debug=True)