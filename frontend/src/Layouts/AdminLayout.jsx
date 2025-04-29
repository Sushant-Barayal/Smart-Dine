import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#f9f9f9' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
