import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import RestaurantDashboard from './pages/Restaurant/RestaurantDashboard';
import Home from './pages/Home';
import Restaurants from './pages/Restaurants';
import Menus from './pages/Menus';
import BookTable from './pages/Restaurant/BookTable';
import MenuDashboard from './pages/Restaurant/MenuDashboard';
import PrivateRoute from './components/PrivateRoute';
import Footer from './components/Footer';
import TableOverlay from './pages/TableOverlay';
import TableBookingDashboard from './pages/Restaurant/TableBookingDashboard';
import RestaurantDetails from './pages/Restaurant/RestaurantDetails';
import AddTable from './pages/Restaurant/AddTable';
import RestaurantDetail from './pages/Restaurant/RestaurantDetail';
import RestaurantMenus from './pages/Restaurant/RestaurantMenus';
import RestaurantTables from './pages/Restaurant/RestaurantTables';
import KhaltiVerify from './pages/Payment/KhaltiVerify';
import CustomerCheckins from './pages/Restaurant/CustomerCheckins';
import RestaurantDiscounts from './pages/Restaurant/RestaurantDiscounts';
import AdminApproveRestaurants from './pages/Admin/AdminApproveRestaurants';
import AdminAssignRFID from './pages/Admin/AdminAssignRFID';
import AdminUserManagement from './pages/Admin/AdminUserManagement';
import AdminLayout from './Layouts/AdminLayout';
import AdminStatistics from './pages/Admin/AdminStatistics';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="page-wrapper">
        <Routes>

          {/* ✅ Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/menus" element={<Menus />} />
          <Route path="/book-table" element={<BookTable />} />
          <Route path="/table-layout" element={<TableOverlay />} />
          <Route path="/restaurant/table-booking" element={<TableBookingDashboard />} />
          <Route path="/restaurant/details" element={<RestaurantDetails />} />
          <Route path="/restaurant/add-table" element={<AddTable />} />
          <Route path="/restaurant/:id/detail" element={<RestaurantDetail />} />
          <Route path="/restaurant/:id/menus" element={<RestaurantMenus />} />
          <Route path="/restaurant/:id/tables" element={<RestaurantTables />} />
          <Route path="/verify-payment/:bookingId" element={<KhaltiVerify />} />

          {/* ✅ Customer Protected */}
          <Route element={<PrivateRoute allowedRoles={['customer']} />}>
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          </Route>

          {/* ✅ Restaurant Protected */}
          <Route element={<PrivateRoute allowedRoles={['restaurant']} />}>
            <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
            <Route path="/menu-dashboard" element={<MenuDashboard />} />
            <Route path="/restaurant/customer-checkins" element={<CustomerCheckins />} />
            <Route path="/restaurant/discounts" element={<RestaurantDiscounts />} />
          </Route>

          {/* ✅ Admin Protected Routes (Nested under /admin) */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="approve-restaurants" element={<AdminApproveRestaurants />} />
              <Route path="assign-rfid" element={<AdminAssignRFID />} />
              <Route path="users" element={<AdminUserManagement />} />
              <Route path="statistics" element={<AdminStatistics />} />
              <Route path="*" element={<Navigate to="/admin" />} />
            </Route>
          </Route>

          
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
