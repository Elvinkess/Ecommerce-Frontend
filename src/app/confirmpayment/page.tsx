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
  error?: string; 
};

export default async function ConfirmPaymentPage({ searchParams}: {searchParams: Promise<{ tx_ref?: string }>;}) {
  const params = await searchParams;
  const tx_ref = params.tx_ref;

  if (!tx_ref) {
    return <div>Invalid transaction reference</div>;
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/confirmpayment?tx_ref=${tx_ref}`,
    { cache: "no-store" }
  );

  const data: PaymentResponse = await res.json();

  if ("error" in data) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-red-100 text-red-700 rounded-xl">
        <h1 className="font-bold">Payment Error</h1>
        <p>{data.error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded-xl">
      <h1 className="text-xl font-bold mb-4">Payment Confirmation</h1>
      <ul className="space-y-2">
        <li><strong>Status:</strong> {data.status}</li>
        <li><strong>Amount:</strong> ₦{data.amount}</li>
        <li><strong>Delivery Fee:</strong> ₦{data.deliveryamount}</li>
        <li><strong>Order ID:</strong> {data.orderId}</li>
        <li><strong>Email:</strong> {data.userEmail}</li>
        <li><strong>Date:</strong> {new Date(data.date).toLocaleString()}</li>
        <li><strong>Processor Ref:</strong> {data.processorReference}</li>
        <li><strong>Transaction Ref:</strong> {data.transactionReference}</li>
        <li><strong>Remarks:</strong> {data.remarks}</li>
      </ul>
    </div>
  );
}
