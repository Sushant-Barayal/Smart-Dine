import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <h3 className="sidebar-title">Restaurant Panel</h3>
      <ul className="sidebar-links">
        <li className={location.pathname === "/restaurant-dashboard" ? "active" : ""}>
          <Link to="/restaurant-dashboard">📊 Dashboard</Link>
        </li>
        <li className={location.pathname === "/restaurant/details" ? "active" : ""}>
          <Link to="/restaurant/details">🏠 Restaurant Details</Link>
        </li>
        <li className={location.pathname === "/menu-dashboard" ? "active" : ""}>
          <Link to="/menu-dashboard">📋 Menu Dashboard</Link>
        </li>
        <li className={location.pathname === "/restaurant/table-booking" ? "active" : ""}>
          <Link to="/restaurant/table-booking">🪑 Table Booking</Link>
        </li>
        <li className={location.pathname === "/restaurant/add-table" ? "active" : ""}>
          <Link to="/restaurant/add-table">➕ Add Table</Link>
        </li>
        <li className={location.pathname === "/restaurant/customer-checkins" ? "active" : ""}>
          <Link to="/restaurant/customer-checkins">✅ Customer Check-ins</Link>
        </li>
        <li className={location.pathname === "/restaurant/discounts" ? "active" : ""}>
  <Link to="/restaurant/discounts">🏷️ Manage Discounts</Link>
</li>

      </ul>
    </div>
  );
};

export default Sidebar;
