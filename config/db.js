// config/db.js
// This file manages the MySQL database connection using createConnection

const mysql = require('mysql2');

// Create a single database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3307,
    password: '',
    database: 'quiz_app',
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL database successfully');
});

module.exports = db;
