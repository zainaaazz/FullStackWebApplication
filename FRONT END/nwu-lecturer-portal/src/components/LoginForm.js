import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let formErrors = {};

    if (!username.trim()) {
      formErrors.username = 'Username is required';
    }

    if (!password.trim()) {
      formErrors.password = 'Password is required';
    }

    return formErrors;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      console.log('Logging in with:', { username, password });
    } else {
      setErrors(formErrors);
    }
  };

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setErrors({});
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
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
              {errors.username && <p className="error-message">{errors.username}</p>}
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
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
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
