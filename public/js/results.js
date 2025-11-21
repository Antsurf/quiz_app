// Vue.js application for viewing quiz results
// Displays quiz history and scores

const { createApp } = Vue;

createApp({
  data() {
    return {
      attempts: [],
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
    
    // Fetch all quiz attempts for the user
    fetchAttempts() {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      fetch('http://localhost:3000/api/quizzes/attempts/user', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(response => response.json())
      .then(data => {
        this.loading = false;
        
        if (data.success) {
          this.attempts = data.attempts;
        } else {
          this.showAlert('error', data.message);
        }
      })
      .catch(error => {
        this.loading = false;
        console.error('Error:', error);
        this.showAlert('error', 'Failed to load results');
      });
    },
    
    // Calculate percentage score
    calculatePercentage(attempt) {
      return ((attempt.score / attempt.total_questions) * 100).toFixed(2);
    },
    
    // Get grade based on percentage
    getGrade(attempt) {
      const percentage = this.calculatePercentage(attempt);
      if (percentage >= 80) return 'Excellent!';
      if (percentage >= 60) return 'Good Job!';
      return 'Keep Practicing!';
    },
    
    // Get CSS class for score circle
    getScoreClass(attempt) {
      const percentage = this.calculatePercentage(attempt);
      if (percentage >= 80) return 'score-excellent';
      if (percentage >= 60) return 'score-good';
      return 'score-needs-improvement';
    },
    
    // Get CSS class for grade text
    getGradeClass(attempt) {
      const percentage = this.calculatePercentage(attempt);
      if (percentage >= 80) return 'excellent';
      if (percentage >= 60) return 'good';
      return 'needs-improvement';
    },
    
    // Format date for display
    formatDate(dateString) {
      const date = new Date(dateString);
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('en-US', options);
    }
  },
  mounted() {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      window.location.href = '/login';
      return;
    }
    
    this.fetchAttempts();
  }
}).mount('#app');