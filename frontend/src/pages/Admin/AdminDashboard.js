import React, { useContext, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [admin, setAdmin] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      logout();  // Ensure logout if no token
      navigate('/login');
      return;
    }

    fetch('http://127.0.0.1:8000/api/admin/me/', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status === 401) {
          logout();
          navigate('/login');
        }
        return res.json();
      })
      .then(data => setAdmin(data))
      .catch(err => console.error("Failed to fetch admin info", err));
  }, [token, logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard-layout" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main style={{ marginLeft: '240px', width: '100%', padding: '40px', backgroundColor: '#f9f9f9' }}>
        {/* Top Panel */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white',
          padding: '20px 30px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2c3e50' }}>
            Welcome, {admin?.first_name || 'Admin'}!
          </h2>
          <button onClick={handleLogout} style={{
            backgroundColor: '#e74c3c',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>

        {/* Render nested routes like Approve, RFID, UserMgmt */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
