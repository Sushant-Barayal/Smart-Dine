import React, { useEffect, useState } from 'react';

const AdminAssignRFID = () => {
  const [customers, setCustomers] = useState([]);
  const [rfidInputs, setRfidInputs] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/auth/customers/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error(err));
  }, []);

  const handleRFIDAssign = async (userId) => {
    const rfid = rfidInputs[userId];
    if (!rfid) {
      alert('⚠️ RFID UID is required.');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/auth/assign-rfid/${userId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rfid: rfid }), 
      });      

      const result = await response.json();

      if (response.ok) {
        alert('✅ RFID assigned successfully');
        setCustomers(prev =>
          prev.map(c => (c.id === userId ? { ...c, rfid_uid: rfid } : c))
        );
        setRfidInputs(prev => ({ ...prev, [userId]: '' }));
      } else {
        alert('❌ Error: ' + (result.detail || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ An error occurred while assigning RFID');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4 fw-bold text-primary">🔒 Assign RFID to Customers</h2>
      <div className="row">
        {customers.map((cust) => (
          <div
            key={cust.id}
            className="col-md-6 mb-4"
          >
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">{cust.username}</h5>
                <p className="card-text mb-2"><strong>ID:</strong> {cust.id}</p>
                {cust.rfid_uid ? (
                  <span className="badge bg-success mb-2">RFID: {cust.rfid_uid}</span>
                ) : (
                  <span className="badge bg-secondary mb-2">No RFID assigned</span>
                )}

                <div className="d-flex gap-2 mt-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter RFID UID"
                    value={rfidInputs[cust.id] || ''}
                    onChange={(e) =>
                      setRfidInputs({ ...rfidInputs, [cust.id]: e.target.value })
                    }
                  />
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => handleRFIDAssign(cust.id)}
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAssignRFID;
