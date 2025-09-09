"use client";
import { jsPDF } from "jspdf";
import "../styles/receipt.css";

type PaymentResponse = {
  id: number;
  amount: number;
  status: string;
  orderId: number;
  userEmail: string;
  date: string;
  processorReference: string;
  transactionReference: string;
  remarks: string;
  deliveryamount: number;
};

export default function Receipt({ data }: { data: PaymentResponse }) {
  const handleDownload = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Payment Confirmation", 20, 20);

    doc.setFontSize(12);
    const details = [
      `Status: ${data.status}`,
      `Amount: ₦ ${data.amount}`,
      `Delivery Fee: ₦ ${data.deliveryamount}`,
      `Order ID: ${data.orderId}`,
      `Email: ${data.userEmail}`,
      `Date: ${new Date(data.date).toLocaleString()}`,
      `Processor Ref: ${data.processorReference}`,
      `Transaction Ref: ${data.transactionReference}`,
      `Remarks: ${data.remarks || "—"}`,
    ];

    details.forEach((line, i) => doc.text(line, 20, 40 + i * 10));

    doc.save(`receipt-${data.orderId}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-container">
      <div className="receipt-card">
      <h1 className="receipt-title">SHOPPER</h1>
        <h1 className="receipt-title">Payment Confirmation</h1>
        <ul className="receipt-list">
          <li><span>Status:</span> <strong>{data.status}</strong></li>
          <li><span>Amount:</span> <strong>₦ {data.amount}</strong></li>
          <li><span>Delivery Fee:</span> ₦ {data.deliveryamount}</li>
          <li><span>Order ID:</span> {data.orderId}</li>
          <li><span>Email:</span> {data.userEmail}</li>
          <li><span>Date:</span> {new Date(data.date).toLocaleString()}</li>
          <li><span>Processor Ref:</span> {data.processorReference}</li>
          <li><span>Transaction Ref:</span> {data.transactionReference}</li>
          <li><span>Remarks:</span> {data.remarks || "—"}</li>
        </ul>

        <div className="receipt-actions">
          <button className="download-btn" onClick={handleDownload}>
            Download PDF
          </button>
          <button className="print-btn" onClick={handlePrint}>
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
