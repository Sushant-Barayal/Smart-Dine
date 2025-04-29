import React from 'react';
import { NavLink } from 'react-router-dom';
import '../css/AdminSidebar.css';

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar">
      <h3 className="sidebar-title">Admin Panel</h3>
      <ul className="sidebar-links">
        <li>
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>📊 Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>👥 User Management</NavLink>
        </li>
        <li>
          <NavLink to="/admin/approve-restaurants" className={({ isActive }) => isActive ? 'active' : ''}>✅ Approve Restaurants</NavLink>
        </li>
        <li>
          <NavLink to="/admin/assign-rfid" className={({ isActive }) => isActive ? 'active' : ''}>🔖 Assign RFID</NavLink>
        </li>
        <li>
        <NavLink to="/admin/statistics">📈 Statistics</NavLink>
        </li>
        
      </ul>
    </div>
  );
};

export default AdminSidebar;
