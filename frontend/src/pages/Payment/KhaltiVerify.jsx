import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MySwal = withReactContent(Swal);

const KhaltiVerify = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const pidx = searchParams.get('pidx');

  const [status, setStatus] = useState('verifying');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!pidx || !bookingId) {
        setStatus('invalid');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await axios.post(
          `http://127.0.0.1:8000/api/dashboard/table-bookings/${bookingId}/verify-payment/`,
          { pidx },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStatus('success');
        setDetails(res.data);

        MySwal.fire({
          title: '✅ Payment Verified!',
          text: 'Your table and preorder has been confirmed.',
          icon: 'success',
          confirmButtonText: 'Awesome!',
        });

        setTimeout(() => {
          generateInvoice(res.data);
        }, 3000);
      } catch (error) {
        setStatus('failed');
        MySwal.fire({
          title: '❌ Payment Verification Failed',
          text: error.response?.data?.error || 'Please try again.',
          icon: 'error',
          confirmButtonText: 'Retry',
        });
      }
    };

    verifyPayment();
  }, [pidx, bookingId]);

  const generateInvoice = (data) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SmartDine Table Booking Invoice", 14, 20);

    doc.setFontSize(12);
    doc.text(`Booking ID: ${bookingId}`, 14, 30);
    doc.text(`Transaction ID: ${data.pidx}`, 14, 36);
    doc.text(`Customer: ${data.customer_name}`, 14, 42);
    doc.text(`Restaurant: ${data.restaurant.name}`, 14, 48);
    doc.text(`Address: ${data.restaurant.address}`, 14, 54);
    doc.text(`Table No: ${data.table_number}`, 14, 60);
    doc.text(`Date: ${data.date}  |  Time: ${data.time}`, 14, 66);

    // Preordered Items
    if (data.preordered_items && data.preordered_items.length > 0) {
      doc.text("Preordered Items:", 14, 76);
      const itemRows = data.preordered_items.map((item, idx) => [
        idx + 1,
        item.name,
        `Rs. ${item.price.toFixed(2)}`, 
      ]);
      

      autoTable(doc, {
        startY: 80,
        head: [['#', 'Item', 'Price']],
        body: itemRows,
      });
    }

    const finalY = doc.lastAutoTable?.finalY || 90;
    doc.setFontSize(14);
    doc.text(`Total Amount: Rs. ${data.amount.toFixed(2)}`, 14, finalY + 10);

    doc.save(`invoice_booking_${bookingId}.pdf`);
  };

  return (
    <div className="container text-center mt-5">
      {status === 'verifying' && <h4>🔄 Verifying your payment...</h4>}
      {status === 'success' && details && (
        <div className="alert alert-success mt-4">
          <h5>Payment Successful!</h5>
          <p><strong>Transaction ID:</strong> {details.pidx}</p>
          <p><strong>Amount:</strong> Rs. {(details.amount).toFixed(2)}</p>
        </div>
      )}
      {status === 'failed' && (
        <div className="alert alert-danger mt-4">
          <h5>Verification Failed</h5>
          <p>Please contact support or try again.</p>
        </div>
      )}
      {status === 'invalid' && (
        <div className="alert alert-warning mt-4">
          <h5>Invalid Request</h5>
          <p>Missing or invalid payment data in URL.</p>
        </div>
      )}
    </div>
  );
};

export default KhaltiVerify;
