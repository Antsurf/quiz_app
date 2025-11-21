// config/db.js
// This file manages the MySQL database connection
// Based on slides 12NODE~1.PDF (Node.js Express: User Management System)

const mysql = require('mysql2');

// Create database connection pool for better performance
// Connection pool allows multiple simultaneous database operations
const db = mysql.createPool({
    host: 'localhost',           // Database server location
    user: 'root',                // MySQL username (default for XAMPP/WAMP)
    port: 3307,                  // Port should be changed based on XAMPP or MySQL setup
    password: '',                // MySQL password (empty for local development)
    database: 'quiz_app',        // Database name we created

});

// Test the database connection when module is loaded
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL database successfully');
    connection.release(); // Return connection to pool
});

// Export the database connection for use in other files
module.exports = db;