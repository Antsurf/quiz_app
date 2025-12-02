//- Handles quiz logs (linked to quiz-logs.pug)

const { createApp } = Vue;

// mostly check for token and good quiz
createApp({
    data() {
        return {
            user: {},
            quizId: 0,
            quizAttempts: [],
            quiztitle: "",
            loading: true,
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
        fetchQuizzes() {
            const token = localStorage.getItem('token');

            if (!token) {
                window.location.href = '/login';
                return;
            }

            fetch('http://localhost:3000/api/quizzes', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.loading = false;

                    if (data.success) {
                        this.quizzes = data.quizzes;
                    } else {
                        this.showAlert('error', data.message);
                    }
                })
                .catch(error => {
                    this.loading = false;
                    console.error('Error:', error);
                    this.showAlert('error', 'Failed to load quizzes');
                });
        },


        fetchQuizInfo() {
            const token = localStorage.getItem('token');

            if (!token) {
                window.location.href = '/login';
                return;
            }

            fetch('http://localhost:3000/api/quizzes/attempts/' + this.quizId, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.loading = false;

                    if (data.success) {
                        this.quizAttempts = data.attempts;
                        this.quiztitle = data.title;
                    }
                    else {
                        this.showAlert('error', data.message);
                    }
                })
                .catch(error => {
                    this.loading = false;
                    console.error('Error:', error);
                    this.showAlert('error', 'Failed to load quiz attempts');
                })
        },
        // Format date for display
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }

    },
    mounted() {
        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        const quizId = localStorage.getItem('quizId')

        if (!userStr) {
            window.location.href = "/login";
            return;
        }

        this.user = JSON.parse(userStr);
        this.quizId = JSON.parse(quizId);
        this.fetchQuizInfo();
    }
}).mount('#app');