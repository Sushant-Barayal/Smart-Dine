import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './../components/Navbar';
import "../css/Restaurants.css";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/dashboard/restaurants/public/')
      .then((res) => setRestaurants(res.data))
      .catch((err) => console.error('Failed to fetch restaurants:', err));
  }, []);

  return (
    <div className="restaurants-page">
      <Navbar />

      <div className="hero-section">
        <div className="overlay"></div>
        <div className="container hero-content">
          <h1 className="display-4 fw-bold text-white">Restaurants</h1>
          <p className="lead text-white">Explore the best restaurants in Kathmandu and Pokhara.</p>
        </div>
      </div>

      <div className="restaurant-bg-section">
        <div className="container restaurant-container">
          <div className="row g-4">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="col-lg-6 mb-4">
                <div className="restaurant-card">
                  <div className="restaurant-image">
                    <img
                      src={restaurant.photo.startsWith('http') ? restaurant.photo : `http://127.0.0.1:8000${restaurant.photo}`}
                      alt={restaurant.restaurant_name}
                    />
                  </div>

                  <div className="restaurant-details">

                    {/* Title and Rating (tight above info) */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h3 className="restaurant-name">{restaurant.restaurant_name}</h3>
                      <div className="rating">
                        {restaurant.average_rating ? (
                          <span className="rating-stars">
                            {'⭐'.repeat(Math.round(restaurant.average_rating))}
                            <span className="rating-value ms-2">({restaurant.average_rating})</span>
                          </span>
                        ) : (
                          <span className="no-rating">No Rating</span>
                        )}
                      </div>
                    </div>

                    {/* Layout in Row: Info (left) + Buttons (right) */}
                    <div className="restaurant-body">
                      <div className="restaurant-info">
                        <p><i className="bi bi-geo-alt-fill"></i> {restaurant.location}</p>
                        <p><i className="bi bi-telephone-fill"></i> {restaurant.phone_number}</p>
                        <p><i className="bi bi-info-circle-fill"></i> {restaurant.additional_details}</p>
                      </div>

                      <div className="restaurant-actions">
                        <Link to={`/restaurant/${restaurant.id}/detail`} className="btn btn-outline">View Details</Link>
                        <Link to={`/restaurant/${restaurant.id}/menus`} className="btn btn-outline">View Menus</Link>
                        <Link to={`/restaurant/${restaurant.id}/tables`} className="btn btn-solid">View Tables</Link>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Restaurants;
