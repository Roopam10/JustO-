import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const LinkLogin = () => {
  const [contact, setContact] = useState(''); 
  const [link, setLink] = useState(''); 
  const [error, setError] = useState(''); 
  const [message, setMessage] = useState(''); 
  const navigate = useNavigate(); 
  const handleGenerateLink = async () => {
    setError('');
    setLink('');
    try {
      const response = await axios.post('http://localhost:8000/generate-one-time-link', { contact });
      setLink(response.data.link);
      console.log('Generated link:', response.data.link);
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating link');
    }
  };
  const handleLoginWithToken = async () => {
    setMessage('');
    setError('');
    try {
      const response = await axios.get(link);
      const { token } = response.data; 
      localStorage.setItem('auth_token', token); 
      setMessage('Login successful!');
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Error logging in');
    }
  };

  return (
    <div className="link-login">
      {!link ? (
        <div>
          <h2>Generate One-Time Login Link</h2>
          <input
            type="text"
            placeholder="Enter email or phone number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
          <button onClick={handleGenerateLink}>Generate Link</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      ) : (
        <div>
          <h2>One-Time Login</h2>
          <p>One-time login link:</p>
          <input
            type="text"
            value={link}
            readOnly
            style={{ width: '100%' }}
          />
          <button onClick={handleLoginWithToken}>Login</button>
          {message && <p style={{ color: 'green' }}>{message}</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default LinkLogin;
