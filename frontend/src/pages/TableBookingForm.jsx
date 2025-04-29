import React, { useState } from 'react';
import axios from 'axios';
import "../css/TableBook.css";
import Swal from 'sweetalert2';

const TableBookingForm = ({ table, restaurantId, onClose, menuItems = [] }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [booking, setBooking] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [showPreorderPopup, setShowPreorderPopup] = useState(false);

  const handleItemToggle = (itemId) => {
    const newCheckedItems = { ...checkedItems };
    newCheckedItems[itemId] = !newCheckedItems[itemId];
    setCheckedItems(newCheckedItems);

    if (newCheckedItems[itemId]) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('🚫 You must log in to book a table.');
      return;
    }

    try {
      setBooking(true);
      const res = await axios.post(
        'http://127.0.0.1:8000/api/dashboard/table-bookings/book/',
        {
          restaurant_id: restaurantId,
          table_id: table.id,
          date,
          time,
          preordered_items: selectedItems,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const bookingId = res.data.booking_id || res.data.id;
      setMessage(res.data.message || 'Booking successful!');

      if (selectedItems.length > 0) {
        const result = await Swal.fire({
          icon: 'success',
          title: 'Booking Confirmed!',
          text: 'Would you like to pay for your preorder now?',
          showCancelButton: true,
          confirmButtonText: '💳 Yes, pay now',
          cancelButtonText: '🏬 No, I will pay at the restaurant',
        });

        if (result.isConfirmed) {
          const payRes = await axios.post(
            `http://127.0.0.1:8000/api/dashboard/table-bookings/${bookingId}/pay/`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (payRes.data.payment_url) {
            window.open(payRes.data.payment_url, "_blank");
          } else {
            Swal.fire("Oops!", "⚠️ Failed to initiate payment.", "error");
          }
        }
      }

      setTimeout(onClose, 2000);
    } catch (error) {
      setMessage('Booking failed: ' + (error.response?.data?.message || 'Please try again.'));
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="booking-form-container">
      <div className="booking-form-card">
        <h4 className="booking-form-title">
          <span className="table-number-badge">Table {table.number}</span>
          Reservation Details
        </h4>
        <form onSubmit={handleBooking}>
          <div className="form-group">
            <label>Date</label>
            <div className="input-with-icon">
              <input
                type="date"
                className="form-control custom-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <i className="calendar-icon"></i>
            </div>
          </div>

          <div className="form-group">
            <label>Time</label>
            <div className="input-with-icon">
              <input
                type="time"
                className="form-control custom-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
              <i className="time-icon"></i>
            </div>
          </div>

          <div className="form-group">
            <label>Preorder Menu Items</label>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setShowPreorderPopup(true)}
            >
              🍽️ Select Preorder Items ({selectedItems.length})
            </button>
          </div>

          <div className="booking-form-actions">
            <button type="submit" className="btn-confirm" disabled={booking}>
              {booking ? 'Processing...' : 'Confirm Reservation'}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>

          {message && <div className="booking-message">{message}</div>}
        </form>
      </div>

      {/* Preorder Popup Modal */}
      {showPreorderPopup && (
        <div className="preorder-popup">
          <div className="preorder-popup-content">
            <h5>Select Preorder Items</h5>
            <div className="preorder-grid">
              {menuItems.map((item) => {
                const isSelected = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    className={`preorder-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleItemToggle(item.id)}
                  >
                    <h6>{item.name}</h6>
                    <p>Rs. {item.price}</p>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleItemToggle(item.id)}
                    />
                  </div>
                );
              })}
            </div>
            <div className="preorder-popup-actions">
              <button className="btn btn-secondary mt-3" onClick={() => setShowPreorderPopup(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableBookingForm;
