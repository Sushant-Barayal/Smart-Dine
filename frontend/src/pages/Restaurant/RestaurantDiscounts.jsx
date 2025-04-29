import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import '../../css/RestaurantDashboard.css';

const RestaurantDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    percentage: '',
    start_date: '',
    end_date: '',
    is_global: false,
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/dashboard/discounts/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscounts(res.data);
    } catch (err) {
      console.error('❌ Error fetching discounts:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/dashboard/discounts/', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({
        name: '',
        description: '',
        percentage: '',
        start_date: '',
        end_date: '',
        is_global: false,
      });
      fetchDiscounts();
    } catch (err) {
      console.error('❌ Failed to add discount:', err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/dashboard/discounts/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDiscounts();
    } catch (err) {
      console.error('❌ Failed to delete discount', err);
    }
  };

  return (
    <div className="restaurant-layout">
      <Sidebar />
      <div className="dashboard-content">
        <h2 className="mb-4">🏷️ Manage Discounts</h2>

        {/* Add Discount Form */}
        <div className="card shadow-sm mb-5">
          <div className="card-header bg-warning text-dark">
            <h5 className="mb-0">Add New Discount</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Discount Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="number"
                  name="percentage"
                  placeholder="Discount %"
                  value={formData.percentage}
                  onChange={handleChange}
                  className="form-control"
                  required
                  min="1"
                  max="100"
                />
              </div>
              <div className="col-md-12">
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows={2}
                />
              </div>
              <div className="col-md-6">
                <label>Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <label>End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-12 d-flex align-items-center">
                <input
                  type="checkbox"
                  id="is_global"
                  name="is_global"
                  checked={formData.is_global}
                  onChange={handleChange}
                  className="form-check-input me-2"
                />
                <label htmlFor="is_global">Apply Globally (for all restaurants)</label>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-warning w-100">Add Discount</button>
              </div>
            </form>
          </div>
        </div>

        {/* Discount List */}
        <h4 className="mb-3">📋 Your Discounts</h4>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {discounts.length === 0 ? (
            <p className="text-muted">No discounts added yet.</p>
          ) : (
            discounts.map((d) => (
              <div key={d.id} className="col">
                <div className="card h-100 border border-warning">
                  <div className="card-body">
                    <h5 className="card-title text-dark fw-bold">{d.name}</h5>
                    <p className="card-text text-muted">{d.description}</p>
                    <p className="mb-1"><strong>Discount:</strong> {d.percentage}%</p>
                    <p className="mb-1"><strong>Valid:</strong> {d.start_date} → {d.end_date}</p>
                    {d.is_global && <span className="badge bg-primary">🌐 Global Discount</span>}
                  </div>
                  <div className="card-footer bg-light text-end">
                    <button onClick={() => handleDelete(d.id)} className="btn btn-sm btn-outline-danger">Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDiscounts;
