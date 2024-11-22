import React, { useState } from 'react';
import axios from 'axios';
import '../Form.css';
import { useNavigate } from 'react-router-dom';

const PwdLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    contact: '',
    password: '',
  });

  const [isEmail, setIsEmail] = useState(true); // Track if the user is using email or phone
  const [error, setError] = useState(''); // Error state for validation messages
  const [successMessage, setSuccessMessage] = useState(''); // Success message for successful login
  const [isLoading, setIsLoading] = useState(false); // Track loading state for API call

  // Regular expression for validating email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Regular expression for validating mobile number (10 digits)
  const phoneRegex = /^[0-9]{10}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    // Validate email or phone number based on selected type
    if (isEmail) {
      if (!emailRegex.test(formData.contact)) {
        setError('Please enter a valid email address.');
        setIsLoading(false);
        return;
      }
    } else {
      if (!phoneRegex.test(formData.contact)) {
        setError('Please enter a valid 10-digit mobile number.');
        setIsLoading(false);
        return;
      }
    }

    try {
      // Make API call to login the user
      const response = await axios.post('http://localhost:8000/login', {
        contact: formData.contact,
        password: formData.password,
      });
      setSuccessMessage(response.data.message); // Display success message
      // You can handle storing the token here if needed
      localStorage.setItem('auth_token', response.data.token); 
      
      setTimeout(()=>navigate("/"),500)
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message); // Display error from backend
      } else {
        setError('An error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactTypeChange = () => {
    setIsEmail(!isEmail); // Toggle between email and mobile number
    setFormData({ ...formData, contact: '' }); // Clear contact field when switching
    setError(''); // Clear error when switching input type
    setSuccessMessage(''); // Clear success message when switching input type
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {/* Toggle between Email and Mobile Number */}
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

        {/* Conditionally render Email or Mobile Number input */}
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

        {error && <div className="error">{error}</div>} {/* Show error message */}
        {successMessage && <div className="success">{successMessage}</div>} {/* Show success message */}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default PwdLogin;
