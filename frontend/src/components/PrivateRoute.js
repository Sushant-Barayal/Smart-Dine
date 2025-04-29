import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  console.log("PrivateRoute - token:", token); // Debugging log
  console.log("PrivateRoute - role:", role);   // Debugging log

  if (!token) {
    return <Navigate to="/login" />; // Redirect to login if no token
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" />; // Redirect to home if the role is not in allowedRoles
  }

  return <Outlet />; // If role is valid, render the requested route
};

export default PrivateRoute;
