import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear everything manually
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    logout();  // Optional - clears auth context if needed
    navigate('/'); // Redirect to homepage
  };

  const handleProfileClick = () => {
    const role = localStorage.getItem('role');
    if (role === 'restaurant') {
      navigate('/restaurant-dashboard');
    } else if (role === 'customer') {
      navigate('/customer-dashboard');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#9c785a', padding: '12px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/" style={{ 
          color: '#fff', 
          fontSize: '28px', 
          fontWeight: '600',
          fontFamily: 'Playfair Display, serif' 
        }}>
          Smart Dine
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto" style={{ gap: '2rem' }}>
            <li className="nav-item">
              <Link className="nav-link" to="/restaurants" style={{ 
                color: '#fff', 
                fontSize: '18px',
                fontWeight: '500',
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
                position: 'relative',
                padding: '8px 5px'
              }}>
                Restaurants
                <span style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '2px',
                  backgroundColor: '#fff',
                  transition: 'width 0.3s ease'
                }}></span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/book-table" style={{ 
                color: '#fff', 
                fontSize: '18px',
                fontWeight: '500',
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
                position: 'relative',
                padding: '8px 5px'
              }}>
                Book a Table
                <span style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '2px',
                  backgroundColor: '#fff',
                  transition: 'width 0.3s ease'
                }}></span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/menus" style={{ 
                color: '#fff', 
                fontSize: '18px',
                fontWeight: '500',
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
                position: 'relative',
                padding: '8px 5px'
              }}>
                Menus
                <span style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '2px',
                  backgroundColor: '#fff',
                  transition: 'width 0.3s ease'
                }}></span>
              </Link>
            </li>
          </ul>

          {user ? (
            <>
              <button
                onClick={handleProfileClick}
                className="btn"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  color: '#fff',
                  fontWeight: '500',
                  padding: '8px 20px',
                  borderRadius: '25px',
                  borderColor: '#fff',
                  borderWidth: '1px',
                  transition: 'all 0.3s ease'
                }}
              >
                Profile
              </button>
              <button 
                className="btn ms-3" 
                onClick={handleLogout}
                style={{ 
                  backgroundColor: '#fff', 
                  color: '#9c785a',
                  fontWeight: '500',
                  padding: '8px 20px',
                  borderRadius: '25px',
                  transition: 'all 0.3s ease'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">
              <button 
                className="btn" 
                style={{ 
                  backgroundColor: '#fff', 
                  color: '#9c785a',
                  fontWeight: '500',
                  padding: '8px 25px',
                  borderRadius: '25px',
                  transition: 'all 0.3s ease'
                }}
              >
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};



export default Navbar;