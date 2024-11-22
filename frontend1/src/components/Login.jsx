import React from 'react';
import { useNavigate } from 'react-router-dom';
const Login=()=>{
    const navigate = useNavigate();
    const handleRegisterClick = () => {
        navigate('/pwdLogin');
      };
    
      const handleLoginClick = () => {
        navigate('/linkLogin');
      };
    return(<div 
        style={{
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh', 
          flexDirection: 'column'
        }}
      >
        <button 
          style={{ marginBottom: '10px' }} 
          onClick={handleRegisterClick}
        >
          Login With Password
        </button>
        <button onClick={handleLoginClick}>Login With one time Link</button>
      </div>)
}

export default Login;