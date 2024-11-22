import React, { useState } from 'react';
import axios from 'axios';
import '../Form.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    contact: '',
    password: '',
  });
  const [isEmail, setIsEmail] = useState(true); 
  const [error, setError] = useState(''); 
  const [successMessage, setSuccessMessage] = useState(''); 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const navigate=useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (isEmail) {
      if (!emailRegex.test(formData.contact)) {
        setError('Please enter a valid email address.');
        return;
      }
    } else {
      if (!phoneRegex.test(formData.contact)) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
    }
    if (formData.password.length < 5) {
      setError('Password must be at least 5 characters long.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/register', {
        name: formData.username,
        contact: formData.contact,
        password: formData.password,
      });
      setSuccessMessage('User registered successfully!');
      alert("User registered successfully")
      setFormData({ username: '', contact: '', password: '' }); 
      setTimeout(()=>navigate("/"),400)

    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);  
      } else {
        setError('An error occurred during registration.');
      }
    }
  };

  const handleContactTypeChange = () => {
    setIsEmail(!isEmail); 
    setFormData({ ...formData, contact: '' }); 
    setError(''); 
    setSuccessMessage(''); 
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>
        <div className="contact-toggle">
          <label>
            <input
              type="radio"
              checked={isEmail}
              onChange={handleContactTypeChange}
            />
            Email
          </label>
          <label>
            <input
              type="radio"
              checked={!isEmail}
              onChange={handleContactTypeChange}
            />
            Mobile Number
          </label>
        </div>
        <label>
          {isEmail ? 'Email' : 'Mobile Number'}:
          <input
            type={isEmail ? 'email' : 'tel'}
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder={isEmail ? 'example@mail.com' : '9876543210'}
            required
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>

        {error && <div className="error">{error}</div>} 
        {successMessage && <div className="success">{successMessage}</div>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
