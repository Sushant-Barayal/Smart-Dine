import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/AdminUserManagement.css';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    axios.get('http://127.0.0.1:8000/api/admin/users/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => setUsers(res.data))
      .catch(err => console.error('❌ Error loading users:', err));
  }, [token]);

  const deactivateUser = (userId) => {
    axios.patch(
      `http://127.0.0.1:8000/api/admin/users/${userId}/deactivate/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(() => {
        setUsers(prev =>
          prev.map(user =>
            user.id === userId ? { ...user, is_active: false } : user
          )
        );
      })
      .catch(err => console.error('❌ Error deactivating user:', err));
  };

  const filteredUsers = roleFilter === 'all'
    ? users
    : users.filter(user => user.role === roleFilter);

  return (
    <div className="admin-main-content">
      <h2>User Management</h2>

      {/* Filter by Role */}
      <div className="filter-container">
        <label>Filter by Role: </label>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
          <option value="restaurant">Restaurant</option>
        </select>
      </div>

      {/* User Table */}
      <table className="admin-user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.full_name || `${user.first_name || ''} ${user.last_name || ''}`}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.is_active ? 'Active' : 'Inactive'}</td>
                <td>
                  {user.is_active ? (
                    <button
                      onClick={() => deactivateUser(user.id)}
                      className="deactivate-btn"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button className="reactivate-btn" disabled>
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No users found for selected role.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserManagement;
