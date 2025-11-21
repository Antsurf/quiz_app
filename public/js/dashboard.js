// Vue.js application for dashboard
// Displays quizzes and manages quiz operations

const { createApp } = Vue;

createApp({
  data() {
    return {
      user: {},
      quizzes: [],
      recentAttempts: [],
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
    
    // Fetch all quizzes
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
    
    // Delete quiz
    deleteQuiz(quizId) {
      if (!confirm('Are you sure you want to delete this quiz?')) {
        return;
      }
      
      const token = localStorage.getItem('token');
      
      fetch('http://localhost:3000/api/quizzes/' + quizId, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.showAlert('success', 'Quiz deleted successfully');
          this.fetchQuizzes(); // Reload quizzes
        } else {
          this.showAlert('error', data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        this.showAlert('error', 'Failed to delete quiz');
      });
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
    
    if (!userStr) {
      window.location.href = '/login';
      return;
    }
    
    this.user = JSON.parse(userStr);
    this.fetchQuizzes();
  }
}).mount('#app');