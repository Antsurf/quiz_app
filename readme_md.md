# Quiz Assessment Platform

## 📚 Project Overview

An Interactive Quiz Assessment Web Application built with **Node.js**, **Express.js**, **Vue.js** (CDN), **Pug**, and **MySQL**. This project demonstrates full-stack web development following the course materials from Advanced Web Programming (CX010-2.5-3-AWP).

### Key Features
- ✅ User authentication with JWT and bcrypt
- ✅ Role-based access control (Student, Instructor, Admin)
- ✅ CRUD operations for quizzes and questions
- ✅ Interactive quiz-taking interface
- ✅ Instant score calculation and feedback
- ✅ Responsive design for multiple devices
- ✅ RESTful API architecture

---

## 🛠️ Technology Stack

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MySQL**: Relational database
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT authentication
- **Pug**: Server-side template engine

### Frontend
- **Vue.js 3** (CDN version): Progressive JavaScript framework
- **Vanilla CSS**: Custom responsive styling
- **No build tools required** (as per course materials)

---

## 📁 Project Structure

```
quiz-app/
├── server.js                  # Main Express server
├── package.json               # Dependencies
├── config/
│   └── db.js                 # MySQL configuration
├── middleware/
│   └── auth.js               # JWT authentication middleware
├── routes/
│   ├── auth.js               # Authentication routes
│   └── quiz.js               # Quiz CRUD routes
├── views/
│   ├── layout.pug            # Base template
│   ├── index.pug             # Landing page
│   ├── login.pug             # Login form
│   ├── register.pug          # Registration form
│   ├── dashboard.pug         # User dashboard
│   ├── create-quiz.pug       # Quiz creation
│   └── take-quiz.pug         # Quiz taking interface
└── public/
    └── css/
        └── style.css         # Stylesheet
```

---

## 🚀 Installation & Setup

### Prerequisites
1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MySQL** - Install via XAMPP or WAMP
3. **Text editor** - VS Code recommended

### Step 1: Database Setup

Open MySQL (via phpMyAdmin or command line) and execute:

```sql
CREATE DATABASE quiz_app;
USE quiz_app;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes table
CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- Questions table
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_answer CHAR(1) NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);
```

### Step 2: Project Installation

```bash
# Create project directory
mkdir quiz-app
cd quiz-app

# Initialize npm
npm init -y

# Install dependencies
npm install express mysql2 body-parser bcrypt jsonwebtoken pug cors

# Optional: Install nodemon for development
npm install --save-dev nodemon
```

### Step 3: Configure Database Connection

Edit `config/db.js` and update MySQL credentials:

```javascript
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',              // Your MySQL username
    port: ,                    // Your MySQL port (if needed)
    password: '',              // Your MySQL password
    database: 'quiz_app'
});
```

### Step 4: Create Project Files

Create all the files provided in the artifacts above:
- Copy `server.js`, `config/db.js`, `middleware/auth.js`
- Copy all route files (`routes/auth.js`, `routes/quiz.js`)
- Copy all Pug templates into `views/` folder
- Copy CSS file into `public/css/` folder

### Step 5: Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

---

## 📖 Usage Guide

### 1. Registration
- Navigate to `http://localhost:3000/register`
- Fill in username, email, password
- Select role (Student or Instructor)
- Click "Register"

### 2. Login
- Navigate to `http://localhost:3000/login`
- Enter email and password
- Click "Login"
- You'll be redirected to the dashboard

### 3. Creating a Quiz (Instructors Only)
- Login as an instructor
- Click "Create New Quiz" on dashboard
- Enter quiz title and description
- Add questions with 4 options each
- Select correct answer for each question
- Click "Create Quiz"

### 4. Taking a Quiz (Students)
- Login as a student
- Browse available quizzes on dashboard
- Click "Take Quiz"
- Answer all questions
- Navigate with "Previous" and "Next" buttons
- Click "Submit Quiz" when done
- View your results instantly

### 5. Managing Quizzes
- **Instructors**: Can delete their own quizzes
- **Admins**: Can delete any quiz
- Click "Delete" button on quiz card

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT)

