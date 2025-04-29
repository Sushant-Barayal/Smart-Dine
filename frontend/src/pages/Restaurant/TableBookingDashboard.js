import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import '../../css/RestaurantDashboard.css';

const TableBookingDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterDate, setFilterDate] = useState('');

  const token = localStorage.getItem('token');

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/dashboard/table-bookings/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📦 Bookings Fetched:", res.data);
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const handleConfirm = async (bookingId) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/dashboard/table-bookings/${bookingId}/confirm/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Booking confirmed & customer notified!');
      fetchBookings();
    } catch (err) {
      console.error('Error confirming booking:', err);
      setMessage('❌ Error confirming booking');
    }
  };

  const handleDelete = async (bookingId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this booking?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/dashboard/table-bookings/${bookingId}/cancel/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('🗑️ Booking deleted successfully');
      fetchBookings();
    } catch (err) {
      console.error('Error deleting booking:', err);
      setMessage('❌ Failed to delete booking');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Check if a message exists and auto-dismiss it after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="restaurant-layout" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e2f0ff 100%)' }}>
      <Sidebar />

      <div className="dashboard-content" style={{ padding: '20px 25px' }}>
        {message && (
          <div 
            className="alert shadow-sm text-center fw-bold" 
            role="alert"
            style={{ 
              background: message.includes('✅') ? '#d4edda' : '#f8d7da',
              color: message.includes('✅') ? '#155724' : '#721c24',
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              animation: 'fadeIn 0.3s'
            }}
          >
            {message}
          </div>
        )}

