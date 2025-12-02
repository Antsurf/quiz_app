// Database connection through mysql2
const mysql = require('mysql2');

// Create database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3307, // watchout depending on machine
    password: '',
    database: 'quiz_app',
});

// Connect to the database and handle error (possible error if happens, check port above, db name and password)
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL database successfully');
});

// export 
module.exports = db;