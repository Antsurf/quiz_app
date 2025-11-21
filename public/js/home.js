// Vue.js application for home page
// Shows landing page for guests, profile dashboard for authenticated users

const { createApp } = Vue;

createApp({
  data() {
    return {
      message: 'Welcome to Quiz Assessment Platform',
      isAuthenticated: false,
      user: {},
      stats: {
        totalAttempts: 0,
        quizzesCreated: 0,
        averageScore: 0,
        highestScore: 0
      },
      recentAttempts: [],
      recentQuizzes: [],
      loading: true
    };
  },
  methods: {
    // Check if user is authenticated
    checkAuthentication() {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        this.isAuthenticated = true;
        this.user = JSON.parse(userStr);
        this.fetchUserData();
      } else {
        this.isAuthenticated = false;
        this.loading = false;
      }
    },
    
    // Fetch user data and statistics
    fetchUserData() {
      const token = localStorage.getItem('token');
      
      if (this.user.role === 'student') {
        // Fetch quiz attempts for students
        this.fetchStudentStats(token);
      } else {
        // Fetch created quizzes for instructors
        this.fetchInstructorStats(token);
      }
    },
    
    // Fetch student statistics
    fetchStudentStats(token) {
      fetch('http://localhost:3000/api/quizzes/attempts/user', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(response => response.json())
      .then(data => {
        this.loading = false;
        
        if (data.success) {
          const attempts = data.attempts;
          
          // Calculate statistics
          this.stats.totalAttempts = attempts.length;
          
          if (attempts.length > 0) {
            // Calculate average score
            const totalScore = attempts.reduce((sum, attempt) => {
              return sum + (attempt.score / attempt.total_questions) * 100;
            }, 0);
            this.stats.averageScore = (totalScore / attempts.length).toFixed(1);
            
            // Find highest score
            const highestAttempt = attempts.reduce((max, attempt) => {
              const score = (attempt.score / attempt.total_questions) * 100;
              return score > max ? score : max;
            }, 0);
            this.stats.highestScore = highestAttempt.toFixed(1);
          }
          
          // Get recent 5 attempts
          this.recentAttempts = attempts.slice(0, 5);
        }
      })
      .catch(error => {
        this.loading = false;
        console.error('Error:', error);
      });
    },
    
    // Fetch instructor statistics
    fetchInstructorStats(token) {
      fetch('http://localhost:3000/api/quizzes', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(response => response.json())
      .then(data => {
        this.loading = false;
        
        if (data.success) {
          // Filter quizzes created by this instructor
          const myQuizzes = data.quizzes.filter(q => q.instructor_id === this.user.id);
          
          this.stats.quizzesCreated = myQuizzes.length;
          
          // Get recent 5 quizzes
          this.recentQuizzes = myQuizzes.slice(0, 5);
          
          // For instructors, we can also fetch attempt stats if needed
          this.stats.totalAttempts = 0; // Could fetch total attempts on their quizzes
          this.stats.averageScore = 0;  // Could calculate average across all attempts
          this.stats.highestScore = 0;  // Could find best performance
        }
      })
      .catch(error => {
        this.loading = false;
        console.error('Error:', error);
      });
    },
    
    // Get user initials for avatar
    getUserInitials() {
      if (!this.user.username) return '?';
      const names = this.user.username.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return this.user.username.substring(0, 2).toUpperCase();
    },
    
    // Format user role for display
    formatRole(role) {
      if (!role) return '';
      return role.charAt(0).toUpperCase() + role.slice(1);
    },
    
    // Calculate percentage score
    calculatePercentage(attempt) {
      return ((attempt.score / attempt.total_questions) * 100).toFixed(1);
    },
    
    // Get grade based on percentage
    getGrade(attempt) {
      const percentage = this.calculatePercentage(attempt);
      if (percentage >= 80) return 'Excellent';
      if (percentage >= 60) return 'Good';
      return 'Need Practice';
    },
    
    // Get CSS class for score badge
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
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return diffDays + ' days ago';
      
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }
  },
  mounted() {
    // Check authentication status on page load
    this.checkAuthentication();
  }
}).mount('#app');