### Quizzes
- `GET /api/quizzes` - Get all quizzes (requires auth)
- `GET /api/quizzes/:id` - Get specific quiz with questions
- `POST /api/quizzes` - Create new quiz (instructor/admin only)
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `DELETE /api/quizzes/:id` - Delete quiz (instructor/admin)

### Example API Usage

```javascript
// Register user
fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student'
    })
});

// Login
fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123'
    })
});

// Get quizzes (with auth token)
fetch('http://localhost:3000/api/quizzes', {
    headers: {
        'Authorization': 'Bearer ' + token
    }
});
```

---

## 🔒 Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Authentication**: 24-hour token expiration
3. **Role-based Access Control**: Middleware checks user roles
4. **SQL Injection Prevention**: Parameterized queries
5. **Client-side Token Storage**: localStorage (for demonstration)

---

## 📱 Responsive Design

The application is fully responsive and works on:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

---

## 🎓 Learning Objectives Met

Based on assignment requirements (2025_C_1.PDF):

✅ **Develop a web interface with multiple pages**
- Landing, Login, Register, Dashboard, Create Quiz, Take Quiz pages

✅ **Create a web server with API**
- RESTful API with Express.js

✅ **Establish SQL database communication**
- MySQL integration with CRUD operations

✅ **Authenticate users with security mechanisms**
- JWT + bcrypt implementation

✅ **Single Page Application features**
- Vue.js for reactive interfaces

✅ **Good UI/UX design**
- Responsive, user-friendly interface

✅ **Form validation**
- Client and server-side validation

✅ **Multiple user types**
- Student, Instructor, Admin roles

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: ER_ACCESS_DENIED_ERROR
```
**Solution**: Check MySQL credentials in `config/db.js`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Kill process using port 3000 or change PORT in `server.js`

### Token Not Found
```
Error: Access denied. No token provided.
```
**Solution**: Ensure you're logged in and token is stored in localStorage

---

## 📝 Course Materials Reference

This project is based on the following course slides:

- **03INTR~1.PDF**: Vue.js basics (directives, components, reactivity)
- **04INTR~1.PDF**: Node.js, Express.js, and Pug
- **05INTR~1.PDF**: Web servers and asynchronous communication
- **06INTR~1.PDF**: Database introduction and ERD
- **07 Intro. to SQL.pdf**: SQL queries and operations
- **10NODE~1.PDF**: JWT authentication
- **11NODE~1.PDF**: Password hashing with bcrypt
- **12NODE~1.PDF**: Node.js Express User Management System
- **13NODE~1.PDF**: User registration with MySQL

---

## 🚧 Future Enhancements

Potential improvements for the project:

- [ ] Add quiz categories/tags
- [ ] Implement quiz timer
- [ ] Add image support for questions
- [ ] Create detailed analytics dashboard
- [ ] Add user profile management
- [ ] Implement quiz sharing features
- [ ] Add email verification
- [ ] Create mobile app version

---

## 👥 User Roles & Permissions

| Feature | Student | Instructor | Admin |
|---------|---------|-----------|-------|
| Register/Login | ✅ | ✅ | ✅ |
| View Quizzes | ✅ | ✅ | ✅ |
| Take Quizzes | ✅ | ❌ | ❌ |
| Create Quizzes | ❌ | ✅ | ✅ |
| Delete Own Quizzes | ❌ | ✅ | ✅ |
| Delete Any Quiz | ❌ | ❌ | ✅ |

---

## 📄 License

This project is created for educational purposes as part of the Advanced Web Programming course at Asia Pacific University.

---

## 👨‍💻 Author

**Your Name**  
Intake Code: XXXX  
Subject: CX010-2.5-3-AWP Advanced Web Programming  
Asia Pacific University of Technology and Innovation

---

## 🙏 Acknowledgments

- Course instructors for comprehensive materials
- Vue.js documentation
- Express.js documentation
- MySQL documentation
- Node.js community

---

**Last Updated**: November 2024
