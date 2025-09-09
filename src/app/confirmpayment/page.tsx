import Receipt from "../component/Receipt";

export default async function ConfirmPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ tx_ref?: string }>;
}) {
  const params = await searchParams;
  const tx_ref = params.tx_ref;

  if (!tx_ref) return <div>Invalid transaction reference</div>;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/confirmpayment?tx_ref=${tx_ref}`,
    { cache: "no-store" }
  );

  const data = await res.json();

  if ("error" in data) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-red-100 text-red-700 rounded-xl">
        <h1 className="font-bold">Payment Error</h1>
        <p>{data.error}</p>
      </div>
    );
  }

  return <Receipt data={data} />;
}
