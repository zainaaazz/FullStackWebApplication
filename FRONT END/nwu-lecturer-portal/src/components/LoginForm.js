import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './LoginForm.css';

const LoginForm = () => {
  const [UserNumber, setUserNumber] = useState('');
  const [Password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(''); // State to track login success

  const navigate = useNavigate(); // Initialize navigate

  const validateForm = () => {
    let formErrors = {};

    if (!UserNumber.trim()) {
      formErrors.UserNumber = 'User Number is required';
    }

    if (!Password.trim()) {
      formErrors.Password = 'Password is required';
    }

    return formErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      try {
        const response = await fetch('https://hmsnwu.azurewebsites.net/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            UserNumber: parseInt(UserNumber), // Assuming UserNumber is an integer
            Password,
          }),
        });

        if (!response.ok) {
          throw new Error('Login failed. Please check your credentials.');
        }

        const data = await response.json();
        const token = data.token; // Assuming the token is returned as "token"

        // Store the JWT token in localStorage or sessionStorage
        localStorage.setItem('jwtToken', token);

        // Set login success message
        setLoginSuccess('Login successful!');

        // Clear any previous login error
        setLoginError('');

        // Redirect to the assignments page after successful login
        navigate('/assignments'); // Redirect user to assignments page

      } catch (error) {
        setLoginError(error.message);
        setLoginSuccess(''); // Clear success message if there's an error
      }
    } else {
      setErrors(formErrors);
    }
  };

  const clearForm = () => {
    setUserNumber('');
    setPassword('');
    setErrors({});
    setLoginError('');
    setLoginSuccess(''); // Clear success message when form is cleared
  };

  return (
    <div className="login-container">
      <div className="center-section">
        <h2>Central Authentication Service</h2>
      </div>
      <div className="login-box">
        <div className="left-section">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="UserNumber">User Number:</label>
              <input
                type="Number"
                id="UserNumber"
                value={UserNumber}
                onChange={(e) => setUserNumber(e.target.value)}
                placeholder="Enter your UserNumber"
              />
              {errors.UserNumber && <p className="error-message">{errors.UserNumber}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="Password">Password:</label>
              <div className="Password-container">
                <input
                  type={showPassword ? 'text' : 'Password'}
                  id="Password"
                  value={Password}
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
              {errors.Password && <p className="error-message">{errors.Password}</p>}
            </div>
            {loginError && <p className="error-message">{loginError}</p>}
            {loginSuccess && <p className="success-message">{loginSuccess}</p>} {/* Success message */}
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
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
