import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const registerData = {
      username,
      email,
      password,
      role,
    };

    // Make API request to register the user
    fetch('http://127.0.0.1:8000/api/auth/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          if (role === 'customer') {
            navigate('/customer-dashboard');
          } else if (role === 'restaurant') {
            navigate('/restaurant-dashboard');
          }
        } else {
          setError(data.error || 'User Already Exists');
        }
      })
      .catch((err) => {
        setError('An error occurred. Please try again later.');
        console.error(err);
      });
  };

  return (
    <div className="register-page">
      <Navbar />
      <div className="register-container">
        <div className="row h-100">
          <div className="col-md-6 register-form-container">
            <div className="register-form-inner">
              <h2 className="register-title">Create Account</h2>
              <p className="register-subtitle">Join Smart Dine and start your journey</p>
              
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group mb-4">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                  />
                </div>
                
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
                    placeholder="Create a password"
                    required
                  />
                </div>
                
                <div className="form-group mb-4">
                  <label htmlFor="role">Register as</label>
                  <select
                    id="role"
                    className="form-control"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    <option value="customer">Customer</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>
                
                <button type="submit" className="btn btn-register w-100">
                  Create Account
                </button>
              </form>
              
              <div className="register-footer">
                <p>Already have an account? <Link to="/login" className="login-link">Login here</Link></p>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 register-image-container">
            <img 
              src="http://127.0.0.1:8000/media/restaurant_photos/SmartDineLogin.png" 
              alt="Smart Dine Experience" 
              className="register-image"
            />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .register-page {
          min-height: 100vh;
          background-color: #f8f5f2;
        }
        
        .register-container {
          max-width: 1200px;
          margin: 2rem auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          height: calc(100vh - 150px);
        }
        
        .register-form-container {
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .register-form-inner {
          padding: 3rem;
          max-width: 90%;
          margin: 0 auto;
        }
        
        .register-title {
          color: #5c3b2e;
          font-weight: 700;
          margin-bottom: 0.5rem;
          font-size: 2rem;
        }
        
        .register-subtitle {
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
        
        .btn-register {
          background-color: #b48c66;
          border: none;
          color: white;
          padding: 14px;
          border-radius: 8px;
          font-weight: 600;
          margin-top: 1rem;
          transition: background-color 0.3s ease;
        }
        
        .btn-register:hover {
          background-color: #9c785a;
        }
        
        .register-footer {
          margin-top: 2rem;
          text-align: center;
          color: #8a7968;
        }
        
        .login-link {
          color: #b48c66;
          font-weight: 600;
          text-decoration: none;
        }
        
        .login-link:hover {
          text-decoration: underline;
        }
        
        .register-image-container {
          padding: 0;
          height: 100%;
        }
        
        .register-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        @media (max-width: 768px) {
          .register-image-container {
            display: none;
          }
          
          .register-container {
            height: auto;
          }
          
          .register-form-container {
            padding: 2rem 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;