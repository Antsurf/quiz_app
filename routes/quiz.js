// Handles quiz creation, retrieval, and management (longest part of code because need to handle each route 
// and handle all SQL queries)
// Instructors can create/edit quizzes, students can view available quizzes


const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET /api/quizzes
// Get all quizzes (available to all authenticated users)
router.get('/', verifyToken, (req, res) => {
    // Join quizzes with users table to get instructor name
    const query = `
        SELECT q.*, u.username as instructor_name,
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count
        FROM quizzes q
        JOIN users u ON q.instructor_id = u.id
        ORDER BY q.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching quizzes'
            });
        }

        res.json({
            success: true,
            quizzes: results
        });
    });
});

// GET /api/quizzes/:id
// Get specific quiz with its questions
router.get('/:id', verifyToken, (req, res) => {
    const quizId = req.params.id;

    // Get quiz details
    const quizQuery = `
        SELECT q.*, u.username as instructor_name
        FROM quizzes q
        JOIN users u ON q.instructor_id = u.id
        WHERE q.id = ?
    `;

    db.query(quizQuery, [quizId], (err, quizResults) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching quiz'
            });
        }

        if (quizResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Get questions for this quiz
        const questionsQuery = 'SELECT * FROM questions WHERE quiz_id = ?';
        db.query(questionsQuery, [quizId], (qErr, questions) => {
            if (qErr) {
                console.error('Database error:', qErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching questions'
                });
            }

            const quiz = quizResults[0];
            quiz.questions = questions;

            res.json({
                success: true,
                quiz: quiz
            });
        });
    });
});

// POST /api/quizzes
// Create a new quiz (instructors and admins only)
router.post('/', verifyToken, checkRole(['instructor', 'admin']), (req, res) => {
    const { title, description, questions } = req.body;
    const instructorId = req.user.id;

    // Validate input
    if (!title || !questions || questions.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Title and at least one question are required'
        });
    }

    // Insert quiz
    const insertQuizQuery = 'INSERT INTO quizzes (title, description, instructor_id) VALUES (?, ?, ?)';

    db.query(insertQuizQuery, [title, description, instructorId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error creating quiz'
            });
        }

        const quizId = result.insertId;

        // Insert questions
        const insertQuestionQuery = `
            INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        let completed = 0;
        let hasError = false;

        questions.forEach(q => {
            db.query(insertQuestionQuery,
                [quizId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer],
                (qErr) => {
                    if (qErr && !hasError) {
                        hasError = true;
                        console.error('Question insert error:', qErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Error adding questions'
                        });
                    }

                    completed++;

                    // All questions inserted successfully
                    if (completed === questions.length && !hasError) {
                        res.status(201).json({
                            success: true,
                            message: 'Quiz created successfully',
                            quizId: quizId
                        });
                    }
                }
            );
        });
    });
});

// POST /api/quizzes/:id/submit
// Submit quiz answers and calculate score
router.post('/:id/submit', verifyToken, (req, res) => {
    const quizId = req.params.id;
    const { answers } = req.body; // answers is an object: { questionId: selectedAnswer }
    const userId = req.user.id;

    // Get all questions with correct answers
    const query = 'SELECT id, correct_answer FROM questions WHERE quiz_id = ?';

    db.query(query, [quizId], (err, questions) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error processing submission'
            });
        }

        // Calculate score
        let score = 0;
        const totalQuestions = questions.length;

        questions.forEach(question => {
            const userAnswer = answers[question.id];
            if (userAnswer === question.correct_answer) {
                score++;
            }
        });

        // Save attempt to database
        const insertQuery = `
            INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions)
            VALUES (?, ?, ?, ?)
        `;

        db.query(insertQuery, [userId, quizId, score, totalQuestions], (insertErr) => {
            if (insertErr) {
                console.error('Database error:', insertErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error saving results'
                });
            }

            res.json({
                success: true,
                score: score,
                totalQuestions: totalQuestions,
                percentage: ((score / totalQuestions) * 100).toFixed(2)
            });
        });
    });
});

// GET /api/quizzes/:id/results
// Get user's previous attempts for a quiz
router.get('/:id/results', verifyToken, (req, res) => {
    const quizId = req.params.id;
    const userId = req.user.id;

    const query = `
        SELECT * FROM quiz_attempts
        WHERE quiz_id = ? AND user_id = ?
        ORDER BY completed_at DESC
    `;

    db.query(query, [quizId, userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching results'
            });
        }

        res.json({
            success: true,
            attempts: results
        });
    });
});

// DELETE /api/quizzes/:id
// Delete a quiz (instructors can only delete their own quizzes)
router.delete('/:id', verifyToken, checkRole(['instructor', 'admin']), (req, res) => {
    const quizId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if quiz belongs to user (unless admin)
    const checkQuery = 'SELECT instructor_id FROM quizzes WHERE id = ?';

    db.query(checkQuery, [quizId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error checking quiz ownership'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        const quiz = results[0];

        // Only allow deletion if user is admin or quiz creator

        if (userRole !== 'admin' && quiz.instructor_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own quizzes'
            });
        }

        // Delete quiz (questions will be deleted automatically due to CASCADE)
        const deleteQuery = 'DELETE FROM quizzes WHERE id = ?';

        db.query(deleteQuery, [quizId], (delErr) => {
            if (delErr) {
                console.error('Database error:', delErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting quiz'
                });
            }

            res.json({
                success: true,
                message: 'Quiz deleted successfully'
            });
        });
    });
});

// GET /api/quizzes/attempts/user
// Get all quiz attempts for the logged-in user
router.get('/attempts/user', verifyToken, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT qa.*, q.title as quiz_title
        FROM quiz_attempts qa
        JOIN quizzes q ON qa.quiz_id = q.id
        WHERE qa.user_id = ?
        ORDER BY qa.completed_at DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching attempts'
            });
        }

        res.json({
            success: true,
            attempts: results
        });
    });
});

// GET /api/quizzes/attempts/:id
// Get all quiz attempts for a precise quiz
router.get('/attempts/:id', verifyToken, checkRole(['instructor', 'admin']), (req, res) => {
    const quizId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;


    const checkQuery = 'SELECT instructor_id FROM quizzes WHERE id = ?'

    db.query(checkQuery, [quizId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error checking quiz ownership'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        const quiz = results[0];

        if (userRole !== 'admin' && quiz.instructor_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own quizzes'
            });
        }

        const getTitle = `Select title FROM quizzes WHERE id=?`;

        db.query(getTitle, [quizId], (err, results) => {
            if (err) {
                console.log('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching title'
                });
            }

            const fetchedTitle = results[0];


            const getAttempts = `
        SELECT qa.id, user_id, quiz_id, score, total_questions, completed_at, username as student_username  
        FROM quiz_attempts qa 
        JOIN users u ON qa.user_id = u.id 
        WHERE quiz_id = ?
        ORDER BY qa.completed_at DESC`;

            db.query(getAttempts, [quizId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error fetching attempts'
                    });
                }

                res.json({
                    success: true,
                    attempts: results,
                    title: fetchedTitle.title
                });

            });
        });

    });



});


module.exports = router;