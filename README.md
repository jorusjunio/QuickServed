# 🍽️ QuickServed: Fast Food Order Manager
Hey there! Welcome to the QuickServed project. This is a full-stack (think HTML/JS/Node.js/MySQL) app that simulates how a real fast-food joint handles orders, especially focusing on how we use cool Data Structures and Algorithms (DSA) to make everything super quick and efficient!

📌 Tech Stack
- We used a mix of technologies to build this: 
- Frontend: HTML, CSS, and Vanilla JavaScript
- Backend: Node.js (with the Express framework)
- Database: MySQL (Where all the magic happens)
- The Brains (DSA): Implemented in both JavaScript and MySQL queries.

---

```🚀 Quick Setup Guide (Get Running in 5 Minutes!)
Want to run this project on your machine? No problem! Just follow these easy steps.

### **Step 1:** Grab the Code
Open up your Terminal or Command Prompt and clone the repository:

_git clone [YOUR GITHUB REPO LINK GOES HERE]
cd quickserved-project_

###**Step 2:** Database Setup (The MySQL Part)
This is the most important part—we need to build the database.

**A. Import the Schema**

1. Open your MySQL Workbench or whatever database tool you use.
2. Create a new database named quickserved_db:

``_CREATE DATABASE quickserved_db;_``

3. Find the quickserved_db.sql file in the project folder and import it into the quickserved_db database. This sets up all the tables (like orders and menu_items) and adds the default menu items.

**B. Update Your Login Info**

Open the server.js file.
You must change the database login details to match your own MySQL username and password.

// server.js (Around Line 10-15)

_const db = mysql.createConnection
({
    host: 'localhost',
    user: 'root', // <-- CHANGE THIS TO YOUR MYSQL USERNAME
    password: '', // <-- CHANGE THIS TO YOUR MYSQL PASSWORD
    database: 'quickserved_db'
});_

### **Step 3: Run the Backend**
1. First, install all the necessary Node.js packages:
``_npm install_``
2. Then, start the server!
``_node server.js_``

You should see: ``_🟢 Connected to MySQL Workbench DB. and 🚀 Server running on http://localhost:3000_``

### **Step 4: Launch the App**
1. Open your favorite web browser (like Chrome).
2. Just drag and drop the landingPage.html file into the browser window.
3. Start ordering and see the magic happen!
