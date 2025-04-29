import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import "../css/CustomerDashboard.css";

const CustomerDashboard = () => {
  const [profile, setProfile] = useState({
    email: '',
    username: '',
    phone_number: '',
    location: '',
    food_preferences: '',
    allergies: '',
    customer_photo: null,
  });

  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [showCancelled, setShowCancelled] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://127.0.0.1:8000/api/dashboard/customer/profile/', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setProfile({
            ...data,
            customer_photo: data.customer_photo ? `http://127.0.0.1:8000${data.customer_photo}` : null,
          });
        } else {
          setError(data.detail || 'Failed to fetch profile');
        }
      } catch {
        setError('Something went wrong. Please try again later.');
      }
    };

    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://127.0.0.1:8000/api/dashboard/table-bookings/my/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setBookings(data);
      } catch (err) {
        console.error('Failed to load bookings', err);
      }
    };

    fetchProfile();
    fetchBookings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
      setProfile({
        ...profile,
        customer_photo: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('phone_number', profile.phone_number || '');
    formData.append('location', profile.location || '');
    formData.append('food_preferences', profile.food_preferences || '');
    formData.append('allergies', profile.allergies || '');
    if (photo) formData.append('customer_photo', photo);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/dashboard/customer/profile/', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert('Profile updated successfully');
        setProfile({
          ...profile,
          customer_photo: data.customer_photo ? `http://127.0.0.1:8000${data.customer_photo}` : null,
        });
      } else {
        setError(data.detail || 'Failed to update profile');
      }
    } catch {
      setError('Something went wrong. Please try again later.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmCancel) return;
  
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/dashboard/table-bookings/${bookingId}/cancel-by-customer/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (res.ok) {
        alert("Booking canceled successfully.");
        setBookings(prev =>
          prev.map(b => b.id === bookingId ? { ...b, is_cancelled: true } : b)
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to cancel booking.");
      }
    } catch {
      alert("Something went wrong.");
    }
  };
  
  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="container mt-5">
        <div className="dashboard-header">
          <div className="profile-pic-container">
            {profile.customer_photo ? (
              <img src={profile.customer_photo} alt="Profile" className="profile-pic" />
            ) : (
              <div className="profile-pic-placeholder">
                {profile.username ? profile.username.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            <div className="profile-upload-btn" onClick={handlePhotoClick}>
              <i className="bi bi-camera"></i>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              className="hidden-file-input"
            />
          </div>
          <div className="user-info">
            <h3>{profile.username || 'Customer'}</h3>
            <p className="text-muted">{profile.email}</p>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="profile-content">
          <div className="profile-sections">
            <div className="profile-details card">
              <div className="card-header">
                <h4 className="profile-section-title mb-0">Profile Details</h4>
              </div>
              <div className="card-body">
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Phone Number:</span>
                  <span className="profile-detail-value">{profile.phone_number || 'Not provided'}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Location:</span>
                  <span className="profile-detail-value">{profile.location || 'Not provided'}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Food Preferences:</span>
                  <p className="profile-detail-value">{profile.food_preferences || 'Not provided'}</p>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Allergies:</span>
                  <p className="profile-detail-value">{profile.allergies || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="update-form card">
              <div className="card-header">
                <h4 className="profile-section-title mb-0">Update Profile</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="phone_number" className="form-label">Phone Number</label>
                    <input
                      type="text"
                      id="phone_number"
                      name="phone_number"
                      className="form-control"
                      value={profile.phone_number || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      className="form-control"
                      value={profile.location || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="food_preferences" className="form-label">Food Preferences</label>
                    <textarea
                      id="food_preferences"
                      name="food_preferences"
                      className="form-control"
                      value={profile.food_preferences || ''}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="allergies" className="form-label">Allergies</label>
                    <textarea
                      id="allergies"
                      name="allergies"
                      className="form-control"
                      value={profile.allergies || ''}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="booking-section card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="profile-section-title mb-0">My Bookings</h4>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowCancelled(prev => !prev)}
              >
                {showCancelled ? "Hide Cancelled Bookings" : "Show Cancelled Bookings"}
              </button>
            </div>
            <div className="card-body">
              {bookings.length === 0 ? (
                <div className="no-bookings">
                  <p>You have no bookings yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table booking-table">
                    <thead>
                      <tr>
                        <th>Restaurant</th>
                        <th>Table</th>
                        <th>Preordered Items</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings
                        .filter((booking) => showCancelled || !booking.is_cancelled)
                        .map((booking) => (
                          <tr key={booking.id} className={booking.is_cancelled ? "cancelled-booking" : ""}>
                            <td>{booking.restaurant_name || 'N/A'}</td>
                            <td>{booking.table_number || '-'}</td>
                            <td>
                              {booking.preordered_items && booking.preordered_items.length > 0 ? (
                                <ul className="preordered-items">
                                  {booking.preordered_items.map((item) => (
                                    <li key={item.id}>
                                      <span className="item-name">{item.name}</span>
                                      <span className="item-price">Rs. {item.price}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="no-items">-</span>
                              )}
                            </td>
                            <td>{booking.date}</td>
                            <td>{booking.time}</td>
                            <td>
                              {booking.is_cancelled ? (
                                <span className="status cancelled">Cancelled</span>
                              ) : booking.is_confirmed ? (
                                <span className="status confirmed">Confirmed</span>
                              ) : (
                                <span className="status pending">Pending</span>
                              )}
                            </td>
                            <td>
                              {!booking.is_confirmed && !booking.is_cancelled ? (
                                <button 
                                  className="btn btn-sm btn-danger cancel-btn"
                                  onClick={() => handleCancelBooking(booking.id)}
                                >
                                  Cancel
                                </button>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;