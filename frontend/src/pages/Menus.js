import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './../components/Navbar';

const Menu = () => {
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/dashboard/menus/public/')
      .then((res) => setMenus(res.data))
      .catch((err) => console.error('Failed to fetch menus:', err));
  }, []);

  return (
    <>
      <Navbar />
      
      {/* Hero Section with Background Image */}
      <div 
        className="py-5" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(121, 85, 61, 0.8)',
          }}
        ></div>
        
        <div className="container position-relative text-center text-white py-4">
          <h1 className="display-4 fw-bold mb-2">Our Menus</h1>
          <p className="lead">Explore mouth-watering dishes from our partner restaurants.</p>
        </div>
      </div>

      {/* Menu Items Section with Background Image */}
      <div 
        className="menu-section py-5" 
        style={{
          backgroundImage: "url('http://127.0.0.1:8000/media/restaurant_photos/Menus.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        
      >
        <div className="container">
          <div className="row g-4">
            {menus.length === 0 ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Looking for delicious options...</p>
              </div>
            ) : (
              menus.map((menu) => (
                <div key={menu.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm overflow-hidden">
                    {menu.photo ? (
                      <div className="card-img-container" style={{ height: "220px", overflow: "hidden" }}>
                        <img
                          src={`http://127.0.0.1:8000${menu.photo}`}
                          alt={menu.name}
                          className="card-img-top"
                          style={{ height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      </div>
                    ) : (
                      <div className="bg-light" style={{ height: "220px" }}>
                        <div className="d-flex align-items-center justify-content-center h-100 text-secondary">
                          <span>No image available</span>
                        </div>
                      </div>
                    )}

                    <div className="card-body" style={{ backgroundColor: "#faf7f2" }}>
                      <h5 className="card-title fw-bold" style={{ color: "#79553d" }}>{menu.name}</h5>
                      <p className="card-text text-muted small">{menu.description}</p>
                      <p className="mb-1 fw-semibold">Price: <span style={{ color: "#79553d" }}>Rs {menu.price}</span></p>
                      <p className="mb-3 text-muted small">
                        <i className="bi bi-shop me-1"></i>
                        {menu.restaurant?.name || 'Unknown'}
                      </p>
                      
                      <div className="d-flex gap-2">
                        <button className="btn w-50" style={{ backgroundColor: "#79553d", color: "white" }}>
                          View Details
                        </button>
                        <button className="btn btn-outline w-50" style={{ borderColor: "#79553d", color: "#79553d" }}>
                          View Restaurant
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
    
    </>
  );
};

export default Menu;
