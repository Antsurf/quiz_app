// Handles quiz navigation and submission (linked to take-quiz.pug)

const { createApp } = Vue;

createApp({
  data() {
    return {
      quiz: null,
      currentQuestion: 0,
      answers: {}, // { questionId: selectedAnswer }
      loading: true,
      submitted: false,
      results: null
    };
  },
  computed: {
    // Check if all questions have been answered
    allQuestionsAnswered() {
      if (!this.quiz) return false;
      return this.quiz.questions.every(q => this.answers[q.id]);
    }
  },
  methods: {
    // Fetch quiz data
    fetchQuiz() {
      const quizId = window.location.pathname.split('/').pop();
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      fetch('http://localhost:3000/api/quizzes/' + quizId, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(response => response.json())
      .then(data => {
        this.loading = false;
        
        if (data.success) {
          this.quiz = data.quiz;
        } else {
          alert(data.message);
          window.location.href = '/dashboard';
        }
      })
      .catch(error => {
        this.loading = false;
        console.error('Error:', error);
        alert('Failed to load quiz');
      });
    },
    
    // Get option text for a question
    getOptionText(question, option) {
      return question['option_' + option.toLowerCase()];
    },
    
    // Select an answer for current question
    selectAnswer(questionIndex, option) {
      const questionId = this.quiz.questions[questionIndex].id;
      this.answers[questionId] = option;
    },
    
    // Navigate to next question
    nextQuestion() {
      if (this.currentQuestion < this.quiz.questions.length - 1) {
        this.currentQuestion++;
      }
    },
    
    // Navigate to previous question
    previousQuestion() {
      if (this.currentQuestion > 0) {
        this.currentQuestion--;
      }
    },
    
    // Submit quiz answers
    submitQuiz() {
      if (!this.allQuestionsAnswered) {
        alert('Please answer all questions before submitting');
        return;
      }
      
      const token = localStorage.getItem('token');
      const quizId = this.quiz.id;
      
      fetch('http://localhost:3000/api/quizzes/' + quizId + '/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ answers: this.answers })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.results = data;
          this.submitted = true;
        } else {
          alert(data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit quiz');
      });
    },
    
    // Retake the quiz
    retakeQuiz() {
      this.currentQuestion = 0;
      this.answers = {};
      this.submitted = false;
      this.results = null;
    }
  },
  mounted() {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      window.location.href = '/login';
      return;
    }
    
    this.fetchQuiz();
  }
}).mount('#app');