// Handles form validation and API communication (linked to register.pug)

const { createApp } = Vue;

createApp({
  data() {
    return {
      formData: {
        username: '',
        email: '',
        password: '',
        role: 'student'
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
    
    // Handle registration form submission
    handleRegister() {
      this.loading = true;
      
      // Make API call to register endpoint
      fetch('http://localhost:3000/api/auth/register', {
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
          this.showAlert('success', 'Registration successful! You will be redirected to login page');
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          this.showAlert('error', data.message || 'Registration failed');
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