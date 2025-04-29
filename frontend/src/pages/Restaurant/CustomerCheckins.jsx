import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import '../../css/CustomerCheckins.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CustomerCheckins = () => {
  const [checkins, setCheckins] = useState([]);
  const [menuMap, setMenuMap] = useState({});
  const [newOrder, setNewOrder] = useState({ bookingId: '', itemId: '', quantity: 1 });
  const [billModal, setBillModal] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCheckins();
  }, []);

  const fetchCheckins = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/dashboard/customer-checkins/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCheckins(data);

      const restaurantIds = [...new Set(data.map(b => b.restaurant_id))];
      const menuPromises = restaurantIds.map(async (restId) => {
        const menuRes = await axios.get(`http://127.0.0.1:8000/api/dashboard/menu/public/?restaurant_id=${restId}`);
        const items = menuRes.data.sections.flatMap(section => section.items);
        return { restId, items };
      });

      const results = await Promise.all(menuPromises);
      const menuData = {};
      results.forEach(({ restId, items }) => {
        menuData[restId] = items;
      });
      setMenuMap(menuData);
    } catch (error) {
      toast.error('❌ Could not fetch check-ins or menus');
    }
  };

  const generateInvoice = (booking) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("SmartDine Final Bill", 14, 20);

    doc.setFontSize(12);
    doc.text(`Customer: ${booking.customer}`, 14, 30);
    doc.text(`Table: ${booking.table}`, 14, 38);
    doc.text(`Date & Time: ${booking.checked_in_time || "N/A"}`, 14, 46);

    const rows = [];

    booking.preorders.forEach((item) => {
      rows.push([item.name, "1", item.price.toFixed(2)]);
    });

    booking.extra_orders.forEach((item) => {
      rows.push([
        item.menu_item_name,
        item.quantity,
        (item.menu_item_price * item.quantity).toFixed(2),
      ]);
    });

    doc.autoTable({
      head: [["Item", "Qty", "Total"]],
      body: rows,
      startY: 55,
    });

    const finalY = doc.lastAutoTable.finalY || 70;
    doc.text(`Total Bill: Rs. ${booking.final_total_amount}`, 14, finalY + 10);

    if (booking.payment_method === "online") {
      doc.text(`Preorders Paid via Khalti`, 14, finalY + 18);
    }

    doc.save(`Invoice_Booking_${booking.booking_id}.pdf`);
  };

  const markFinalBillPaid = async (bookingId, method) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/dashboard/pay-at-restaurant/${bookingId}/finalize/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method }),
      });
      if (!res.ok) throw new Error("Failed to mark payment");
      toast.success(`✅ Paid via ${method}`);
      fetchCheckins();
    } catch {
      toast.error("❌ Payment confirmation failed");
    }
  };

  const submitExtraOrder = async () => {
    try {
      await fetch(`http://127.0.0.1:8000/api/dashboard/extra-orders/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking: newOrder.bookingId,
          menu_item: newOrder.itemId,
          quantity: newOrder.quantity,
        }),
      });
      toast.success('✅ Extra order added!');
      fetchCheckins();
      setNewOrder({ bookingId: '', itemId: '', quantity: 1 });
    } catch {
      toast.error('❌ Could not add extra order');
    }
  };

  return (
    <div className="restaurant-layout">
      <Sidebar />
      <div className="dashboard-content p-4">
        <h3 className="mb-4">📋 Customer Check-ins</h3>
        {checkins.map((b) => {
          const menuItems = menuMap[b.restaurant_id] || [];
          const preorderTotal = b.payment_method === 'online' ? 0 : (b.preorder_total || 0);
          const extraTotal = b.total_extra_amount || 0;

          return (
            <div key={b.booking_id} className="checkin-card mb-4 p-3 border rounded shadow-sm">
              <p><strong>Customer:</strong> {b.customer}</p>
              <p><strong>Table:</strong> {b.table}</p>
              <p><strong>Checked in at:</strong> {b.checked_in_time || 'N/A'}</p>

              <div className="mt-2">
                {b.payment_method === 'online' ? (
                  <p className="text-success">✅ Preorders already paid via Khalti</p>
                ) : (
                  <p><strong>Total for Preorders:</strong> Rs. {preorderTotal}</p>
                )}
                <p><strong>Total for Extra Orders:</strong> Rs. {extraTotal}</p>
                <p className="fw-bold text-primary">💰 <strong>Total Bill:</strong> Rs. {b.final_total_amount}</p>
              </div>

              <button className="btn btn-secondary mb-2 me-2" onClick={() => setBillModal(b)}>
                🧾 View Bill
              </button>

              {b.checked_in && !b.extra_paid && b.payment_method === 'restaurant' && (
                <>
                  <button className="btn btn-outline-success me-2" onClick={() => markFinalBillPaid(b.booking_id, "cash")}>
                    💵 Final Bill Paid via Cash
                  </button>
                  <button className="btn btn-outline-primary" onClick={() => markFinalBillPaid(b.booking_id, "online")}>
                    💳 Final Bill Paid via Online
                  </button>
                </>
              )}

{b.checked_in && b.payment_method === 'restaurant' && b.final_payment_mode && (
  <p className="text-success mt-2">
    ✅ Final Bill Payment Received via {b.final_payment_mode.toUpperCase()}
  </p>
)}


              <div className="mt-3">
                {b.checked_in && !b.extra_paid && (
                  <>
                    <h6>Add Extra Order</h6>
                    <select
                      value={newOrder.bookingId === b.booking_id ? newOrder.itemId : ''}
                      onChange={(e) =>
                        setNewOrder({
                          bookingId: b.booking_id,
                          itemId: e.target.value,
                          quantity: 1,
                        })
                      }
                      className="form-select mb-2"
                    >
                      <option value="">Select item</option>
                      {menuItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} (Rs. {item.price})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={newOrder.bookingId === b.booking_id ? newOrder.quantity : 1}
                      onChange={(e) =>
                        setNewOrder((prev) => ({
                          ...prev,
                          bookingId: b.booking_id,
                          quantity: parseInt(e.target.value),
                        }))
                      }
                      className="form-control mb-2"
                      placeholder="Quantity"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={submitExtraOrder}
                      disabled={!newOrder.itemId || newOrder.bookingId !== b.booking_id}
                    >
                      ➕ Add Order
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* MODAL */}
        {billModal && (
  <div className="modal-backdrop">
    <div className="modal-content">
      <h5>Invoice Preview - Booking #{billModal.booking_id}</h5>
      <p><strong>Customer:</strong> {billModal.customer}</p>
      <p><strong>Table:</strong> {billModal.table}</p>
      <p><strong>Checked in:</strong> {billModal.checked_in_time || "N/A"}</p>

      <h6>Preorders</h6>
      <ul>
        {billModal.preorders.length > 0 ? (
          billModal.preorders.map((item, idx) => (
            <li key={idx}>{item.name} (Rs. {item.price})</li>
          ))
        ) : <li>No preorders</li>}
      </ul>

      {billModal.payment_method === 'online' && (
        <p className="text-success mt-1">✅ Preorders already paid via Khalti</p>
      )}

      <h6 className="mt-3">Extra Orders</h6>
      <ul>
        {billModal.extra_orders.length > 0 ? (
          billModal.extra_orders.map((item, idx) => (
            <li key={idx}>{item.quantity}x {item.menu_item_name} (Rs. {item.menu_item_price})</li>
          ))
        ) : <li>No extra orders</li>}
      </ul>

      {billModal.payment_method !== 'online' && (
        <p><strong>Total for Preorders:</strong> Rs. {billModal.preorder_total}</p>
      )}
      <p><strong>Total for Extra Orders:</strong> Rs. {billModal.total_extra_amount}</p>
      <p className="fw-bold text-primary">💰 <strong>Total Bill:</strong> Rs. {billModal.final_total_amount}</p>

      <div className="modal-actions mt-3">
        <button className="btn btn-outline-secondary me-2" onClick={() => setBillModal(null)}>Close</button>
        <button className="btn btn-success me-2" onClick={() => generateInvoice(billModal)}>🧾 Generate Invoice</button>

        {!billModal.extra_paid && (
          <>
            <button
              className="btn btn-outline-success me-2"
              onClick={async () => {
                await markFinalBillPaid(billModal.booking_id, 'cash');
                setBillModal(null);
              }}
            >
              💵 Paid via Cash
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={async () => {
                await markFinalBillPaid(billModal.booking_id, 'online');
                setBillModal(null);
              }}
            >
              💳 Paid via Online
            </button>
          </>
        )}
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default CustomerCheckins;
