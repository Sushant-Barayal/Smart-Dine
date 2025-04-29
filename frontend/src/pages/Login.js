import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role);
  
        login(data.role);
  
        if (data.role === 'customer') {
          navigate('/customer-dashboard');
        } else if (data.role === 'restaurant') {
          navigate('/restaurant-dashboard');
        } else if (data.role === 'admin') {
          navigate('/admin');
        }
      } else {
        setError(data.detail || 'Invalid credentials');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <Navbar />
      <div className="login-container">
        <div className="row h-100">
          <div className="col-md-6 login-form-container">
            <div className="login-form-inner">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Sign in to continue to your account</p>
              
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group mb-4">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="form-group mb-4">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <button type="submit" className="btn btn-login w-100">
                  Login
                </button>
              </form>
              
              <div className="login-footer">
                <p>Don't have an account? <Link to="/register" className="register-link">Register here</Link></p>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 login-image-container">
  <img 
    src="http://127.0.0.1:8000/media/restaurant_photos/SmartDineLogin.png" 
    alt="Smart Dine Atmosphere" 
    className="login-image"
  />
</div>


        </div>
      </div>
      
      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background-color: #f8f5f2;
        }
        
        .login-container {
          max-width: 1200px;
          margin: 2rem auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          height: calc(100vh - 150px);
        }
        
        .login-form-container {
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .login-form-inner {
          padding: 3rem;
          max-width: 90%;
          margin: 0 auto;
        }
        
        .login-title {
          color: #5c3b2e;
          font-weight: 700;
          margin-bottom: 0.5rem;
          font-size: 2rem;
        }
        
        .login-subtitle {
          color: #8a7968;
          margin-bottom: 2rem;
        }
        
        .form-group label {
          color: #5c3b2e;
          font-weight: 600;
          margin-bottom: 8px;
          display: block;
        }
        
        .form-control {
          padding: 12px;
          border: 1px solid #e0d9d1;
          border-radius: 8px;
          background-color: #fdfbf9;
          transition: border-color 0.3s ease;
        }
        
        .form-control:focus {
          border-color: #b48c66;
          box-shadow: 0 0 0 3px rgba(180, 140, 102, 0.2);
        }
        
        .btn-login {
          background-color: #b48c66;
          border: none;
          color: white;
          padding: 14px;
          border-radius: 8px;
          font-weight: 600;
          margin-top: 1rem;
          transition: background-color 0.3s ease;
        }
        
        .btn-login:hover {
          background-color: #9c785a;
        }
        
        .login-footer {
          margin-top: 2rem;
          text-align: center;
          color: #8a7968;
        }
        
        .register-link {
          color: #b48c66;
          font-weight: 600;
          text-decoration: none;
        }
        
        .register-link:hover {
          text-decoration: underline;
        }
        
        .login-image-container {
          padding: 0;
          height: 100%;
        }
        
        .login-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        @media (max-width: 768px) {
          .login-image-container {
            display: none;
          }
          
          .login-container {
            height: auto;
          }
          
          .login-form-container {
            padding: 2rem 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;