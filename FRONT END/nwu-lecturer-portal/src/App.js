import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import React Router components
import './App.css';
import LoginForm from './components/LoginForm';
import Assignments from './components/Assignments'; // Import the Assignments page
import CreateAssignment from './components/CreateAssignment';

function App() {
  return (
    <Router>
      <div className="App">
       
        <Routes>
          <Route path="/" element={<LoginForm />} /> {/* Route for the login form */}
          <Route path="/assignments" element={<Assignments />} /> 
          <Route path="/create-assignment" element={<CreateAssignment />} />
          {/* Other routes can be added here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
