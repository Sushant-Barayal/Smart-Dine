import React, { useEffect, useState, useContext } from 'react';
import Sidebar from '../../components/Sidebar';
import '../../css/RestaurantDashboard.css';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RestaurantDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // WebSocket Notification
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/staff/notifications/');

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      alert(`📣 ${data.message} — Table ${data.table}`);
    };

    socket.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    return () => socket.close(); // Cleanup
  }, []);

  // Fetch Restaurant Info
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/dashboard/restaurant-dashboard/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setRestaurant(data))
      .catch(err => console.error('Error loading restaurant info:', err));
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="restaurant-layout" style={{ background: 'linear-gradient(to right, #f8f9fa, #e9ecef)' }}>
      <Sidebar />

      <div className="dashboard-content" style={{ padding: '2rem', width: '100%' }}>

        <div className="dashboard-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <h2 className="mb-0" style={{ fontSize: '1.8rem', fontWeight: '600', color: '#2c3e50' }}>Welcome to Your Dashboard</h2>
          <button onClick={handleLogout} className="btn btn-danger" style={{ 
            background: '#e74c3c', 
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(231, 76, 60, 0.2)'
          }}>
            Logout
          </button>
        </div>

        {restaurant ? (
          <>
            <div className="restaurant-overview" style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div className="overview-card" style={{ 
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s ease',
                height: '100%'
              }}>
                <h4 style={{ 
                  fontSize: '1.5rem', 
                  color: '#16a085', 
                  marginBottom: '1rem',
                  borderBottom: '2px solid #16a085',
                  paddingBottom: '0.5rem'
                }}>{restaurant.restaurant_name}</h4>
                <p style={{ marginBottom: '0.7rem' }}><strong style={{ color: '#2c3e50' }}>Address:</strong> {restaurant.address}</p>
                <p style={{ marginBottom: '0.7rem' }}><strong style={{ color: '#2c3e50' }}>Location:</strong> {restaurant.location}</p>
                <p style={{ marginBottom: '0.7rem' }}><strong style={{ color: '#2c3e50' }}>Phone:</strong> {restaurant.phone_number}</p>
                <p style={{ marginBottom: '0.7rem' }}><strong style={{ color: '#2c3e50' }}>Opening Time:</strong> {restaurant.opening_time || 'N/A'}</p>
                <p style={{ marginBottom: '0.7rem' }}><strong style={{ color: '#2c3e50' }}>Closing Time:</strong> {restaurant.closing_time || 'N/A'}</p>
                <p style={{ marginBottom: '0.7rem' }}><strong style={{ color: '#2c3e50' }}>Details:</strong> {restaurant.additional_details || 'N/A'}</p>
                <p style={{ marginBottom: '0.7rem' }}><strong style={{ color: '#2c3e50' }}>Description:</strong> {restaurant.description || 'N/A'}</p>
              </div>

              {restaurant.photo && (
                <div className="photo-box" style={{ 
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <h5 style={{ 
                    fontSize: '1.2rem', 
                    color: '#16a085', 
                    marginBottom: '1rem',
                    borderBottom: '2px solid #16a085',
                    paddingBottom: '0.5rem'
                  }}>Restaurant Photo</h5>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={`http://127.0.0.1:8000${restaurant.photo}`} 
                      alt="Restaurant" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px', 
                        objectFit: 'cover',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }} 
                    />
                  </div>
                </div>
              )}
            </div>

            {restaurant.map_location && (
              <div className="mt-4" style={{ 
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                marginBottom: '2rem'
              }}>
                <h5 style={{ 
                  fontSize: '1.2rem', 
                  color: '#16a085', 
                  marginBottom: '1rem',
                  borderBottom: '2px solid #16a085',
                  paddingBottom: '0.5rem'
                }}>Map Location</h5>
                <iframe
                  src={restaurant.map_location}
                  title="Map"
                  width="100%"
                  height="350"
                  style={{ border: 0, borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            )}

            <div className="mt-4" style={{ 
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <h5 style={{ 
                fontSize: '1.2rem', 
                color: '#16a085', 
                marginBottom: '1rem',
                borderBottom: '2px solid #16a085',
                paddingBottom: '0.5rem'
              }}>Gallery</h5>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '1rem',
                justifyContent: 'space-around'
              }}>
                {[restaurant.gallery1, restaurant.gallery2, restaurant.gallery3].map((img, index) =>
                  img ? (
                    <img
                      key={index}
                      src={`http://127.0.0.1:8000${img}`}
                      alt={`Gallery ${index + 1}`}
                      style={{ 
                        width: '30%', 
                        minWidth: '250px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ) : null
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '300px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <p style={{ fontSize: '1.2rem', color: '#7f8c8d' }}>Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;