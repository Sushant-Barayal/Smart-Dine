import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';

const RestaurantDetails = () => {
  const [dashboard, setDashboard] = useState(null);
  const [formData, setFormData] = useState({
    restaurant_name: '',
    address: '',
    phone_number: '',
    location: '',
    additional_details: '',
    description: '',
    map_location: '',
    opening_time: '',
    closing_time: '',
    khalti_public_key: '',
    khalti_secret_key: '',
    photo: null,
    gallery1: null,
    gallery2: null,
    gallery3: null,
  });
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/dashboard/restaurant-dashboard/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboard(res.data);
      setFormData({
        ...res.data,
        photo: null,
        gallery1: null,
        gallery2: null,
        gallery3: null,
      });
      setIsCreating(false);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setIsCreating(true);
      } else {
        console.error('Failed to fetch dashboard:', err);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const form = new FormData();
    for (const key in formData) {
      if (formData[key]) {
        form.append(key, formData[key]);
      }
    }

    try {
      const url = 'http://127.0.0.1:8000/api/dashboard/restaurant-dashboard/';
      const method = isCreating ? 'post' : 'put';

      await axios({
        method,
        url,
        data: form,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Details saved successfully!');
      setIsCreating(false);
      fetchDashboard();
    } catch (err) {
      console.error('Error saving dashboard:', err);
      setMessage('Error saving. Please try again.');
    }
  };

  return (
    <div className="restaurant-layout d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Sidebar />
      <div className="dashboard-content p-4 flex-grow-1" style={{ backgroundColor: '#fff', maxWidth: '1200px', margin: '20px auto', borderRadius: '12px', boxShadow: '0 2px 15px rgba(0,0,0,0.08)' }}>
        <h2 className="mb-4 py-2 ps-2 border-start border-4" style={{ borderColor: '#FF6B35!important', color: '#2E3A59', fontWeight: 'bold' }}>
          {isCreating ? 'Create' : 'Update'} Restaurant Dashboard
        </h2>
        
        {message && (
          <div className="alert alert-success mb-4 fade show" role="alert" style={{ borderRadius: '8px', backgroundColor: '#E3F9E5', color: '#276749', border: 'none' }}>
            <i className="bi bi-check-circle me-2"></i>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="row g-4">
          <div className="col-12">
            <h5 className="text-secondary fw-semibold mb-3">Basic Information</h5>
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Restaurant Name</label>
                    <input type="text" className="form-control form-control-lg rounded-3" name="restaurant_name" value={formData.restaurant_name} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Phone Number</label>
                    <input type="text" className="form-control form-control-lg rounded-3" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Location</label>
                    <input type="text" className="form-control form-control-lg rounded-3" name="location" value={formData.location} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Address</label>
                    <textarea className="form-control rounded-3" name="address" value={formData.address} onChange={handleChange} rows="1" required />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-12">
            <h5 className="text-secondary fw-semibold mb-3">Details</h5>
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-medium">Description</label>
                    <textarea className="form-control rounded-3" name="description" value={formData.description} onChange={handleChange} rows="3" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-medium">Map Location (Embed URL)</label>
                    <input type="text" className="form-control rounded-3" name="map_location" value={formData.map_location} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Opening Time</label>
                    <input type="time" className="form-control rounded-3" name="opening_time" value={formData.opening_time} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Closing Time</label>
                    <input type="time" className="form-control rounded-3" name="closing_time" value={formData.closing_time} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-medium">Additional Details</label>
                    <textarea className="form-control rounded-3" name="additional_details" value={formData.additional_details} onChange={handleChange} rows="2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-12">
            <h5 className="text-secondary fw-semibold mb-3">Payment Integration</h5>
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Khalti Public Key</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      name="khalti_public_key"
                      value={formData.khalti_public_key || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Khalti Secret Key</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      name="khalti_secret_key"
                      value={formData.khalti_secret_key || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-12">
            <h5 className="text-secondary fw-semibold mb-3">Restaurant Images</h5>
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Main Photo</label>
                    <input type="file" className="form-control rounded-3" name="photo" onChange={handleChange} accept="image/*" />
                    {dashboard?.photo && <small className="text-muted d-block mt-1">Current: {dashboard.photo.split('/').pop()}</small>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Gallery Image 1</label>
                    <input type="file" className="form-control rounded-3" name="gallery1" onChange={handleChange} accept="image/*" />
                    {dashboard?.gallery1 && <small className="text-muted d-block mt-1">Current: {dashboard.gallery1.split('/').pop()}</small>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Gallery Image 2</label>
                    <input type="file" className="form-control rounded-3" name="gallery2" onChange={handleChange} accept="image/*" />
                    {dashboard?.gallery2 && <small className="text-muted d-block mt-1">Current: {dashboard.gallery2.split('/').pop()}</small>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Gallery Image 3</label>
                    <input type="file" className="form-control rounded-3" name="gallery3" onChange={handleChange} accept="image/*" />
                    {dashboard?.gallery3 && <small className="text-muted d-block mt-1">Current: {dashboard.gallery3.split('/').pop()}</small>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-lg px-5 py-2" 
              style={{ 
                backgroundColor: '#FF6B35', 
                color: 'white', 
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px rgba(255, 107, 53, 0.2)',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
              {isCreating ? 'Create Dashboard' : 'Update Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantDetails;