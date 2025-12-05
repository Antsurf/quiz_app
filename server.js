// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');

// Create Express application
const app = express();
const PORT = 3000;

// ======================
// MIDDLEWARE SETUP
// ======================

// Enable CORS for cross-origin requests (allows frontend to communicate with backend goated)
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// Parse URL-encoded request bodies (for form submissions)
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

// Set Pug as the view engine for server-side rendering
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ======================
// API ROUTES
// ======================

// Authentication routes (register, login)
app.use('/api/auth', authRoutes);

// Quiz routes (create, read, submit, delete)
app.use('/api/quizzes', quizRoutes);

// ======================
// PAGE ROUTES (Server-Side)
// ======================

// Home/Landing page
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Quiz Assessment Platform',
        message: 'Welcome to the Interactive Quiz System'
    });
});

// Login page
app.get('/login', (req, res) => {
    res.render('login', { 
        title: 'Login'
    });
});

// Registration page
app.get('/register', (req, res) => {
    res.render('register', { 
        title: 'Register'
    });
});

// Dashboard page (requires authentication on client-side)
app.get('/dashboard', (req, res) => {
    res.render('dashboard', { 
        title: 'Dashboard'
    });
});

// Create quiz page (for instructors)
app.get('/create-quiz', (req, res) => {
    res.render('create-quiz', { 
        title: 'Create Quiz'
    });
});

app.get('/quiz-logs', (req, res) =>{
    res.render('quiz-logs', {
        title: 'logs'
    });
});

// Take quiz page
app.get('/take-quiz/:id', (req, res) => {
    res.render('take-quiz', { 
        title: 'Take Quiz',
        quizId: req.params.id
    });
});

// Results page
app.get('/results', (req, res) => {
    res.render('results', { 
        title: 'Quiz Results'
    });
});

app.get('/edit-quiz', (req, res) =>{
    res.render('edit-quiz', {
        title: "edit"
    });
});

// ======================
// ERROR HANDLING
// ======================

// 404 handler - catch all unmatched routes
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

// ======================
// START SERVER
// ======================

app.listen(PORT, () => {
    console.log('Quiz Application Server');
    console.log(`Server running on http://localhost:${PORT}`);
});