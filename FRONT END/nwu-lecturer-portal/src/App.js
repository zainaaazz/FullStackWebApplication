import React from 'react';
import './App.css';
import LoginForm from './components/LoginForm';

function App() {
  return (
    <div className="App">
      <header className="header">
        <img src={require('./assets/NWU-WhiteLogo.png')} alt="NWU Logo" className="nwu-logo" />
        <h1 className="heading">Lecturer Portal</h1>
      </header>
      <LoginForm />
    </div>
  );
}

export default App;
