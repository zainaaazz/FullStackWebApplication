import React, { useState } from 'react';
import axios from 'axios'; // Import axios for API calls
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook for navigation
import './LoginForm.css';

const LoginForm = () => {
  const [userNumber, setUserNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(''); // Error message from server
  const navigate = useNavigate(); // Hook for navigation

  // Form validation
  const validateForm = () => {
    let formErrors = {};

    // Validate UserNumber (must be a valid number and not empty)
    if (!userNumber.trim() || isNaN(userNumber)) {
      formErrors.userNumber = 'Valid User Number is required';
    }

    // Validate Password (must not be empty)
    if (!password.trim()) {
      formErrors.password = 'Password is required';
    }

    return formErrors;
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrorMessage(''); // Clear previous error message

    if (Object.keys(formErrors).length === 0) {
      try {
        // Send login request to the backend
        const response = await axios.post('https://hmsnwu.azurewebsites.net/auth/login', {
          UserNumber: parseInt(userNumber, 10), // Send UserNumber as an integer
          Password: password, // Send password
        });

        // If the response contains a token, store it in localStorage and navigate
        if (response.data && response.data.accessToken) {
          localStorage.setItem('token', response.data.accessToken); // Store the token
          alert('Login successful');
          navigate('/assignments'); // Navigate to the assignments page
        } else {
          setErrorMessage('Invalid credentials. Please try again.');
        }
      } catch (error) {
        if (error.response) {
          setErrorMessage(`Error: ${error.response.data.message || 'Invalid credentials. Please try again.'}`);
          console.error('Login error:', error.response.data);
        } else {
          setErrorMessage('Network error. Please check your connection.');
          console.error('Login error:', error);
        }
      }
    } else {
      setErrors(formErrors); // Set validation errors if they exist
    }
  };

  // Clear form handler
  const clearForm = () => {
    setUserNumber('');
    setPassword('');
    setErrors({});
    setErrorMessage(''); // Clear error messages
  };

  return (
    <div className="login-container">
      <header className="header">
        <img src={require('../assets/image.png')} alt="NWU Logo" className="nwu-logo" />
        <h1 className="heading">HMS Lecturer Portal</h1>
      </header>
      <div className="center-section">
        <h2>Central Authentication Service</h2>
      </div>
      <div className="login-box">
        <div className="left-section">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="userNumber">User Number:</label>
              <input
                type="text"
                id="userNumber"
                value={userNumber}
                onChange={(e) => setUserNumber(e.target.value)}
                placeholder="Enter your User Number"
              />
              {errors.userNumber && <p className="error-message">{errors.userNumber}</p>} {/* Display validation error */}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <div className="password-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="error-message">{errors.password}</p>} {/* Display validation error */}
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display server error */}
            <button type="submit" className="login-button">
              LOGIN
            </button>
            <button type="button" onClick={clearForm} className="clear-button">
              Clear
            </button>
          </form>
        </div>
        <div className="right-section">
          <p className="security-message">
            For security reasons, please Log Out and Exit your web browser when you are done accessing services that require authentication.
          </p>
          <p className="disclaimer">
            You are about to log into the NWU private network. You confirm that you have read and that you understand the NWU policy, rules, and regulations as published.
          </p>
          <p className="disclaimer">
            <a href="https://www.nwu.ac.za/gov_man/policy/index.html" target="_blank">GOVERNANCE AND MANAGEMENT: Policies & Rules</a>
         </p>
          <p className="disclaimer">
            <a href="https://services.nwu.ac.za/information-technology/policy-rules-and-guidelines-responsible-use-it" target="_blank">NWU IT RESPONSIBLE USAGE: Policy, Rules and Guidelines</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
