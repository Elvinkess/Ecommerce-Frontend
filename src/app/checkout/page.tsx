"use client";

import "../styles/checkout.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

type Address = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  user_id: string;
};

type PaymentRes = {
  id: number;
  amount: number;
  deliveryamount: number;
  redirectUrl: string;
};

type OrderItems = {
  quantity: number;
  created_at: string;
  product_name: string;
  price: number;
};

type Order = {
  id: number;
  total_price: number;
  status: string;
  Order_items: OrderItems[];
};

export default function CheckoutPage() {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [paymentRes, setPaymentRes] = useState<PaymentRes | null>(null); // 👈 new
  const [formAddress, setFormAddress] = useState<Address>({
    name: user?.username || "",
    email: user?.email || "",
    phone: "",
    address: "",
    user_id: user?.id || "",
  });

  useEffect(() => {
    const fetchAddress = async () => {
      if (!user?.id) return;
      try {
        setUserId(user.id);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/address?userId=${user.id}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setAddress(data);
            setFormAddress(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch address:", err);
      }
    };

    const getOrder = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/order/${user.id}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setOrder(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      }
    };

    fetchAddress();
    getOrder();
  }, [userId]);

  const handleCheckout = async () => {
    if (!address) {
      alert("You must add an address before checkout");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/payment/${order?.id}`
      );

      if (!res.ok) {
        throw new Error("Failed to initiate payment");
      }

      const data: PaymentRes = await res.json();
      console.log("Payment response:", data);

      // instead of redirect, save in state
      setPaymentRes(data);
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong while processing payment.");
    }
  };

  return (
    <div className="checkout-container">
      <h1 className="checkout-address-heading">Checkout</h1>
      <div className="flex-checkout">
        {/* Address Section */}
        <div className="checkout-address-info">
          <h2 className="checkout-address-heading">
            {address ? "Update Address" : "Add Address"}
          </h2>

          <input
            type="text"
            placeholder="Full Name"
            className="checkout-form"
            value={formAddress.name}
            onChange={(e) =>
              setFormAddress({ ...formAddress, name: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            className="checkout-form"
            value={formAddress.email}
            onChange={(e) =>
              setFormAddress({ ...formAddress, email: e.target.value })
            }
          />
          <input
            type="tel"
            placeholder="Phone"
            className="checkout-form"
            value={formAddress.phone}
            onChange={(e) =>
              setFormAddress({ ...formAddress, phone: e.target.value })
            }
          />
          <textarea
            placeholder="Delivery Address"
            className="checkout-form"
            value={formAddress.address}
            onChange={(e) =>
              setFormAddress({ ...formAddress, address: e.target.value })
            }
          />

          {address ? (
            <button onClick={handleCheckout} className="address-btn">
              Update Address
            </button>
          ) : (
            <button onClick={handleCheckout} className="address-btn">
              Save Address
            </button>
          )}
        </div>

        {/* Order Section */}
        <div className="order-details">
          <h2>Your Order</h2>
          <div className="product-details">
            {order ? (
              <div>
                <p>Sum Total: ₦{order.total_price}</p>
                <h3>Items:</h3>
                <ul>
                  {order.Order_items?.map((item, idx) => (
                    <li key={idx}>
                      {item.product_name} x{item.quantity} - ₦{item.price}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Loading order...</p>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={!address}
            className={`px-4 py-2 rounded ${
              address
                ? "bg-green-600 text-white"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
          >
            Proceed to Payment
          </button>
        </div>
      </div>

      {/* Payment Popup */}
      {paymentRes && (
        <div className="payment-screen">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Payment</h2>
            <p>Total Price: ₦{paymentRes.amount}</p>
            <p>Delivery Fee: ₦{paymentRes.deliveryamount}</p>
            <p className="mt-2 font-semibold">
              Grand Total: ₦{paymentRes.amount + paymentRes.deliveryamount}
            </p>

            <div className="flex justify-end mt-6 gap-4">
              <button
                onClick={() => setPaymentRes(null)}
                className="px-4 py-2 rounded bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => (window.location.href = paymentRes.redirectUrl)}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
