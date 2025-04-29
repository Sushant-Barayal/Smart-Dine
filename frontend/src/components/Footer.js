import React from 'react';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-wrapper">

        <div className="footer-content">
          {/* Column 1: About Us */}
          <div className="footer-section">
            <h5 className="footer-heading">About Us</h5>
            <p className="footer-text">
              We are a platform to help food lovers discover great restaurants. Whether you're looking for a cozy cafe or a fine dining experience, we've got you covered.
            </p>
          </div>

          {/* Column 2: Useful Links */}
          <div className="footer-section">
            <h5 className="footer-heading">Useful Links</h5>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/restaurants">Restaurants</a></li>
              <li><a href="/menu">Menu</a></li>
              <li><a href="/login">Login</a></li>
            </ul>
          </div>

          {/* Column 3: Social Media */}
          <div className="footer-section">
            <h5 className="footer-heading">Follow Us</h5>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-divider"></div>
        
        <div className="footer-copyright">
          <p>© 2025 Smart Dine. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;