import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './UserAdmin.css'; // Ensure the CSS file exists

const UserAdmin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]); // State for courses
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    UserNumber: '',
    Password: '',
    FirstName: '',
    LastName: '',
    Email: '',
    CourseID: '',
    UserRole: 'Student',
  });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userIdToDelete, setUserIdToDelete] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized: No token found. Please login.');
        return;
      }
      const decodedToken = jwtDecode(token);
      if (decodedToken.UserRole !== 'Admin') {
        setError('Access denied: You do not have permission to access this page.');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const response = await axios.get('https://hmsnwu.azurewebsites.net/users', config);
      setUsers(response.data);
    } catch (err) {
      setError(`Failed to fetch users: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses on component mount
  const fetchCourses = async () => {
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
      const response = await axios.get('https://hmsnwu.azurewebsites.net/courses', config);
      setCourses(response.data);
    } catch (err) {
      setError(`Failed to fetch courses: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCourses(); // Fetch courses when component mounts
  }, []);

  const handleDeleteUser = async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
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
        await axios.delete(`https://hmsnwu.azurewebsites.net/users/${userIdToDelete}`, config);
        setUsers(users.filter(user => user.UserID !== userIdToDelete));
        alert('User deleted successfully.');
        setUserIdToDelete('');
      } catch (err) {
        setError(`Failed to delete user: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

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
      await axios.put(`https://hmsnwu.azurewebsites.net/users/${selectedUser.UserID}`, selectedUser, config);
      setUsers(users.map(user => (user.UserID === selectedUser.UserID ? selectedUser : user)));
      alert('User updated successfully.');
      setSelectedUserId('');
      setSelectedUser(null); // Clear selected user after update
    } catch (err) {
      setError(`Failed to update user: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchUserData = async () => {
    if (!selectedUserId) return;
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
      const response = await axios.get(`https://hmsnwu.azurewebsites.net/users/${selectedUserId}`, config);
      setSelectedUser(response.data);
    } catch (err) {
      setError(`Failed to fetch user data: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
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
      await axios.post('https://hmsnwu.azurewebsites.net/auth/register', newUser, config);
      alert('User registered successfully.');
      setNewUser({
        UserNumber: '',
        Password: '',
        FirstName: '',
        LastName: '',
        Email: '',
        CourseID: '',
        UserRole: 'Student',
      });
      fetchUsers();
    } catch (err) {
      setError(`Failed to register user: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-admin-container">
      <header className="header">
        <img src={require('../assets/image.png')} alt="NWU Logo" className="nwu-logo" />
        <h1 className="heading">HMS User Administration</h1>
      </header>

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="admin-layout">
        <div className="admin-form-section">
          <div className="user-admin-section">
            <h2>Register New User</h2>
            <form onSubmit={handleRegisterUser}>
              <input
                type="number"
                placeholder="User Number"
                value={newUser.UserNumber}
                onChange={(e) => setNewUser({ ...newUser, UserNumber: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.Password}
                onChange={(e) => setNewUser({ ...newUser, Password: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="First Name"
                value={newUser.FirstName}
                onChange={(e) => setNewUser({ ...newUser, FirstName: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newUser.LastName}
                onChange={(e) => setNewUser({ ...newUser, LastName: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.Email}
                onChange={(e) => setNewUser({ ...newUser, Email: e.target.value })}
                required
              />
              <select
                value={newUser.CourseID}
                onChange={(e) => setNewUser({ ...newUser, CourseID: e.target.value })}
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.CourseID} value={course.CourseID}>
                    {course.CourseName}
                  </option>
                ))}
              </select>
              <select value={newUser.UserRole} onChange={(e) => setNewUser({ ...newUser, UserRole: e.target.value })}>
                <option value="Student">Student</option>
                <option value="Admin">Admin</option>
                <option value="Lecturer">Lecturer</option>
              </select>
              <button type="submit">Register User</button>
            </form>
          </div>

          <div className="user-admin-section">
            <h2>Delete User</h2>
            <input
              type="number"
              placeholder="User ID to Delete"
              value={userIdToDelete}
              onChange={(e) => setUserIdToDelete(e.target.value)}
            />
            <button onClick={handleDeleteUser}>Delete User</button>
          </div>

          <div className="user-admin-section">
            <h2>Update User</h2>
            <input
              type="number"
              placeholder="User ID to Update"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            />
            <button onClick={handleFetchUserData}>Fetch User Data</button>
            {selectedUser && (
              <form onSubmit={handleUpdateUser}>
                <input
                  type="text"
                  placeholder="First Name"
                  value={selectedUser.FirstName}
                  onChange={(e) => setSelectedUser({ ...selectedUser, FirstName: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={selectedUser.LastName}
                  onChange={(e) => setSelectedUser({ ...selectedUser, LastName: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={selectedUser.Email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, Email: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="User Number"
                  value={selectedUser.UserNumber}
                  onChange={(e) => setSelectedUser({ ...selectedUser, UserNumber: e.target.value })}
                  required
                />
                <select
                  value={selectedUser.UserRole}
                  onChange={(e) => setSelectedUser({ ...selectedUser, UserRole: e.target.value })}
                  required
                >
                  <option value="Student">Student</option>
                  <option value="Admin">Admin</option>
                  <option value="Lecturer">Lecturer</option>
                </select>
                {/* Dropdown for Course Names */}
                <select
                  value={selectedUser.CourseID}
                  onChange={(e) => setSelectedUser({ ...selectedUser, CourseID: e.target.value })}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.CourseID} value={course.CourseID}>
                      {course.CourseName}
                    </option>
                  ))}
                </select>
                <button type="submit">Update User</button>
              </form>
            )}
          </div>
        </div>

        <div className="user-list-section">
          <h2>Users List</h2>
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>UserNumber</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Course ID</th>
                <th>User Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.UserID}>
                  <td>{user.UserID}</td>
                  <td>{user.UserNumber}</td>
                  <td>{user.FirstName}</td>
                  <td>{user.LastName}</td>
                  <td>{user.Email}</td>
                  <td>{user.CourseID}</td>
                  <td>{user.UserRole}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        
       <button className="btn btn-secondary" onClick={() => navigate('/assignments')}>
        Back to Assignments
      </button>

      <footer className="footer">
        <p>&copy; 2024 North-West University. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default UserAdmin;
