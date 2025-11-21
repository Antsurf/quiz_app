// Handles user registration and login

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { SECRET_KEY } = require('../middleware/auth');

// Number of salt rounds for bcrypt hashing
// Higher number = more secure but slower
const SALT_ROUNDS = 10;

// POST /api/auth/register
// Register a new user
router.post('/register', (req, res) => {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }

    // Check if user already exists
    const checkQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
    db.query(checkQuery, [email, username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Server error' 
            });
        }

        if (results.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'User already exists' 
            });
        }

        // Hash the password using bcrypt
        bcrypt.hash(password, SALT_ROUNDS, (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error('Hashing error:', hashErr);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error processing password' 
                });
            }

            // Insert new user into database
            const insertQuery = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
            const userRole = role || 'student'; // Default to student if no role provided

            db.query(insertQuery, [username, email, hashedPassword, userRole], (insertErr, result) => {
                if (insertErr) {
                    console.error('Insert error:', insertErr);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error creating user' 
                    });
                }

                res.status(201).json({ 
                    success: true, 
                    message: 'User registered successfully',
                    userId: result.insertId
                });
            });
        });
    });
});

// POST /api/auth/login
// Authenticate user and return JWT token
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email and password are required' 
        });
    }

    // Find user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Server error' 
            });
        }

        if (results.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        const user = results[0];

        // Compare provided password with hashed password using bcrypt
        bcrypt.compare(password, user.password, (compareErr, isMatch) => {
            if (compareErr) {
                console.error('Comparison error:', compareErr);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error verifying password' 
                });
            }

            if (!isMatch) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid credentials' 
                });
            }

            // Create JWT token with user information
            const payload = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            };

            // Sign token with 24-hour expiration
            const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });

            res.json({ 
                success: true, 
                message: 'Login successful',
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        });
    });
});

module.exports = router;