import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../../css/RestaurantDetail.css';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const currentUser = localStorage.getItem('user');

  // ✅ Fetch restaurant details
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/dashboard/restaurants/${id}/details/`);
        setRestaurant(res.data);
      } catch (err) {
        console.error("❌ Error fetching restaurant details:", err);
        Swal.fire("Error", "Failed to load restaurant details.", "error");
      }
    };

    fetchRestaurant();
    fetchReviews();
  }, [id]);

  // ✅ Fetch reviews & check if current user already reviewed
  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/dashboard/reviews/?restaurant_id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReviews(res.data);

      const alreadyReviewed = res.data.some(r => r.customer_name === currentUser);
      setHasReviewed(alreadyReviewed);
    } catch (err) {
      console.error("❌ Error fetching reviews:", err);
    }
  };

  // ✅ Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      await axios.post(
        'http://127.0.0.1:8000/api/dashboard/reviews/',
        {
          restaurant: id,
          rating: reviewRating,
          comment: reviewText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      Swal.fire("✅ Review Submitted!", "Thank you for your feedback!", "success");
      setReviewText('');
      setReviewRating(5);
      fetchReviews();
    } catch (err) {
      console.error("Review Error Response:", err.response?.data);
  
      let message = "Something went wrong.";
  
      // Try extracting a clear error message
      if (err.response?.data?.detail) {
        message = err.response.data.detail;
      } else if (err.response?.data?.non_field_errors?.[0]) {
        message = err.response.data.non_field_errors[0];
      } else if (typeof err.response?.data === "object") {
        const firstKey = Object.keys(err.response.data)[0];
        message = err.response.data[firstKey]?.[0] || message;
      }
  
      if (message.toLowerCase().includes("already reviewed")) {
        Swal.fire("⚠️ Already Reviewed", "You’ve already submitted a review for this restaurant.", "info");
      } else {
        Swal.fire("❌ Review Failed", message, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

  if (!restaurant) return <p className="text-center mt-5">Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="container mt-5 mb-5">
        <div className="restaurant-header">
          <h2 className="text-center">{restaurant.restaurant_name}</h2>
        </div>

        {/* 📸 Main Photo */}
        {restaurant.photo ? (
          <img src={restaurant.photo} alt={restaurant.restaurant_name} className="main-photo" />
        ) : (
          <div className="no-photo-placeholder text-muted">No main photo available</div>
        )}

        {/* ℹ️ Restaurant Info */}
        <div className="restaurant-info">
          <p><strong>📍 Location:</strong> {restaurant.location || 'N/A'}</p>
          <p><strong>📞 Phone:</strong> {restaurant.phone_number || 'N/A'}</p>
          <p><strong>🏠 Address:</strong> {restaurant.address || 'N/A'}</p>
          <p><strong>ℹ️ Details:</strong> {restaurant.additional_details || 'N/A'}</p>
          <p><strong>🕒 Opening Hours:</strong> {restaurant.opening_time || 'N/A'} - {restaurant.closing_time || 'N/A'}</p>
          <p><strong>📖 Description:</strong><br />{restaurant.description || 'N/A'}</p>
        </div>

        {/* 🖼️ Gallery */}
        {(restaurant.gallery1 || restaurant.gallery2 || restaurant.gallery3) && (
          <div className="gallery-container">
            <div id="restaurantGallery" className="carousel slide" data-bs-ride="carousel">
              <div className="carousel-inner">
                {restaurant.gallery1 && (
                  <div className="carousel-item active">
                    <img src={restaurant.gallery1} className="d-block w-100" alt="Gallery 1" />
                  </div>
                )}
                {restaurant.gallery2 && (
                  <div className={`carousel-item ${!restaurant.gallery1 ? 'active' : ''}`}>
                    <img src={restaurant.gallery2} className="d-block w-100" alt="Gallery 2" />
                  </div>
                )}
                {restaurant.gallery3 && (
                  <div className={`carousel-item ${(!restaurant.gallery1 && !restaurant.gallery2) ? 'active' : ''}`}>
                    <img src={restaurant.gallery3} className="d-block w-100" alt="Gallery 3" />
                  </div>
                )}
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#restaurantGallery" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#restaurantGallery" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
              </button>
            </div>
          </div>
        )}

        {/* 🗺️ Map */}
        {restaurant.map_location && (
          <div className="map-container mt-5">
            <h5>🗺️ Find Us on the Map</h5>
            <div className="ratio ratio-16x9">
              <iframe
                src={restaurant.map_location}
                title="Google Maps"
                width="100%"
                height="450"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        )}

        {/* ✍️ Submit Review */}
        {role === 'customer' && !hasReviewed && (
          <div className="mt-5">
            <h4>Leave a Review</h4>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-3">
                <label>Rating:</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(parseInt(e.target.value))}
                  className="form-select"
                  required
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r} Stars</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label>Comment:</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="form-control"
                  rows="3"
                  placeholder="Write your review..."
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {/* 🛑 Already Reviewed Message */}
        {role === 'customer' && hasReviewed && (
          <div className="alert alert-info mt-4">
            <strong>✅ You've already reviewed this restaurant.</strong>
          </div>
        )}

        {/* 💬 Reviews Section */}
        <div className="mt-5">
          <h4>What Customers Are Saying</h4>
          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet.</p>
          ) : (
            <div className="list-group">
              {reviews.map((review) => (
                <div key={review.id} className="list-group-item">
                  <strong>{review.customer_name || 'Anonymous'}:</strong> {'⭐'.repeat(review.rating)}
                  <p className="mb-0">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RestaurantDetail;
