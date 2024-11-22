import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PwdLogin from './components/PwdLogin';
import LinkLogin from './components/LinkLogin';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pwdLogin" element={<PwdLogin />} />
          <Route path="/linkLogin" element={<LinkLogin />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