<div
    className="dashboard-header"
    style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      rowGap: '10px',
    }}
  >
    <h2
      style={{
        margin: 0,
        color: '#2c3e50',
        fontWeight: '600',
        flex: '1 1 auto',
      }}
    >
      <i
        className="fas fa-calendar-check me-2"
        style={{ color: '#3498db' }}
      ></i>
      Customer Table Bookings
    </h2>

    <div
      className="filter-tools"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        flex: '1 1 auto',
      }}
    >
      <label
        className="fw-bold mb-0"
        style={{ color: '#2c3e50', whiteSpace: 'nowrap' }}
      >
        Filter by Date:
      </label>
      <input
        type="date"
        className="form-control"
        style={{
          width: '200px',
          borderRadius: '6px',
          border: '1px solid #ced4da',
          padding: '8px 12px',
        }}
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
      />
      {filterDate && (
        <button
          className="btn btn-sm"
          onClick={() => setFilterDate('')}
          style={{
            background: '#e1e5eb',
            border: 'none',
            borderRadius: '6px',
            color: '#495057',
          }}
        >
          <i className="fas fa-times me-1"></i> Reset
        </button>
      )}
    </div>

        </div>

        <div className="table-container" style={{ 
          background: 'white', 
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
        }}>
          <div className="table-responsive">
            <table className="table table-hover" style={{ margin: 0 }}>
              <thead style={{ background: '#f8f9fa' }}>
                <tr>
                  <th style={{ borderTop: 'none', color: '#566573', fontWeight: '600' }}>Table</th>
                  <th style={{ borderTop: 'none', color: '#566573', fontWeight: '600' }}>Customer</th>
                  <th style={{ borderTop: 'none', color: '#566573', fontWeight: '600' }}>Date</th>
                  <th style={{ borderTop: 'none', color: '#566573', fontWeight: '600' }}>Time</th>
                  <th style={{ borderTop: 'none', color: '#566573', fontWeight: '600' }}>Booked At</th>
                  <th style={{ borderTop: 'none', color: '#566573', fontWeight: '600' }}>Status</th>
                  <th style={{ borderTop: 'none', color: '#566573', fontWeight: '600' }}>Payment</th>
                  <th style={{ borderTop: 'none', color: '#566573', fontWeight: '600' }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {bookings
                  .filter((booking) => !filterDate || booking.date === filterDate)
                  .map((booking) => (
                    <React.Fragment key={booking.id}>
                      <tr style={{ borderLeft: booking.is_confirmed ? '4px solid #28a745' : '4px solid #ffc107' }}>
                        <td style={{ verticalAlign: 'middle' }}>
                          <span className="badge bg-info" style={{ fontSize: '14px', fontWeight: '500' }}>
                            Table #{booking.table_number}
                          </span>
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>{booking.customer_name}</td>
                        <td style={{ verticalAlign: 'middle' }}>{booking.date}</td>
                        <td style={{ verticalAlign: 'middle' }}>{booking.time}</td>
                        <td style={{ verticalAlign: 'middle', fontSize: '0.9rem' }}>{booking.created_at || 'N/A'}</td>

                        <td style={{ verticalAlign: 'middle' }}>
                          {booking.is_confirmed ? (
                            <span className="badge bg-success" style={{ fontSize: '14px' }}>✅ Confirmed</span>
                          ) : (
                            <span className="badge bg-warning text-dark" style={{ fontSize: '14px' }}>⏳ Pending</span>
                          )}
                        </td>

                        <td style={{ verticalAlign: 'middle' }}>
                          <div className="d-flex flex-column gap-1">
                            <span>
                              💳 <span style={{ color: '#6c757d' }}>Method:</span>{' '}
                              <span className="fw-bold">
                                {booking.payment_method === 'online' ? 'Khalti' : 'Pay at Restaurant'}
                              </span>
                            </span>
                            <span>
                              💰 <span style={{ color: '#6c757d' }}>Status:</span>{' '}
                              <span className={`fw-bold ${booking.is_paid ? 'text-success' : 'text-danger'}`}>
                                {booking.is_paid ? 'Paid' : 'Unpaid'}
                              </span>
                            </span>
                            {booking.amount > 0 && (
                              <span>
                                💵 <span style={{ color: '#6c757d' }}>Amount:</span> Rs. {(booking.amount / 100).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ verticalAlign: 'middle' }}>
                          <div className="d-flex flex-column gap-2">
                            {!booking.is_confirmed && (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  style={{ borderRadius: '6px', width: '100%' }}
                                  onClick={() => handleConfirm(booking.id)}
                                >
                                  <i className="fas fa-check me-1"></i> Confirm
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  style={{ borderRadius: '6px', width: '100%' }}
                                  onClick={() => handleDelete(booking.id)}
                                >
                                  <i className="fas fa-trash me-1"></i> Delete
                                </button>
                              </>
                            )}
                            <button
                              className="btn btn-info btn-sm text-white"
                              style={{ borderRadius: '6px', width: '100%' }}
                              onClick={() =>
                                selectedBooking && selectedBooking.id === booking.id
                                  ? setSelectedBooking(null)
                                  : setSelectedBooking(booking)
                              }
                            >
                              {selectedBooking?.id === booking.id ? 'Hide Details' : 'Details'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {selectedBooking?.id === booking.id && (
                        <tr>
                          <td colSpan="8" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
                            <div className="p-3">
                              <h6 style={{ color: '#2c3e50', fontWeight: '600' }}>👤 Customer Information</h6>
                              <div className="row mt-3">
                                <div className="col-md-4">
                                  <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                      <h6 className="card-title" style={{ color: '#3498db' }}>Contact</h6>
                                      <p className="card-text"><strong>Phone:</strong> {booking.phone_number || 'Not provided'}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                      <h6 className="card-title" style={{ color: '#3498db' }}>Food Preferences</h6>
                                      <p className="card-text">{booking.food_preferences || 'None specified'}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                      <h6 className="card-title" style={{ color: '#3498db' }}>Allergies</h6>
                                      <p className="card-text">{booking.allergies || 'None specified'}</p>
                                    </div>
                                  </div>
                                </div>
                                {/* 🥗 Preordered Items */}
{booking.preordered_items && booking.preordered_items.length > 0 && (
  <div className="row mt-3">
    <div className="col-12">
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h6 className="card-title" style={{ color: '#3498db' }}>
            🥗 Preordered Items
          </h6>
          <ul className="list-group list-group-flush">
            {booking.preordered_items.map((item) => (
              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{item.name}</span>
                <span className="badge bg-primary">Rs. {item.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
)}

                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableBookingDashboard;