import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import '../../css/AdminStatistics.css';

const AdminStatistics = () => {
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/admin/statistics/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setStats(res.data))
    .catch(err => console.error("Error fetching statistics", err));
  }, [token]);

  if (!stats) return <div>Loading statistics...</div>;

  return (
    <div className="admin-main-content">
      <h2>📊 Admin Statistics Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">👥 Total Users: {stats.total_users}</div>
        <div className="stat-card">🏪 Restaurants: {stats.total_restaurants}</div>
        <div className="stat-card">📋 Menus: {stats.total_menus}</div>
        <div className="stat-card">📅 Bookings: {stats.total_bookings}</div>
        <div className="stat-card">💳 Payments: {stats.total_payments}</div>
        <div className="stat-card">🔖 Discounts: {stats.total_discounts}</div>
        <div className="stat-card">🔐 RFID Check-ins: {stats.total_rfid_checkins}</div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h4>User Roles</h4>
          <Pie data={{
            labels: ['Admin', 'Customer', 'Restaurant'],
            datasets: [{
              data: stats.user_roles,
              backgroundColor: ['#e74c3c', '#3498db', '#2ecc71'],
            }]
          }} />
        </div>

        <div className="chart-container">
          <h4>Monthly Bookings</h4>
          <Line data={{
            labels: stats.bookings_months,
            datasets: [{
              label: 'Bookings',
              data: stats.bookings_counts,
              borderColor: '#8e44ad',
              tension: 0.3,
            }]
          }} />
        </div>

        <div className="chart-container">
          <h4>Payments Overview</h4>
          <Bar data={{
            labels: ['Received', 'Pending'],
            datasets: [{
              label: 'Amount (NPR)',
              data: stats.payments_data,
              backgroundColor: ['#27ae60', '#f39c12']
            }]
          }} />
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
