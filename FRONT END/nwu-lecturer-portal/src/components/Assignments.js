import React, { useState } from 'react';
import './Assignments.css';

const Assignments = () => {
  const [activeTab, setActiveTab] = useState('Home'); // Default active module

  // Array of modules to render
  const modules = [
    { name: 'Home', icon: '⚪' },
    { name: 'MTHS 225 1-1 P 2024', icon: '🟣' },
    { name: 'Programming competition', icon: '🟣' },
    { name: 'CMPG 323 1-1 P 2024', icon: '🟣' }
  ];

  return (
    <div className="assignments-container">
      <header className="header">
        <img src={require('../assets/image.png')} alt="NWU Logo" className="nwu-logo" />
        <h1 className="heading">HMS Lecturer Portal</h1>
      </header>

      {/* Module tabs */}
      <header className="headerModules">
        {modules.map((module, index) => (
          <div
            key={index}
            className={`module-tab ${activeTab === module.name ? 'active' : ''}`}
            onClick={() => setActiveTab(module.name)}
          >
            <span className="icon">{module.icon}</span>
            <span>{module.name}</span>
          </div>
        ))}
      </header>
      
      <div className="content">
        <div className="sidebar">
          <ul>
            <li>Overview</li>
            <li>Lessons</li>
            <li>Announcements</li>
            <li>Resources</li>
            <li className="active">Assignments</li>
            <li>Tests & Quizzes</li>
            <li>Statistics</li>
            <li>Site Info</li>
            <li>Contact Us</li>
            <li>Gradebook</li>
            <li>Help</li>
          </ul>
        </div>
        <div className="main-content">
          <h2>Assignments</h2>
          <p>Select an assignment to view details, start working, or edit your previous work.</p>
          <table>
            <thead>
              <tr>
                <th>Assignment Title</th>
                <th>Status</th>
                <th>Open Date</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="#">Linux Practical</a></td>
                <td>Not Started</td>
                <td>17 Sep 2024, 18:00</td>
                <td>14 Oct 2024, 13:00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Assignments;
