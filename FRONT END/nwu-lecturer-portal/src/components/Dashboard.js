import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  // Logout function
  const handleLogout = () => {
  // Clear the token (or session) from local storage or session storage
  localStorage.removeItem('authToken'); // Adjust based on how you're storing the token
  sessionStorage.removeItem('authToken'); // In case you're using sessionStorage

  // Redirect to login page
  navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-section">
          <img src={require('../assets/image.png')} alt="NWU Logo" className="nwu-logo" />
          <h1 className="heading">HMS Lecturer Portal</h1>
        </div>
        <nav className="nav-links">
          <ul>
            <li onClick={() => navigate('/dashboard')} className="active">Home</li>
            <li onClick={() => navigate('/assignments')}>Assignments</li>
            <li onClick={() => navigate('/create-assignment')}>Create Assignment</li>
            <li onClick={() => navigate('/list-assignment-video')}>List Assignment Video</li>
            <li onClick={() => navigate('/user-admin')}>User Administration</li>
            <li onClick={() => navigate('/watchVideo-Feedback')}>Watch Video Feedback</li>
            <li onClick={handleLogout}>Logout</li> {/* Updated Logout to trigger the handleLogout function */}
          </ul>
        </nav>
      </header>

      <div className="dashboard-content">
        <div className="main-section">
          <h2>Welcome to the HMS Lecturer Portal</h2>
          <div className="intro-text">
            <p>
              The <strong>HMS Lecturer Portal</strong> is a powerful web platform designed to simplify the process of managing
              assignments and student submissions for lecturers. From creating assignments to reviewing and providing feedback
              on video submissions, this portal is your all-in-one solution.
            </p>
            <p>
              Our goal is to streamline the way you interact with students, making assignment management more efficient and organized.
              Use the intuitive navigation options to perform key tasks with ease.
            </p>
          </div>
          <button onClick={() => navigate('/assignments')} className="cta-button">
            View Assignments
          </button>
        </div>

        <div className="feature-section">
          <h2>Dashboard Features</h2>
          <div className="features">
            <div className="feature-box" onClick={() => navigate('/create-assignment')}>
              <h3>Create Assignments</h3>
              <p>Organize your coursework by creating new assignments for students.</p>
            </div>
            <div className="feature-box" onClick={() => navigate('/list-assignment-video')}>
              <h3>View Submissions</h3>
              <p>Access and review student submissions and provide feedback.</p>
            </div>
            <div className="feature-box" onClick={() => navigate('/assignments')}>
              <h3>View Assignments</h3>
              <p>Check the assignments you have created and monitor their status.</p>
            </div>
            <div className="feature-box" onClick={() => navigate('/user-admin')}>
              <h3>User Administration</h3>
              <p>Manage user roles and access control for the portal.</p>
            </div>
            <div className="feature-box" onClick={() => navigate('/watchVideo-Feedback')}> {/* Added Watch Video Feedback box */}
              <h3>Watch Video & Provide Feedback</h3>
              <p>This page allows a user to stream and/or download a video submission and provide a mark and commentary feedback.</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>&copy; 2024 HMS Lecturer Portal | North-West University</p>
      </footer>
    </div>
  );
};

export default Dashboard;
