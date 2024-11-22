import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const [authToken, setAuthToken] = useState(localStorage.getItem('auth_token'));

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setAuthToken(token);
  }, []); 

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setTimeout(()=>setAuthToken(null),500)
  };
  if (!authToken) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
        }}
      >
        <button style={{ marginBottom: '10px' }} onClick={handleRegisterClick}>
          Register
        </button>
        <button onClick={handleLoginClick}>Login</button>
      </div>
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
      }}
    >
      Inside Dashboard
      <button style={{ marginBottom: '10px' }} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
