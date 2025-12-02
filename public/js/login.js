// Handles authentication with JWT (linked to login.pug)

const { createApp } = Vue;

createApp({
  data() {
    return {
      formData: {
        email: '',
        password: ''
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
    
    // Handle login form submission
    handleLogin() {
      this.loading = true;
      
      // Make API call to login endpoint
      fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.formData)
      })
      .then(response => response.json())
      .then(data => {
        this.loading = false;
        
        if (data.success) {
          // Store token and user info in localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          this.showAlert('success', 'Login successful! Welcome Back!');
          
          // Redirect to dashboard after 1 second
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        } else {
          this.showAlert('error', data.message || 'Login failed');
        }
      })
      .catch(error => {
        this.loading = false;
        console.error('Error:', error);
        this.showAlert('error', 'Connection error. Please try again.');
      });
    }
  }
}).mount('#app');