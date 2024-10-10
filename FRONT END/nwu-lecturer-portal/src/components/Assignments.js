import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import './Assignments.css';

const Assignments = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [activeModuleId, setActiveModuleId] = useState(null); // Default active module ID
  const [assignments, setAssignments] = useState([]); // State to store all assignments
  const [filteredAssignments, setFilteredAssignments] = useState([]); // State to store filtered assignments
  const [modules, setModules] = useState([]); // State to store modules
  const [error, setError] = useState(''); // State to store errors
  const [loading, setLoading] = useState(false); // State for loading status

  // Fetch assignments and modules from the backend
  useEffect(() => {
    const fetchData = async () => {
      setError(''); // Clear any previous errors
      setLoading(true); // Start loading

      try {
        const token = localStorage.getItem('token'); // Retrieve token from local storage
        if (!token) {
          setError('Unauthorized: No token found. Please login.');
          return;
        }

        // Decode the token to extract the CourseID
        const decodedToken = jwtDecode(token);
        const userCourseID = decodedToken.CourseID; // Assuming CourseID is in the token

        const config = {
          headers: {
            Authorization: `Bearer ${token}`, // Add token in headers
            'Content-Type': 'application/json',
          },
        };

        // Fetch assignments
        const assignmentsResponse = await axios.get('https://hmsnwu.azurewebsites.net/assignments', config);
        if (Array.isArray(assignmentsResponse.data)) {
          setAssignments(assignmentsResponse.data); // Store all assignments in state
        } else {
          setError('Unexpected response format for assignments');
        }

        // Fetch modules on course
        const modulesResponse = await axios.get('https://hmsnwu.azurewebsites.net/modules', config);
        if (Array.isArray(modulesResponse.data)) {
          // Filter modules based on the user's CourseID
          const filteredModules = modulesResponse.data.filter(module => module.CourseID === userCourseID);
          setModules(filteredModules); // Store filtered modules in state
        } else {
          setError('Unexpected response format for modules on course');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to fetch data: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchData(); // Fetch data on component mount
  }, []);

  // Filter assignments based on the active module ID
  useEffect(() => {
    if (activeModuleId) {
      const filtered = assignments.filter(assignment => assignment.ModuleID === activeModuleId);
      setFilteredAssignments(filtered);
    } else {
      setFilteredAssignments(assignments); // Reset filtered assignments if no module is selected
    }
  }, [activeModuleId, assignments]);

  return (
    <div className="assignments-container">
      <header className="header">
        <img src={require('../assets/image.png')} alt="NWU Logo" className="nwu-logo" />
        <h1 className="heading">HMS Lecturer Portal</h1>
      </header>

      {/* Module tabs */}
      <header className="headerModules">
        {modules.map((module) => (
          <div
            key={module.ModuleID}
            className={`module-tab ${activeModuleId === module.ModuleID ? 'active' : ''}`}
            onClick={() => setActiveModuleId(module.ModuleID)} // Set active module ID on click
          >
            <span className="icon">🟣</span>
            <span>{module.ModuleCode}</span>
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
            <li 
              onClick={() => navigate('/create-assignment')} // Navigate to create assignment page
              className="clickable" // Add a class for styling (optional)
            >
              Create New Assignment
            </li>
            <li>Statistics</li>
            <li>Site Info</li>
            <li>Contact Us</li>
            <li>Gradebook</li>
            <li>Help</li>
          </ul>
        </div>

        <div className="main-content">
          <h2>Assignments</h2>
          {loading && <p>Loading assignments...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && filteredAssignments.length === 0 && <p>No assignments available for this module.</p>}
          {filteredAssignments.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Instructions</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.AssignmentID}>
                    <td>{assignment.Title}</td>
                    <td>{assignment.Instructions}</td>
                    <td>{assignment.Status || 'Not Started'}</td>
                    <td>{new Date(assignment.DueDate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assignments;
