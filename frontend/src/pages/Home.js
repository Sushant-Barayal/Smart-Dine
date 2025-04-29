import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../css/Home.css';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/dashboard/restaurants/public/")
      .then(res => setRestaurants(res.data))
      .catch(err => console.error("Failed to fetch restaurants", err));

    axios.get("http://127.0.0.1:8000/api/dashboard/menus/public/")
      .then(res => setMenus(res.data))
      .catch(err => console.error("Failed to fetch menus", err));
  }, []);

  return (
    <div className="home-container">
      <Navbar />

      {/* Hero Section */}
      <div className="hero-banner">
        <div className="hero-overlay">
          <h1>Welcome to Smart Dine</h1>
          <p>Discover the best dining experiences in Kathmandu and Pokhara.</p>
          <Link to="/book-table" className="cta-button">Book a Table</Link>
        </div>
      </div>

      {/* Restaurants */}
      <section className="content-section">
        <div className="section-header">
          <h2>Restaurants</h2>
          <p className="section-subtitle">Explore the best restaurants in Kathmandu and Pokhara.</p>
        </div>
        <div className="card-grid">
          {restaurants.map(r => (
            <div key={r.id} className="restaurant-card">
              <div className="card-image-container">
                <img
                  src={
                    r.photo?.startsWith('http')
                      ? r.photo
                      : `http://127.0.0.1:8000${r.photo || '/media/restaurant_default.png'}`
                  }
                  alt={r.restaurant_name}
                />
              </div>
              <div className="card-content">
                <h3>{r.restaurant_name}</h3>
                <div className="restaurant-details">
                  <p className="cuisine">{r.cuisine || "MultiCuisine"}</p>
                  <p className="rating">{r.average_rating ? `${r.average_rating} ★` : "No ratings yet"}</p>
                </div>
                <p className="location"><i className="location-icon">📍</i> {r.address || "Kathmandu, Nepal"}</p>
                <Link to={`/restaurant/${r.id}/detail`} className="view-button">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Discounts */}
      <section className="content-section">
        <div className="section-header">
          <h2>Exclusive Offers</h2>
          <p className="section-subtitle">Special discounts and deals at our partner restaurants.</p>
        </div>
        <div className="offer-container">
          <div className="offer-card">
            <div className="offer-image">
              <img
                src="http://127.0.0.1:8000/media/menu_items/SmartDineDiscount.png"
                alt="Smart Dine Discount"
              />
              <div className="offer-badge">20% OFF</div>
            </div>
            <div className="offer-content">
              <h3>Smart Dine Festival</h3>
              <p>Limited time offer on all premium dining experiences at our partner restaurants.</p>
              <button className="claim-button">Claim Offer</button>
            </div>
          </div>
        </div>
      </section>

      {/* Menus */}
      <section className="content-section">
        <div className="section-header">
          <h2>Featured Menus</h2>
          <p className="section-subtitle">Discover curated menus from our top restaurants.</p>
        </div>
        <div className="card-grid">
          {menus.map(m => (
            <div key={m.id} className="menu-card">
              <div className="card-image-container">
                <img
                  src={`http://127.0.0.1:8000${m.photo || '/media/menu_default.png'}`}
                  alt={m.name}
                />
              </div>
              <div className="card-content">
                <h3>{m.name}</h3>
                <p className="menu-description">{m.description || "Delicious menu item"}</p>
                <Link to={`/restaurant/${m.restaurant}/menus`} className="view-button">View Menu</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;