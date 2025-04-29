import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Swal from "sweetalert2";
import "../../css/BookTable.css";

const RestaurantTables = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [bookedTableIds, setBookedTableIds] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [booking, setBooking] = useState(false);
  const [profile, setProfile] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Track checked state for each menu item
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setIsLoggedIn(!!token);
  
    if (!token || role !== "customer") {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "🔐 Please login with a customer account to access the booking page.",
        confirmButtonText: "Go to Login",
      }).then(() => {
        navigate("/login");
      });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/dashboard/restaurants/${id}/details/`
        );
        setRestaurant(res.data);
      } catch (err) {
        console.error("Error loading restaurant details:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchMenuItems = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/dashboard/menu/public/?restaurant_id=${id}`
        );
        const allItems = res.data.sections.flatMap((section) => section.items);
        setMenuItems(allItems);
      } catch (err) {
        console.error("Error fetching menu:", err);
      }
    };

    const fetchCustomerProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/dashboard/customer/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchRestaurantDetails();
    fetchMenuItems();
    fetchCustomerProfile();
  }, [id]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!id || !date || !time) return;
      try {
        const res = await axios.post("http://127.0.0.1:8000/api/dashboard/table-bookings/check/", {
          restaurant_id: id,
          date: date,
          time: time,
        });
        setBookedTableIds(res.data.booked_table_ids);
      } catch (err) {
        console.error("Error checking availability:", err);
      }
    };

    checkAvailability();
  }, [id, date, time]);

  const handleItemToggle = (itemId) => {
    // Update checked state
    const newCheckedItems = { ...checkedItems };
    newCheckedItems[itemId] = !newCheckedItems[itemId];
    setCheckedItems(newCheckedItems);
    
    // Update selected items
    if (newCheckedItems[itemId]) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("🚫 You must log in to book a table.");
      return;
    }

    try {
      setBooking(true);
      const res = await axios.post(
        "http://127.0.0.1:8000/api/dashboard/table-bookings/book/",
        {
          restaurant_id: id,
          table_id: selectedTable.id,
          date,
          time,
          preordered_items: selectedItems,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const bookingId = res.data.booking_id || res.data.id;
      
      setMessage(res.data.message || "Booking successful!");
      
      if (selectedItems.length > 0) {
        const result = await Swal.fire({
          icon: "success",
          title: "Booking Confirmed!",
          text: "Would you like to pay for your preorder now?",
          showCancelButton: true,
          confirmButtonText: "💳 Yes, pay now",
          cancelButtonText: "🏬 No, I will pay at the restaurant",
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
      
      setTimeout(() => {
        setSelectedTable(null);
        setSelectedItems([]);
        setCheckedItems({});
      }, 2000);
    } catch (err) {
      setMessage(
        "Booking failed: " + (err.response?.data?.message || "Please try again.")
      );
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="booking-container">
        <h2 className="booking-title">Reserve Your Table</h2>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading restaurant layout...</p>
          </div>
        ) : restaurant ? (
          <>
            <div className="date-time-section">
              <div className="form-group">
                <label>Date</label>
                <div className="input-with-icon">
                  <input
                    type="date"
                    className="custom-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                  <i className="time-icon"></i>
                </div>
              </div>
            </div>

            <div className="reservation-content">
              <TableOverlay
                tables={restaurant.tables}
                floorPlan={restaurant.floor_plan}
                onTableSelect={setSelectedTable}
                bookedTableIds={bookedTableIds}
                selectedTable={selectedTable}
              />

              {selectedTable && (
                <div className="booking-form-container">
                  <div className="booking-form-card">
                    <h4 className="booking-form-title">
                      <span className="table-number-badge">Table {selectedTable.number}</span>
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
                      
                      <div className="form-group menu-section">
                        <label>Preorder Menu Items</label>
                        <div className="menu-items-container">
                          {menuItems.map((item) => (
                            <div key={item.id} className="menu-item-checkbox">
                              <input
                                type="checkbox"
                                id={`item-${item.id}`}
                                checked={!!checkedItems[item.id]}
                                onChange={() => handleItemToggle(item.id)}
                              />
                              <label htmlFor={`item-${item.id}`}>
                                <span className="menu-item-name">{item.name}</span>
                                <span className="menu-item-price">Rs. {item.price}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {profile?.food_preferences || profile?.allergies ? (
                        <div className="customer-preferences">
                          <h5>🧑‍🍳 Your Preferences & Allergies</h5>
                          <p><strong>Food Preferences:</strong> {profile.food_preferences || "None provided"}</p>
                          <p><strong>Allergies:</strong> {profile.allergies || "None provided"}</p>
                        </div>
                      ) : null}
                      
                      <div className="booking-form-actions">
                        <button type="submit" className="btn-confirm" disabled={booking}>
                          {booking ? "Processing..." : "Confirm Reservation"}
                        </button>
                        <button 
                          type="button" 
                          className="btn-cancel" 
                          onClick={() => setSelectedTable(null)}
                        >
                          Cancel
                        </button>
                      </div>
                      
                      {message && <div className="booking-message">{message}</div>}
                    </form>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <p>Restaurant not found.</p>
        )}
      </div>
    </>
  );
};

const TableOverlay = ({
  tables = [],
  floorPlan,
  onTableSelect,
  bookedTableIds = [],
  selectedTable,
}) => {
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
              className={`table-box ${
                selectedTable?.id === table.id
                  ? "selected"
                  : isBooked(table.id)
                  ? "occupied"
                  : "available"
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

export default RestaurantTables;