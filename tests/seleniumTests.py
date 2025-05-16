import unittest, uuid
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

BASE_URL = "http://127.0.0.1:5000" 

class SmartExpenseSeleniumTests(unittest.TestCase):
    """End-to-end Selenium tests for Smart Expense Tracker."""

    def setUp(self):
        opts = Options()
        opts.add_argument("--headless=new")  # comment out to see browser
        self.driver = webdriver.Chrome(options=opts)
        self.wait = WebDriverWait(self.driver, 8)

    def tearDown(self):
        self.driver.quit()

    def _unique_email(self) -> str:
        return f"selenium_{uuid.uuid4().hex[:8]}@example.com"

    def _flash_text(self) -> str:
        try:
            alert = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".alert")))
            return alert.text.strip()
        except Exception:
            return ""

    
    # Signup Tests
    def test_signup_success(self):
        email = self._unique_email()
        self.driver.get(f"{BASE_URL}/signup")

        self.driver.find_element(By.NAME, "first_name").send_keys("Test")
        self.driver.find_element(By.NAME, "last_name").send_keys("User")
        self.driver.find_element(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "password").send_keys("MyPass1!")
        try:
            self.driver.find_element(By.NAME, "repeat_password").send_keys("MyPass1!")
        except:
            pass
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

        self.wait.until(EC.url_contains("/login"))
        self.assertIn("/login", self.driver.current_url)
        self.assertIn("registration successful", self._flash_text().lower())

    def test_signup_invalid_email_format(self):
        # NOTE: This form uses HTML5 email format validation.
        # If the email format is invalid, the form is not submitted and no request is sent to the server.

        self.driver.get(f"{BASE_URL}/signup")

        self.driver.find_element(By.NAME, "first_name").send_keys("Invalid")
        self.driver.find_element(By.NAME, "last_name").send_keys("Email")
        self.driver.find_element(By.NAME, "email").send_keys("invalid_email@domain")  # missing .com
        self.driver.find_element(By.NAME, "password").send_keys("MyPass1!")
        try:
            self.driver.find_element(By.NAME, "repeat_password").send_keys("MyPass1!")
        except:
            pass

        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

        # Wait briefly to see if alert appears
        try:
            alert = self.driver.switch_to.alert
            alert_text = alert.text.strip().lower()
            alert.accept()
            self.assertIn("valid email", alert_text)
        except:
            self.fail("Expected alert for invalid email was not shown.")    

    def test_signup_duplicate_email(self):
        email = self._unique_email()

        self.driver.get(f"{BASE_URL}/signup")
        for name, val in [("first_name", "Dup"), ("last_name", "User"), ("email", email), ("password", "MyPass1!")]:
            self.driver.find_element(By.NAME, name).send_keys(val)
        try:
            self.driver.find_element(By.NAME, "repeat_password").send_keys("MyPass1!")
        except:
            pass
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        self.wait.until(EC.url_contains("/login"))

        self.driver.get(f"{BASE_URL}/signup")
        self.driver.find_element(By.NAME, "first_name").send_keys("Dup")
        self.driver.find_element(By.NAME, "last_name").send_keys("User")
        self.driver.find_element(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "password").send_keys("MyPass1!")
        try:
            self.driver.find_element(By.NAME, "repeat_password").send_keys("MyPass1!")
        except:
            pass
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

        self.wait.until(EC.url_contains("/signup"))
        self.assertIn("/signup", self.driver.current_url)
        self.assertIn("already registered", self._flash_text().lower())

    def test_signup_invalid_pwd(self):
        # NOTE: This form uses HTML5 pattern validation for password complexity.
        # Invalid passwords are rejected by the browser before submitting, so we only check that the page does not navigate.

        email = self._unique_email()
        self.driver.get(f"{BASE_URL}/signup")

        self.driver.find_element(By.NAME, "first_name").send_keys("Weak")
        self.driver.find_element(By.NAME, "last_name").send_keys("Password")
        self.driver.find_element(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "password").send_keys("weakpass")  # invalid password
        try:
            self.driver.find_element(By.NAME, "repeat_password").send_keys("weakpass")
        except:
            pass

        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

        # Wait briefly to see if alert appears
        try:
            alert = self.driver.switch_to.alert
            alert_text = alert.text.strip().lower()
            alert.accept()
            self.assertIn("password", alert_text)
        except:
            self.fail("Expected alert for weak password was not shown.")

    def test_signup_pwd_mismatch(self):
        # NOTE: This form uses HTML5 pattern validation for password complexity.
        # Invalid passwords are rejected by the browser before submitting, so we only check that the page does not navigate.

        email = self._unique_email()
        self.driver.get(f"{BASE_URL}/signup")

        self.driver.find_element(By.NAME, "first_name").send_keys("Mismatch")
        self.driver.find_element(By.NAME, "last_name").send_keys("Password")
        self.driver.find_element(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "password").send_keys("MyPass1!")
        try:
            self.driver.find_element(By.NAME, "repeat_password").send_keys("DifferentPass1!")  # different password
        except:
            pass

        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

        # Wait briefly to see if alert appears
        try:
            alert = self.driver.switch_to.alert
            alert_text = alert.text.strip().lower()
            alert.accept()
            self.assertIn("passwords do not match", alert_text)
        except:
            self.fail("Expected alert for password mismatch was not shown.")

    def test_signup_missing_fields(self):
        # NOTE: This form uses HTML5 'required' validation.
        # No POST is sent when fields are empty, so we assert that the page does not change.

        self.driver.get(f"{BASE_URL}/signup")
        current_url = self.driver.current_url

        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        self.wait.until(EC.url_contains("/signup"))
        self.assertEqual(self.driver.current_url, current_url)

    
    # Login Tests
    def test_login_success(self):
        email = self._unique_email()

        self.driver.get(f"{BASE_URL}/signup")
        for name, val in [("first_name", "Login"), ("last_name", "User"), ("email", email), ("password", "MyPass1!")]:
            self.driver.find_element(By.NAME, name).send_keys(val)
        try:
            self.driver.find_element(By.NAME, "repeat_password").send_keys("MyPass1!")
        except:
            pass
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        self.wait.until(EC.url_contains("/login"))

        self.driver.find_element(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "password").send_keys("MyPass1!")
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

        self.wait.until(EC.url_contains("/dashboard"))
        self.assertIn("/dashboard", self.driver.current_url)

    def test_login_invalid_pwd(self):
        # NOTE: This form uses HTML5 pattern validation for password complexity.
        # Invalid passwords are rejected by the browser before submitting, so we only check that the page does not navigate.

        email = self._unique_email()

        self.driver.get(f"{BASE_URL}/signup")
        for name, val in [("first_name", "Bad"), ("last_name", "Pass"), ("email", email), ("password", "MyPass1!")]:
            self.driver.find_element(By.NAME, name).send_keys(val)
        try:
            self.driver.find_element(By.NAME, "repeat_password").send_keys("MyPass1!")
        except:
            pass
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        self.wait.until(EC.url_contains("/login"))

        self.driver.find_element(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "password").send_keys("WrongPass1!")
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

        # Wait briefly to see if alert appears
        self.wait.until(EC.url_contains("/login"))
        self.assertIn("/login", self.driver.current_url)
    
    def test_login_invalid_email(self):
        # NOTE: This form uses HTML5 email format validation.
        # If the email format is invalid, the form is not submitted and no request is sent to the server.

        self.driver.get(f"{BASE_URL}/login")
        current_url = self.driver.current_url

        self.driver.find_element(By.NAME, "email").send_keys("invalid_email@domain")  # invalid email
        self.driver.find_element(By.NAME, "password").send_keys("MyPass1!")
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        # Wait briefly to see if alert appears
        self.wait.until(EC.url_contains("/login"))
        self.assertEqual(self.driver.current_url, current_url)
    
    def test_login_invalid_email_not_registered(self):
        # NOTE: This form uses HTML5 email format validation.
        # If the email format is invalid, the form is not submitted and no request is sent to the server.

        email = self._unique_email()

        self.driver.get(f"{BASE_URL}/login")
        current_url = self.driver.current_url

        self.driver.find_element(By.NAME, "email").send_keys(email)  # invalid email
        self.driver.find_element(By.NAME, "password").send_keys("MyPass1!")
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        # Wait briefly to see if alert appears
        self.wait.until(EC.url_contains("/login"))
        self.assertIn("/login", self.driver.current_url)


    def test_login_invalid_email_format(self):
        # NOTE: This form uses HTML5 email format validation.
        # If the email format is invalid, the form is not submitted and no request is sent to the server.

        self.driver.get(f"{BASE_URL}/login")
        current_url = self.driver.current_url

        self.driver.find_element(By.NAME, "email").send_keys("invalid_email@domain")  # invalid email
        self.driver.find_element(By.NAME, "password").send_keys("MyPass1!")
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

        # Wait briefly to see if alert appears
        self.wait.until(EC.url_contains("/login"))
        self.assertEqual(self.driver.current_url, current_url)

    def test_login_missing_fields(self):
        # NOTE: This form uses HTML5 'required' validation.
        # No POST is sent when fields are empty, so we assert that the page does not change.

        self.driver.get(f"{BASE_URL}/login")
        current_url = self.driver.current_url

        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        self.wait.until(EC.url_contains("/login"))
        self.assertEqual(self.driver.current_url, current_url)



    #Dashboard Tests
    def test_dashboard_view(self):
        email = self._unique_email()

        self.driver.get(f"{BASE_URL}/signup")
        for name, val in [("first_name", "Dashboard"), ("last_name", "User"), ("email", email), ("password", "MyPass1!")]:
            self.driver.find_element(By.NAME, name).send_keys(val)
        try:
            self.driver.find_element(By.NAME, "repeat_password").send_keys("MyPass1!")
        except:
            pass
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        self.wait.until(EC.url_contains("/login"))

        self.driver.find_element(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "password").send_keys("MyPass1!")
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

        self.wait.until(EC.url_contains("/dashboard"))
        self.assertIn("/dashboard", self.driver.current_url)
        self.assertIn("dashboard", self.driver.page_source.lower())
    
    def test_dashboard_logout(self):
        email = self._unique_email()

        self.driver.get(f"{BASE_URL}/signup")
        for name, val in [("first_name", "Logout"), ("last_name", "User"), ("email", email), ("password", "MyPass1!")]:
            self.driver.find_element(By.NAME, name).send_keys(val)
        try:
            self.driver.find_element(By.NAME, "repeat_password").send_keys("MyPass1!")
        except:
            pass
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        self.wait.until(EC.url_contains("/login"))

        self.driver.find_element(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "password").send_keys("MyPass1!")
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

        self.wait.until(EC.url_contains("/dashboard"))
        self.assertIn("/dashboard", self.driver.current_url)

        # Click logout button
        self.driver.find_element(By.LINK_TEXT, "Logout").click()
        self.wait.until(EC.url_contains("/login"))
        self.assertIn("/login", self.driver.current_url)
    
    def test_persistent_records_reflected_in_dashboard(self):
        email = self._unique_email()

        # Step 1: Register and login
        self.driver.get(f"{BASE_URL}/signup")
        for name, val in [("first_name", "Persistent"), ("last_name", "User"), ("email", email), ("password", "MyPass1!")]:
            self.driver.find_element(By.NAME, name).send_keys(val)
        try:
            self.driver.find_element(By.NAME, "repeat_password").send_keys("MyPass1!")
        except:
            pass
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        self.wait.until(EC.url_contains("/login"))

        self.driver.find_element(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "password").send_keys("MyPass1!")
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        self.wait.until(EC.url_contains("/dashboard"))

        # Step 2: Go to Records page and add a record
        self.driver.find_element(By.LINK_TEXT, "Records").click()
        self.wait.until(EC.url_contains("/records"))

        # Fill in record form 
        self.driver.find_element(By.NAME, "amount").send_keys("123")
        Select(self.driver.find_element(By.NAME, "category")).select_by_visible_text("Food")
        self.driver.find_element(By.NAME, "date").send_keys("2024-05-17")

        # Step 3: Go to dashboard and confirm the transaction is reflected
        self.driver.find_element(By.LINK_TEXT, "Dashboard").click()
        self.wait.until(EC.url_contains("/dashboard"))
        self.assertIn("food", self.driver.page_source.lower())
        self.assertIn("123", self.driver.page_source)

        # Step 4: Log out
        self.driver.find_element(By.LINK_TEXT, "Logout").click()
        self.wait.until(EC.url_contains("/login"))

        # Step 5: Log back in
        self.driver.find_element(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "password").send_keys("MyPass1!")
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        self.wait.until(EC.url_contains("/dashboard"))

        # Step 6: Confirm record still shows up
        self.assertIn("food", self.driver.page_source.lower())
        self.assertIn("123", self.driver.page_source)

    def test_dashboard_filter_by_category(self):
        email = self._unique_email()

        # Step 1: Sign up and log in
        self.driver.get(f"{BASE_URL}/signup")
        for name, val in [("first_name", "Filter"), ("last_name", "User"), ("email", email), ("password", "MyPass1!")]:
            self.driver.find_element(By.NAME, name).send_keys(val)
        try:
            self.driver.find_element(By.NAME, "repeat_password").send_keys("MyPass1!")
        except:
            pass
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        self.wait.until(EC.url_contains("/login"))

        self.driver.find_element(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "password").send_keys("MyPass1!")
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        self.wait.until(EC.url_contains("/dashboard"))

        # Step 2: Go to Records and add two entries: Food and Travel
        self.driver.find_element(By.LINK_TEXT, "Records").click()
        self.wait.until(EC.url_contains("/records"))

        # Add a Food record
        self.driver.find_element(By.NAME, "amount").send_keys("100")
        Select(self.driver.find_element(By.NAME, "category")).select_by_visible_text("Food")
        self.driver.find_element(By.NAME, "date").send_keys("2024-05-17")
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

        # Add a Travel record
        self.driver.find_element(By.NAME, "amount").clear()
        self.driver.find_element(By.NAME, "amount").send_keys("250")
        Select(self.driver.find_element(By.NAME, "category")).select_by_visible_text("Travel")
        self.driver.find_element(By.NAME, "date").clear()
        self.driver.find_element(By.NAME, "date").send_keys("2024-05-17")
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

        # Step 3: Go back to Dashboard
        self.driver.find_element(By.LINK_TEXT, "Dashboard").click()
        self.wait.until(EC.url_contains("/dashboard"))

        # Step 4: Apply category filter: Food
        Select(self.driver.find_element(By.NAME, "category")).select_by_visible_text("Food")
        self.driver.find_element(By.XPATH, "//button[contains(text(), 'Apply Filters')]").click()

        # Step 5: Validate only Food record is shown
        self.wait.until(EC.presence_of_element_located((By.ID, "spending-chart")))
        page_text = self.driver.page_source.lower()
        self.assertIn("food", page_text)
        self.assertIn("100", page_text)
        self.assertNotIn("250", page_text)
        self.assertNotIn("travel", page_text)


    
if __name__ == "__main__":
    unittest.main()










	
