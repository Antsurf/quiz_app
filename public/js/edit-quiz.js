// Handles question management (linked to create-quiz.pug)

// const { response } = require("express");

const { createApp } = Vue;

createApp({
    data() {
        return {
            quizData: {
                title: '',
                description: '',
                questions: null
            },
            quizID: null,
            loading: false,
            alert: {
                show: false,
                type: '',
                message: ''
            }
        };
    },
    methods: {
        // Show alert message
        showAlert(type, message) {
            this.alert = { show: true, type, message };
            setTimeout(() => {
                this.alert.show = false;
            }, 5000);
        },

        loadQuestions() {

            const token = localStorage.getItem('token');

            if (!token) {
                window.location.href = '/login';
                return;
            }
            fetch('http://localhost:3000/api/quizzes/' + this.quizID, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.loading = false;

                    if (data.success) {
                        this.quizData = data.quiz;

                    } else {
                        alert(data.message);
                        window.location.href = "/dashboard";
                    }
                })
                .catch(error => {
                    this.loading = false;
                    console.error('Error:', error);
                    alert('Failed to load quiz');
                });

        },

        // Add new question to the quiz (see if more or less question, tryed using array
        // way harder so FF)
        addQuestion() {
            this.quizData.questions.push({
                question_text: '',
                option_a: '',
                option_b: '',
                option_c: '',
                option_d: '',
                correct_answer: ''
            });
        },

        // Remove question from quiz
        removeQuestion(index) {
            if (this.quizData.questions.length > 1) {
                // splice change content of array
                this.quizData.questions.splice(index, 1);
            }
        },

        // Submit quiz data
        handleSubmit() {
            // Validate that all questions have correct answers
            const allValid = this.quizData.questions.every(q => q.correct_answer);

            // check for all questions good and completed
            if (!allValid) {
                this.showAlert('error', 'Please select correct answer for all questions');
                return;
            }

            this.loading = true;
            const token = localStorage.getItem('token');

            // if not logged in or should not be here
            if (!token) {
                window.location.href = '/login';
                return;
            }

            // post method, verified using postman (it works)
            fetch('http://localhost:3000/api/quizzes/edit/' + this.quizID, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(this.quizData)
            })
                .then(response => response.json())
                .then(data => {
                    this.loading = false;

                    if (data.success) {
                        this.showAlert('success', 'Quiz edited successfully! Redirecting to Dashboard.');
                        // confirmation + redirecting
                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 2000);
                        // if problem in submission, error message
                    } else {
                        this.showAlert('error', data.message);
                    }
                })
                .catch(error => {
                    this.loading = false;
                    console.error('Error:', error);
                    this.showAlert('error', 'Failed to create quiz');
                });
        }
    },
    mounted() {
        // Check if user is instructor
        const userStr = localStorage.getItem('user');
        this.quizID = localStorage.getItem('quizId');

        if (!userStr) {
            window.location.href = '/login';
            return;
        }

        const user = JSON.parse(userStr);

        // if not instructor or admin nothing to do here so links back to dashboard
        if (user.role !== 'instructor' && user.role !== 'admin') {
            alert('Access denied. Only instructors can create quizzes.');
            window.location.href = '/dashboard';
        }

        this.loadQuestions();
    }
}).mount('#app');