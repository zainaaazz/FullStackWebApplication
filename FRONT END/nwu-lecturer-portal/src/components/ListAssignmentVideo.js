import React, { useState, useEffect } from 'react';  
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { jwtDecode } from 'jwt-decode'; // Corrected import
import './ListAssignmentVideo.css';

const ListAssignmentVideo = () => {
  const navigate = useNavigate(); 
  const [assignments, setAssignments] = useState([]);
  const [modules, setModules] = useState([]);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoDetails, setVideoDetails] = useState({});
  const [assignmentTitles, setAssignmentTitles] = useState({}); // New state for assignment titles
  const [showAssignmentMessage, setShowAssignmentMessage] = useState(false); // State for showing assignment message

  useEffect(() => {
    const fetchData = async () => {
      setError('');
      setLoading(true);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Unauthorized: No token found. Please login.');
          return; // Prevent further execution if no token
        }

        const decodedToken = jwtDecode(token);
        const userCourseID = decodedToken.CourseID;

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

        // Fetch modules for the user's course
        const modulesResponse = await axios.get('https://hmsnwu.azurewebsites.net/modules', config);
        if (Array.isArray(modulesResponse.data)) {
          const filteredModules = modulesResponse.data.filter(module => module.CourseID === userCourseID);
          setModules(filteredModules);
        } else {
          setError('Unexpected response format for modules');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to fetch data: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (activeModuleId) {
      fetchAssignments(activeModuleId);
      setShowAssignmentMessage(true); // Show the message when a module is clicked
    } else {
      setShowAssignmentMessage(false); // Hide the message when no module is selected
    }
  }, [activeModuleId]);

  const fetchAssignments = async (moduleId) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      // Fetch assignments for the selected module
      const assignmentsResponse = await axios.get(`https://hmsnwu.azurewebsites.net/assignments/module/${moduleId}`, config);
      if (Array.isArray(assignmentsResponse.data)) {
        setAssignments(assignmentsResponse.data);
        
        // Store assignment titles in state
        const titles = {};
        assignmentsResponse.data.forEach(assignment => {
          titles[assignment.AssignmentID] = assignment.Title; // Map assignment ID to title
        });
        setAssignmentTitles(titles);
      } else {
        setError('Unexpected response format for assignments');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(`Failed to fetch assignments: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAssignmentId) {
      fetchSubmissions(activeAssignmentId);
      setShowAssignmentMessage(false); // Hide the message when an assignment is clicked
    }
  }, [activeAssignmentId]);

  const fetchSubmissions = async (assignmentId) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      // Fetch submissions for the selected assignment
      const submissionsResponse = await axios.get(`https://hmsnwu.azurewebsites.net/submissions?assignmentId=${assignmentId}`, config);
      if (Array.isArray(submissionsResponse.data)) {
        setSubmissions(submissionsResponse.data);
      } else {
        setError('Unexpected response format for submissions');
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(`Failed to fetch submissions: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch video details when submissions change
    const fetchVideoDetails = async () => {
      const videoIds = [...new Set(submissions.map(submission => submission.VideoID))]; // Get unique VideoIDs
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      try {
        // Fetch details for each video by its VideoID
        const videoDetailPromises = videoIds.map(id =>
          axios.get(`https://hmsnwu.azurewebsites.net/videos/${id}`, config)
        );
        const videoResponses = await Promise.all(videoDetailPromises);

        const details = {};
        videoResponses.forEach(response => {
          if (response.data) {
            details[response.data.VideoID] = {
              VideoTitle: response.data.VideoTitle, // Ensure VideoTitle is included
              VideoURL: response.data.VideoURL, // Ensure VideoURL is included
            };
          }
        });
        setVideoDetails(details);
      } catch (err) {
        console.error('Error fetching video details:', err);
      }
    };

    if (submissions.length > 0) {
      fetchVideoDetails(); // Fetch video details when submissions are available
    }
  }, [submissions]);

  const handleAssignmentClick = (assignmentId) => {
    setActiveAssignmentId(assignmentId);
  };

  const handleBackClick = () => {
    setActiveAssignmentId(null);
  };

  const filteredSubmissions = submissions.filter(
    (submission) => submission.AssignmentID === activeAssignmentId
  );

  return (
    <div className="list-assignment-video-container">
      <header className="header">
        <img src={require('../assets/image.png')} alt="NWU Logo" className="nwu-logo" />
        <h1 className="heading">HMS Lecturer Portal - Video Submissions</h1>
      </header>

      <header className="headerModules">
        {modules.map(module => (
          <div
            key={module.ModuleID}
            className={`module-tab ${activeModuleId === module.ModuleID ? 'active' : ''}`}
            onClick={() => setActiveModuleId(module.ModuleID)} 
          >
            <span className="icon">🟣</span>
            <span>{module.ModuleCode}</span>
          </div>
        ))}
      </header>

      <div className="content">
        <div className="main-content">
          {loading && <p>Loading...</p>}
          {error && <p className="error-message">{error}</p>}

          {!activeModuleId && (
            <p className="info-message">Click a module to show assignments to view their submissions.</p>
          )}

          {showAssignmentMessage && (
            <p className="info-message">Click the assignment ID to view the submissions for the assignment.</p>
          )}

          {!activeAssignmentId && (
            <button className="btn btn-primary" onClick={() => navigate('/assignments')}>
              Back to Assignments
            </button>
          )}

          {assignments.length > 0 && !activeAssignmentId && (
            <>
              <h2>Assignments</h2>
              <table>
                <thead>
                  <tr>
                    <th>Assignment ID</th>
                    <th>Title</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(assignment => (
                    <tr key={assignment.AssignmentID} onClick={() => handleAssignmentClick(assignment.AssignmentID)}>
                      <td className="clickable">{assignment.AssignmentID}</td>
                      <td>{assignment.Title}</td>
                      <td>{new Date(assignment.DueDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {activeAssignmentId && (
            <>
              {filteredSubmissions.length > 0 ? (
                <>
                  <h2>Submissions for Assignment {activeAssignmentId}</h2>
                  <button className="back-button" onClick={handleBackClick}>Back</button>
                  <table>
                    <thead>
                      <tr>
                        <th>Video ID</th>
                        <th>Assignment ID</th>
                        <th>Status</th>
                        <th>Assignment Title</th> {/* Updated to Assignment Title */}
                        <th>Video Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map(submission => (
                        <tr key={submission.VideoID}>
                          <td>{submission.VideoID}</td>
                          <td>{submission.AssignmentID}</td>
                          <td>{submission.Status}</td>
                          <td>
                            {assignmentTitles[submission.AssignmentID]} {/* Display assignment title */}
                          </td>
                          <td>
                           <a href={videoDetails[submission.VideoID]?.VideoURL || '#'} target="_blank" rel="noopener noreferrer">
                          {videoDetails[submission.VideoID]?.VideoURL || 'No URL available'}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p>No submissions found for this assignment.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListAssignmentVideo;
