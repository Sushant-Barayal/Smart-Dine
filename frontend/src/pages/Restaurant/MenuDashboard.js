import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import '../../css/MenuDashboard.css';
import '../../css/RestaurantDashboard.css';

const MenuDashboard = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [menuItem, setMenuItem] = useState({ name: '', description: '', price: '', photo: null, discount_id: '' });
  const [editingItemId, setEditingItemId] = useState(null);
  const [newSection, setNewSection] = useState({ name: '', description: '' });
  const [previewImage, setPreviewImage] = useState(null);
  const [discounts, setDiscounts] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSections();
    fetchDiscounts();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/dashboard/menu/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSections(res.data);
    } catch (err) {
      console.error('Failed to fetch menu sections', err);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/dashboard/discounts/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscounts(res.data);
    } catch (err) {
      console.error('Failed to fetch discounts', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files[0]) {
      setMenuItem((prev) => ({ ...prev, photo: files[0] }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(files[0]);
    } else {
      setMenuItem((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', menuItem.name);
    formData.append('description', menuItem.description);
    formData.append('price', menuItem.price);
    formData.append('section', selectedSection);
    if (menuItem.photo) formData.append('photo', menuItem.photo);
    if (menuItem.discount_id) formData.append('discount_id', menuItem.discount_id);

    try {
      if (editingItemId) {
        await axios.put(`http://127.0.0.1:8000/api/dashboard/menu/item/${editingItemId}/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://127.0.0.1:8000/api/dashboard/menu/item/', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setMenuItem({ name: '', description: '', price: '', photo: null, discount_id: '' });
      setPreviewImage(null);
      setEditingItemId(null);
      fetchSections();
    } catch (err) {
      console.error('Failed to save menu item', err);
    }
  };

  const handleEdit = (item) => {
    setSelectedSection(item.section);
    setMenuItem({
      name: item.name,
      description: item.description,
      price: item.price,
      discount_id: item.discount?.id || '',
      photo: null,
    });
    setPreviewImage(item.photo ? `http://127.0.0.1:8000${item.photo}` : null);
    setEditingItemId(item.id);
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/dashboard/menu/item/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSections();
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  const handleDeleteSection = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/dashboard/menu/section/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSections();
    } catch (err) {
      console.error('Failed to delete section', err);
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/dashboard/menu/section/', newSection, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewSection({ name: '', description: '' });
      fetchSections();
    } catch (err) {
      console.error('❌ Failed to create section:', err.response?.data || err.message);
    }
  };

  return (
    <div className="restaurant-layout" style={{ background: 'linear-gradient(to right, #f3e7d3, #f8f1e5)' }}>
      <Sidebar />
      <div className="dashboard-content" style={{ padding: '25px' }}>
        <h2 className="mb-4" style={{ color: '#5a3921', fontWeight: 'bold', borderBottom: '2px solid #e89f71', paddingBottom: '10px' }}>
          Menu Dashboard
        </h2>

        <div className="row">
          <div className="col-lg-4 mb-4">
            {/* Add Section */}
            <div className="card mb-4 shadow" style={{ borderRadius: '12px', border: 'none', overflow: 'hidden' }}>
              <div className="card-header" style={{ background: '#5a3921', color: 'white', border: 'none' }}>
                <h5 className="mb-0">Add New Menu Section</h5>
              </div>
              <div className="card-body" style={{ background: '#fff9f0' }}>
                <form onSubmit={handleSectionSubmit}>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Section Name"
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                    required
                    style={{ borderRadius: '8px', border: '1px solid #e0d3c3' }}
                  />
                  <textarea
                    className="form-control mb-3"
                    placeholder="Description (optional)"
                    value={newSection.description}
                    onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                    style={{ borderRadius: '8px', border: '1px solid #e0d3c3' }}
                  />
                  <button type="submit" className="btn w-100" style={{ background: '#e89f71', color: 'white', borderRadius: '8px', fontWeight: '600' }}>
                    Add Section
                  </button>
                </form>
              </div>
            </div>

            {/* Add/Edit Item */}
            <div className="card shadow" style={{ borderRadius: '12px', border: 'none', overflow: 'hidden' }}>
              <div className="card-header" style={{ background: '#e89f71', color: 'white', border: 'none' }}>
                <h5 className="mb-0">{editingItemId ? 'Edit Menu Item' : 'Add New Menu Item'}</h5>
              </div>
              <div className="card-body" style={{ background: '#fff9f0' }}>
                <form onSubmit={handleSubmit}>
                  <select
                    className="form-select mb-3"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    required
                    style={{ borderRadius: '8px', border: '1px solid #e0d3c3', padding: '10px' }}
                  >
                    <option value="">Select Section</option>
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>

                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={menuItem.name}
                      onChange={handleChange}
                      placeholder="Item Name"
                      required
                      style={{ borderRadius: '8px', border: '1px solid #e0d3c3', padding: '10px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      name="description"
                      value={menuItem.description}
                      onChange={handleChange}
                      placeholder="Description"
                      required
                      style={{ borderRadius: '8px', border: '1px solid #e0d3c3', padding: '10px', minHeight: '100px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={menuItem.price}
                      onChange={handleChange}
                      placeholder="Price"
                      step="0.01"
                      required
                      style={{ borderRadius: '8px', border: '1px solid #e0d3c3', padding: '10px' }}
                    />
                  </div>

                  {/* Discount Dropdown */}
                  <div className="mb-3">
                    <select
                      className="form-select"
                      name="discount_id"
                      value={menuItem.discount_id}
                      onChange={handleChange}
                      style={{ borderRadius: '8px', border: '1px solid #e0d3c3', padding: '10px' }}
                    >
                      <option value="">No Discount</option>
                      {discounts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.percentage}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ color: '#5a3921' }}>Item Photo</label>
                    <input
                      type="file"
                      className="form-control"
                      name="photo"
                      accept="image/*"
                      onChange={handleChange}
                      style={{ borderRadius: '8px', border: '1px solid #e0d3c3', padding: '10px' }}
                    />
                  </div>

                  {previewImage && (
                    <div className="text-center mb-3">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="img-fluid rounded" 
                        style={{ maxHeight: '200px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                      />
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn w-100" 
                    style={{ 
                      background: editingItemId ? '#5a3921' : '#5a3921', 
                      color: 'white', 
                      borderRadius: '8px', 
                      padding: '12px', 
                      fontWeight: '600',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {editingItemId ? 'Update Item' : 'Add Item'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Side: Section Items */}
          <div className="col-lg-8">
            {sections.length > 0 ? (
              sections.map((section) => (
                <div key={section.id} className="menu-section mb-5">
                  <div 
                    className="d-flex justify-content-between align-items-center mb-3" 
                    style={{ 
                      background: '#5a3921', 
                      color: 'white', 
                      padding: '10px 15px', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <h3 className="text-start mb-0">{section.name}</h3>
                    <button 
                      onClick={() => handleDeleteSection(section.id)} 
                      className="btn btn-sm" 
                      style={{ background: '#ff6b6b', color: 'white', borderRadius: '6px' }}
                    >
                      Delete Section
                    </button>
                  </div>

                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {Array.isArray(section.menu_items) && section.menu_items.length > 0 ? (
                      section.menu_items.map((item) => (
                        <div key={item.id} className="col">
                          <div 
                            className="card h-100" 
                            style={{ 
                              borderRadius: '12px', 
                              overflow: 'hidden', 
                              border: 'none',
                              boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                              transition: 'transform 0.3s ease',
                            }}
                          >
                            {item.photo && (
                              <div style={{ height: '180px', overflow: 'hidden' }}>
                                <img 
                                  src={`http://127.0.0.1:8000${item.photo}`} 
                                  alt={item.name} 
                                  className="card-img-top" 
                                  style={{ 
                                    objectFit: 'cover',
                                    height: '100%',
                                    width: '100%',
                                  }}
                                />
                              </div>
                            )}
                            <div className="card-body" style={{ background: '#fff9f0' }}>
                              <h5 className="card-title" style={{ color: '#5a3921', fontWeight: 'bold' }}>{item.name}</h5>
                              <p className="card-text text-muted" style={{ fontSize: '0.9rem' }}>{item.description}</p>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <p className="card-text fw-bold mb-0" style={{ fontSize: '1.1rem', color: '#5a3921' }}>
                                  Rs {item.price}
                                </p>
                                {item.discount && (
                                  <span className="badge" style={{ background: '#ff6b6b', color: 'white', padding: '5px 10px' }}>
                                    🔥 {item.discount.percentage}% off!
                                  </span>
                                )}
                              </div>
                              <div className="d-flex justify-content-between mt-2">
                                <button 
                                  onClick={() => handleEdit(item)} 
                                  className="btn btn-sm" 
                                  style={{ background: '#e89f71', color: 'white', borderRadius: '6px', width: '48%' }}
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteItem(item.id)} 
                                  className="btn btn-sm" 
                                  style={{ background: '#ff6b6b', color: 'white', borderRadius: '6px', width: '48%' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12">
                        <div className="alert" style={{ background: 'rgba(90, 57, 33, 0.1)', color: '#5a3921', borderRadius: '8px' }}>
                          <p className="mb-0">No items in this section. Add your first menu item!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="alert" style={{ background: 'rgba(90, 57, 33, 0.1)', color: '#5a3921', borderRadius: '8px', padding: '20px' }}>
                <p className="mb-0">No menu sections found. Create your first section to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDashboard;