import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './WatchVideoFeedback.css';

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
  const [assignmentTitles, setAssignmentTitles] = useState({});
  const [showAssignmentMessage, setShowAssignmentMessage] = useState(false);
  const [feedback, setFeedback] = useState({}); // State for storing feedback
  const [userNumbers, setUserNumbers] = useState({}); // State for storing UserNumbers

  // Retrieve lectureId from the token
  const getLectureId = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      return decodedToken.UserID; // Assuming the token contains a UserID for the lecturer
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      setError('');
      setLoading(true);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Unauthorized: No token found. Please login.');
          return;
        }

        const decodedToken = jwtDecode(token);
        const userCourseID = decodedToken.CourseID;

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

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
      setShowAssignmentMessage(true);
    } else {
      setShowAssignmentMessage(false);
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

      const assignmentsResponse = await axios.get(`https://hmsnwu.azurewebsites.net/assignments/module/${moduleId}`, config);
      if (Array.isArray(assignmentsResponse.data)) {
        setAssignments(assignmentsResponse.data);

        const titles = {};
        assignmentsResponse.data.forEach(assignment => {
          titles[assignment.AssignmentID] = assignment.Title;
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
      setShowAssignmentMessage(false);
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

      const submissionsResponse = await axios.get(`https://hmsnwu.azurewebsites.net/submissions?assignmentId=${assignmentId}`, config);
      if (Array.isArray(submissionsResponse.data)) {
        setSubmissions(submissionsResponse.data);

        // Fetch UserNumbers for each submission
        const userNumberPromises = submissionsResponse.data.map(async (submission) => {
          const userResponse = await axios.get(`https://hmsnwu.azurewebsites.net/users/${submission.StudentID}`, config);
          return { studentId: submission.StudentID, userNumber: userResponse.data.UserNumber };
        });

        const userNumberResults = await Promise.all(userNumberPromises);
        const userNumberMapping = userNumberResults.reduce((acc, { studentId, userNumber }) => {
          acc[studentId] = userNumber;
          return acc;
        }, {});
        setUserNumbers(userNumberMapping);
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
    const fetchVideoDetails = async () => {
      const videoIds = [...new Set(submissions.map(submission => submission.VideoID))];
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      try {
        const videoDetailPromises = videoIds.map(id =>
          axios.get(`https://hmsnwu.azurewebsites.net/videos/${id}`, config)
        );
        const videoResponses = await Promise.all(videoDetailPromises);

        const details = {};
        videoResponses.forEach(response => {
          if (response.data) {
            details[response.data.VideoID] = {
              VideoTitle: response.data.VideoTitle,
              VideoURL: response.data.VideoURL,
            };
          }
        });
        setVideoDetails(details);
      } catch (err) {
        console.error('Error fetching video details:', err);
      }
    };

    if (submissions.length > 0) {
      fetchVideoDetails();
    }
  }, [submissions]);

  const handleAssignmentClick = (assignmentId) => {
    setActiveAssignmentId(assignmentId);
  };

  const handleBackClick = () => {
    setActiveAssignmentId(null);
  };

  // Handle input for feedback text and mark
  const handleFeedbackChange = (submissionId, field, value) => {
    setFeedback(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      },
    }));
  };

  // Submit feedback for a specific submission
  const submitFeedback = async (submissionId) => {
    const lectureId = getLectureId(); // Retrieve lecture ID from token
    const feedbackText = feedback[submissionId]?.feedbackText || '';
    const mark = feedback[submissionId]?.mark || '';

    if (!feedbackText || !mark) {
      setError('Please provide both feedback text and a mark.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      // Send feedback data to the server
      await axios.post(
        `https://hmsnwu.azurewebsites.net/feedbacks`,
        {
          submissionId,
          lectureId,
          feedbackText,
          mark,
        },
        config
      );
      setError(''); // Clear error if submission is successful
      alert('Feedback submitted successfully!');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(`Failed to submit feedback: ${err.response?.data?.error || err.message}`);
    }
  };

  const filteredSubmissions = submissions.filter(
    (submission) => submission.AssignmentID === activeAssignmentId
  );

  return (
    <div className="list-assignment-video-container">
      <header className="header">
        <img src={require('../assets/image.png')} alt="NWU Logo" className="nwu-logo" />
        <h1 className="heading">HMS Lecturer Portal - Watch Video Feedback </h1>
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
            <ul>
              {assignments.map(assignment => (
                <li key={assignment.AssignmentID}>
                  <button
                    className="assignment-button"
                    onClick={() => handleAssignmentClick(assignment.AssignmentID)}
                  >
                    Assignment ID: {assignment.AssignmentID}, Title: {assignment.Title}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {activeAssignmentId && (
            <>
              <h2>Video Submissions</h2>
              <button className="btn btn-primary" onClick={handleBackClick}>
                Back to Assignments
              </button>

              {filteredSubmissions.length === 0 ? (
                <p>No video submissions found for this assignment.</p>
              ) : (
                <>
                  <table className="submission-table">
                    <thead>
                      <tr>
                        <th>UserNumber</th>
                        <th>Submission ID</th>
                        <th>Video Title</th>
                        <th>Action (Watch Video)</th>
                        <th>Feedback Text</th>
                        <th>Mark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map(submission => (
                        <tr key={submission.SubmissionID}>
                          <td>{userNumbers[submission.StudentID] || 'N/A'}</td>
                          <td>{submission.SubmissionID}</td>
                          <td>{videoDetails[submission.VideoID]?.VideoTitle || 'N/A'}</td>
                          <td>
                            <button
                              className="btn btn-secondary"
                              onClick={() =>
                                window.open(videoDetails[submission.VideoID]?.VideoURL || '', '_blank')
                              }
                            >
                              Watch Video
                            </button>
                          </td>
                          <td>
                            <textarea
                              value={feedback[submission.SubmissionID]?.feedbackText || ''}
                              onChange={e =>
                                handleFeedbackChange(submission.SubmissionID, 'feedbackText', e.target.value)
                              }
                              placeholder="Enter feedback"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={feedback[submission.SubmissionID]?.mark || ''}
                              onChange={e =>
                                handleFeedbackChange(submission.SubmissionID, 'mark', e.target.value)
                              }
                              placeholder="Enter mark"
                              min="0"
                              max="100"
                            />
                            <button
                              className="btn btn-primary"
                              onClick={() => submitFeedback(submission.SubmissionID)}
                            >
                              Submit Feedback
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListAssignmentVideo;
