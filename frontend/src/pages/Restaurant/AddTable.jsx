import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';

const AddTable = () => {
  const [formData, setFormData] = useState({
    number: '',
    x_position: '',
    y_position: '',
    capacity: '',
  });

  const [floorPlanImage, setFloorPlanImage] = useState(null);
  const [tables, setTables] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/dashboard/tables/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTables(res.data);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add the table
      await axios.post('http://127.0.0.1:8000/api/dashboard/tables/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Upload floor plan if selected
      if (floorPlanImage) {
        const imageForm = new FormData();
        imageForm.append('floor_plan', floorPlanImage);

        await axios.put('http://127.0.0.1:8000/api/dashboard/restaurant-dashboard/', imageForm, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setMessage('✅ Table and floor plan added successfully!');
      setFormData({ number: '', x_position: '', y_position: '', capacity: '' });
      setFloorPlanImage(null);
      fetchTables();

    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to add table or upload floor plan.');
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa, #e0f7fa)' }}>
      <Sidebar />

      <div className="container py-5 px-4">
        <div className="bg-white rounded-4 shadow-sm p-4 mb-5">
          <h2 className="mb-4 fw-bold text-primary">Add New Table</h2>

          {message && (
            <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} rounded-3 fade show`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-medium">Table Number</label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3 border-1"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  required
                  placeholder="e.g. T1"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-medium">X Position</label>
                <input
                  type="number"
                  className="form-control form-control-lg rounded-3 border-1"
                  name="x_position"
                  value={formData.x_position}
                  onChange={handleChange}
                  required
                  placeholder="0-100"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-medium">Y Position</label>
                <input
                  type="number"
                  className="form-control form-control-lg rounded-3 border-1"
                  name="y_position"
                  value={formData.y_position}
                  onChange={handleChange}
                  required
                  placeholder="0-100"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-medium">Capacity</label>
                <input
                  type="number"
                  className="form-control form-control-lg rounded-3 border-1"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  placeholder="Number of seats"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="form-label fw-medium">Upload Floor Plan Image</label>
              <input
                type="file"
                className="form-control form-control-lg rounded-3 border-1"
                accept="image/*"
                onChange={(e) => setFloorPlanImage(e.target.files[0])}
              />
              <div className="form-text text-muted">Upload an image of your restaurant's floor plan (optional)</div>
            </div>

            <button className="btn btn-primary btn-lg rounded-3 mt-4 px-4 py-2" type="submit">
              <i className="bi bi-plus-circle me-2"></i>Add Table & Upload Floor Plan
            </button>
          </form>
        </div>

        <div className="bg-white rounded-4 shadow-sm p-4">
          <h4 className="fw-bold text-primary mb-3">
            <i className="bi bi-grid-3x3-gap me-2"></i>Existing Tables
          </h4>
          {tables.length === 0 ? (
            <p className="text-muted">No tables added yet. Add your first table above.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Table #</th>
                    <th>Position (X,Y)</th>
                    <th>Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table) => (
                    <tr key={table.id}>
                      <td><span className="badge bg-primary rounded-pill">{table.number}</span></td>
                      <td>({table.x_position}, {table.y_position})</td>
                      <td>{table.capacity} guests</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTable;