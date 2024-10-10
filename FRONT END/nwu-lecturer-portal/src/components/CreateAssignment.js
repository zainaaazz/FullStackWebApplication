import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateAssignment.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateAssignment = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModules = async () => {
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Unauthorized: No token found. Please login.');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

        const modulesResponse = await axios.get('https://hmsnwu.azurewebsites.net/modules', config);
        if (Array.isArray(modulesResponse.data)) {
          setModules(modulesResponse.data);
        } else {
          setError('Unexpected response format for modules.');
        }
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError(`Failed to fetch modules: ${err.message}`);
      }
    };

    fetchModules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeModuleId) {
      setError('Please select a module to create an assignment.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized: No token found. Please login.');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        'https://hmsnwu.azurewebsites.net/assignments',
        {
          title: assignmentTitle,
          instructions: instructions,
          dueDate: dueDate,
          ModuleID: activeModuleId,
        },
        config
      );

      if (response.status === 201) {
        toast.success('Assignment successfully created!');
        setAssignmentTitle('');
        setInstructions('');
        setDueDate('');
        setActiveModuleId(null);
        setError('');
      } else {
        toast.error('Failed to create assignment. Please try again.');
      }
    } catch (err) {
      console.error('Error creating assignment:', err.message || err);
      toast.error('Failed to create assignment. Please try again.');
    }
  };

  return (
    <div className="create-assignment-container">
      <h2>Create New Assignment</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="module-selection">
        <h3>Select a Module</h3>
        <div className="modules-container">
          {modules.map((module) => (
            <div
              key={module.ModuleID}
              className={`module-tab ${activeModuleId === module.ModuleID ? 'active' : ''}`}
              onClick={() => setActiveModuleId(module.ModuleID)}
            >
              <span className="icon">🟣</span>
              <span>{module.ModuleCode}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {activeModuleId && (
          <div className="selected-module-info">
            <p>Selected Module: {modules.find(module => module.ModuleID === activeModuleId)?.ModuleCode}</p>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="assignmentTitle">Assignment Title</label>
          <input
            type="text"
            id="assignmentTitle"
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Create Assignment</button>
      </form>
      <button className="btn btn-secondary" onClick={() => navigate('/assignments')}>
        Back to Assignments
      </button>

      <ToastContainer />
    </div>
  );
};

export default CreateAssignment;
