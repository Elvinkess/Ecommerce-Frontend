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
  user_id: number | null;
  guest_id: string | null;
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
  const { user, guestId } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [paymentRes, setPaymentRes] = useState<PaymentRes | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [addressSaved, setAddressSaved] = useState(false);



const validateForm = (): boolean => {
  const newErrors: Partial<Record<keyof Address, string>> = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,15}$/;
  const nameRegex = /^[a-zA-Z\s]{2,}$/;

  if (!formAddress.name.trim()) {
    newErrors.name = "Name is required.";
  } else if (!nameRegex.test(formAddress.name.trim())) {
    newErrors.name = "Name must be letters only, at least 2 characters.";
  }

  if (!formAddress.email.trim()) {
    newErrors.email = "Email is required.";
  } else if (!emailRegex.test(formAddress.email.trim())) {
    newErrors.email = "Invalid email format.";
  }

  if (!formAddress.phone.trim()) {
    newErrors.phone = "Phone number is required.";
  } else if (!phoneRegex.test(formAddress.phone.trim())) {
    newErrors.phone = "Phone must be digits only (10–15 characters).";
  }

  if (!formAddress.address.trim()) {
    newErrors.address = "Address is required.";
  } else if (formAddress.address.trim().length < 10) {
    newErrors.address = "Address must be at least 10 characters long.";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0; // ✅ no errors
};


  const [formAddress, setFormAddress] = useState<Address>({
    name: user?.username || "",
    email: user?.email || "",
    phone: "",
    address: "",
    user_id: user ? Number(user.id) : null,
    guest_id: guestId || null,
  });

  //  Fetch address + order for both user and guest
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        if (user?.id) {
          // logged in user
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
        } else if (guestId) {
          // guest - nothing to fetch from backend unless you implement guest address fetch
          setAddress(null);
        }
      } catch (err) {
        console.error("Failed to fetch address:", err);
      }
    };

    const getOrder = async () => {
      try {
        let url;
        if (user?.id) {
          // /order/:userId (create or fetch order for user)
          url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/${user.id}`;
        } else if (guestId) {
          // /order?guestId=xxx (create or fetch order for guest)
          url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/order?guestId=${guestId}`;
        } else {
          return;
        }

        const res = await fetch(url, { method: "POST" }); // POST to create/get order
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
  }, [user?.id, guestId]);

  // Save or update address
  const handleSaveAddress = async () => {
    if (!validateForm()) return;
  
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/address`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formAddress),
        }
      );
  
      if (!res.ok) throw new Error("Failed to save address");
  
      const data = await res.json();
      setAddress(data);
      setAddressSaved(true);
      setErrors({}); // clear errors
      alert("Address saved successfully!");
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Something went wrong while saving address.");
    }
  };

  //  Proceed to payment
  const handleCheckout = async () => {
    if (!order) {
      alert("No order found!");
      return;
    }
    if (!address?.id) {
      alert("You must add an address before checkout");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/pay/${order.id}/payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formAddress.email }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to initiate payment");
      }

      const data: PaymentRes = await res.json();
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
          {errors.name && <p className="error-text">{errors.name}</p>}

          <input
            type="email"
            placeholder="Email"
            className="checkout-form"
            value={formAddress.email}
            onChange={(e) =>
              setFormAddress({ ...formAddress, email: e.target.value })
            }
          />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <input
            type="tel"
            placeholder="Phone"
            className="checkout-form"
            value={formAddress.phone}
            onChange={(e) =>
              setFormAddress({ ...formAddress, phone: e.target.value })
            }
          />
          {errors.phone && <p className="error-text">{errors.phone}</p>}

          <textarea
            placeholder="2 Ijaiye Road, Ogba, Ikeja, Lagos State, Nigeria"
            className="checkout-form"
            value={formAddress.address}
            onChange={(e) =>
              setFormAddress({ ...formAddress, address: e.target.value })
            }
          />
          {errors.address && <p className="error-text">{errors.address}</p>}


          <button onClick={handleSaveAddress} className="address-btn">
            {address ? "Update Address" : "Save Address"}
          </button>
        </div>

        {/* Order Section */}
        <div className="order-details">
          <h2 className="order-h2">Your Order</h2>
          <div className="product-details">
            {order ? (
              <div>
                <p>Sum Total: ₦{order.total_price.toLocaleString()}</p>
                <h3>Items:</h3>
                <ul>
                  {order.Order_items?.map((item, idx) => (
                    <li key={idx}>
                      {item.product_name} x{item.quantity} - ₦{item.price.toLocaleString()}
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
            className={`btn-payment ${
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
          <div>
            <h2>Confirm Payment</h2>
            <p>Total Price: ₦{paymentRes.amount.toLocaleString()}</p>
            <p>Delivery Fee: ₦{paymentRes.deliveryamount.toLocaleString()}</p>
            <p>
              Grand Total: ₦{(paymentRes.amount + paymentRes.deliveryamount).toLocaleString()}
            </p>

            <div>
              <button onClick={() => setPaymentRes(null)}>Cancel</button>
              <button
                className="proceed-btn"
                onClick={() => (window.location.href = paymentRes.redirectUrl)}
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
