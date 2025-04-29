import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/TableBook.css';
import Navbar from '../../components/Navbar';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";


const BookTable = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [restaurant, setRestaurant] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [bookedTableIds, setBookedTableIds] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState({});


  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setIsLoggedIn(!!token);
  
    if (!token || role !== 'customer') {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: '🔐 Please login with a customer account to access the booking page.',
        confirmButtonText: 'Go to Login',
      }).then(() => {
        window.location.href = "/login";
      });
    }
  }, []);
  
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/dashboard/restaurants/public/')
      .then((res) => setRestaurants(res.data))
      .catch((err) => console.error('Failed to fetch restaurants:', err));
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedRestaurantId) return;
      try {
        setLoading(true);
        const res = await axios.get(`http://127.0.0.1:8000/api/dashboard/restaurants/${selectedRestaurantId}/details/`);
        setRestaurant(res.data);
      } catch (err) {
        console.error('Error loading restaurant:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchCustomerProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:8000/api/dashboard/customer/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setProfile(data);
        } else {
          console.error("Failed to fetch profile:", data.detail);
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    
    fetchCustomerProfile();
    
    const fetchMenuItems = async () => {
      if (!selectedRestaurantId) return;
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/dashboard/menu/public/?restaurant_id=${selectedRestaurantId}`);
        const allItems = res.data.sections.flatMap(section => section.items);
        setMenuItems(allItems);
      } catch (err) {
        console.error("Failed to load menu items", err);
      }
    };

    const checkAvailability = async () => {
      if (!selectedRestaurantId || !selectedDate || !selectedTime) return;
      try {
        const res = await axios.post('http://127.0.0.1:8000/api/dashboard/table-bookings/check/', {
          restaurant_id: selectedRestaurantId,
          date: selectedDate,
          time: selectedTime,
        });
        setBookedTableIds(res.data.booked_table_ids);
      } catch (err) {
        console.error('Error checking availability:', err);
      }
    };

    fetchDetails();
    fetchMenuItems();
    checkAvailability();
  }, [selectedRestaurantId, selectedDate, selectedTime]);

  return (
    <>
      <Navbar />
      <div className="booktable-page-wrapper">
        <div className="booking-container">
          <h2 className="booking-title">Reserve Your Table</h2>
  
          {/* Restaurant Selection */}
          <div className="restaurant-selection">
            <label className="form-label">Select Restaurant</label>
            <select
              className="restaurant-dropdown"
              value={selectedRestaurantId}
              onChange={(e) => {
                if (!isLoggedIn) {
                  Swal.fire('Login Required', '🚫 Please log in to select a restaurant.', 'warning');
                  return;
                }
                setSelectedRestaurantId(e.target.value);
              }}
            >
              <option value="">-- Choose a restaurant --</option>
              {restaurants.map((rest) => (
                <option key={rest.id} value={rest.id}>
                  {rest.restaurant_name}
                </option>
              ))}
            </select>
          </div>
  
          {/* Date & Time */}
          {isLoggedIn && selectedRestaurantId && (
            <div className="date-time-section">
              <div className="form-group">
                <label>Date</label>
                <div className="input-with-icon">
                  <input
                    type="date"
                    className="custom-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  <i className="calendar-icon"></i>
                </div>
              </div>
              <div className="form-group">
                <label>Time</label>
                <div className="input-with-icon">
                  <input
                    type="time"
                    className="custom-input"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                  <i className="time-icon"></i>
                </div>
              </div>
            </div>
          )}
  
          {/* Restaurant Floor Plan + Booking Form */}
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading restaurant layout...</p>
            </div>
          ) : (
            isLoggedIn && restaurant && (
              <div className="reservation-content">
                <TableOverlay
                  tables={restaurant.tables}
                  floorPlan={restaurant.floor_plan}
                  onTableSelect={setSelectedTable}
                  bookedTableIds={bookedTableIds}
                  selectedTable={selectedTable}
                />
                {selectedTable && (
                  <TableBookingForm
                    table={selectedTable}
                    restaurantId={selectedRestaurantId}
                    onClose={() => setSelectedTable(null)}
                    menuItems={menuItems}
                    customerPreferences={profile?.food_preferences || ''}
                    customerAllergies={profile?.allergies || ''}
                  />
                )}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
  
};

const TableOverlay = ({ tables = [], floorPlan, onTableSelect, bookedTableIds = [], selectedTable }) => {
  const isBooked = (id) => bookedTableIds.includes(id);

  return (
    <div className="floor-plan-wrapper">
      <div className="floor-plan-container">
        {floorPlan && (
          <img src={floorPlan} alt="Floor Plan" className="img-fluid mb-4" />
        )}
        <div className="table-grid">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`table-box ${selectedTable?.id === table.id
                ? 'selected'
                : isBooked(table.id)
                  ? 'occupied'
                  : 'available'
              }`}
              onClick={() => !isBooked(table.id) && onTableSelect(table)}
            >
              <span className="table-number">{table.number}</span>
            </div>
          ))}
        </div>
        <div className="table-legend">
          <div className="legend-item"><div className="legend-box available"></div> Available</div>
          <div className="legend-item"><div className="legend-box occupied"></div> Occupied</div>
          <div className="legend-item"><div className="legend-box selected"></div> Selected</div>
        </div>
      </div>
    </div>
  );
};

const TableBookingForm = ({
  table,
  restaurantId,
  onClose,
  menuItems,
  customerPreferences,
  customerAllergies
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [booking, setBooking] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  const handleItemToggle = (itemId) => {
    const updatedChecked = { ...checkedItems, [itemId]: !checkedItems[itemId] };
    setCheckedItems(updatedChecked);

    if (updatedChecked[itemId]) {
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
            <button type="button" className="btn btn-outline-primary" onClick={() => setShowPopup(true)}>
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

      {showPopup && (
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
              <button className="btn btn-secondary mt-3" onClick={() => setShowPopup(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default BookTable;