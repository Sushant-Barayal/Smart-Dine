import React, { useEffect, useState } from 'react';


const AdminApproveRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch restaurants waiting for approval
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/restaurants/pending/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log("Fetched restaurants:", data);  // Debugging log

        if (response.ok) {
          setRestaurants(data);
        } else {
          setError(data.detail || 'Failed to fetch pending restaurants');
        }
      } catch (err) {
        setError('An error occurred. Please try again later.');
        console.error(err);
      }
    };

    fetchRestaurants();
  }, []);

  // Handle approval of a restaurant
  const handleApproval = async (restaurantId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/auth/approve/${restaurantId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Restaurant approved successfully ✅');
        setRestaurants(restaurants.filter((restaurant) => restaurant.id !== restaurantId));
      } else {
        setError(data.detail || 'Failed to approve the restaurant');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error(err);
    }
  };

  // Handle rejection of a restaurant
  const handleRejection = async (restaurantId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/auth/restaurants/reject/${restaurantId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Restaurant rejected successfully ❌');
        setRestaurants(restaurants.filter((restaurant) => restaurant.id !== restaurantId));
      } else {
        setError(data.detail || 'Failed to reject the restaurant');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error(err);
    }
  };

  return (
    <div>
      
      <div className="container mt-5">
        <h2 className="mb-4">Admin Dashboard</h2>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <h4>Restaurants Waiting for Approval</h4>
        <div className="list-group">
          {restaurants.length === 0 ? (
            <p>No restaurants are waiting for approval.</p>
          ) : (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="list-group-item d-flex flex-column">
                <h5><strong>Name:</strong> {restaurant.name || "N/A"}</h5>
                <p><strong>Email:</strong> {restaurant.email || "N/A"}</p>
                <p><strong>Address:</strong> {restaurant.address || "N/A"}</p>

                <div>
                  <button
                    className="btn btn-success me-2"
                    onClick={() => handleApproval(restaurant.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRejection(restaurant.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminApproveRestaurants;
