// Vue.js application for quiz creation
// Handles dynamic question management

const { createApp } = Vue;

createApp({
  data() {
    return {
      quizData: {
        title: '',
        description: '',
        questions: [
          {
            question_text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_answer: ''
          }
        ]
      },
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
    
    // Add new question to the quiz
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
        this.quizData.questions.splice(index, 1);
      }
    },
    
    // Submit quiz data
    handleSubmit() {
      // Validate that all questions have correct answers
      const allValid = this.quizData.questions.every(q => q.correct_answer);
      
      if (!allValid) {
        this.showAlert('error', 'Please select correct answer for all questions');
        return;
      }
      
      this.loading = true;
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      fetch('http://localhost:3000/api/quizzes', {
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
          this.showAlert('success', 'Quiz created successfully! Redirecting...');
          
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
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
    
    if (!userStr) {
      window.location.href = '/login';
      return;
    }
    
    const user = JSON.parse(userStr);
    
    if (user.role !== 'instructor' && user.role !== 'admin') {
      alert('Access denied. Only instructors can create quizzes.');
      window.location.href = '/dashboard';
    }
  }
}).mount('#app');