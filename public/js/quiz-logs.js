//- Handles quiz logs (linked to quiz-logs.pug)

const { createApp } = Vue;


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

        // A function to get the different attempts of every student 
        fetchQuizInfo() {
            const token = localStorage.getItem('token');

            // If the user is not connected we redirect to log in
            if (!token) {
                window.location.href = '/login';
                return;
            }

            // Call to the server 
            fetch('http://localhost:3000/api/quizzes/attempts/' + this.quizId, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.loading = false;

                    // Saving the data in the vue variables 
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