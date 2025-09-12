"use client"
import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, User, LayoutGrid, Package, ClipboardList, X } from "lucide-react";
import OrderListDrawer from "./Order";
import Image from "next/image";
import { useRouter } from "next/navigation"; 

export default function Header() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const [open, setOpen] = useState(false);
  const [openOrders, setOpenOrders] = useState(false);
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productName: query }),
      });

      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        router.push(`/search-results?query=${encodeURIComponent(query)}`);
      } else {
        alert("No products found");
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setSearching(false);
    }
  };

  const handleQuantityChange = (itemId: number, quantity: number, max: number) => {
    if (quantity < 1) return updateQuantity(itemId, 1);
    if (quantity > max) return updateQuantity(itemId, max);
    updateQuantity(itemId, quantity);
  };

  return (
    <header className="header relative">
      <div className="container flex justify-between items-center">
        {/* Logo */}
        <div className="logo">
          <Link href="/">Shopper</Link>
        </div>

        {/* Navigation */}
        <div className="nav-links flex gap-6 items-center">
          <Link href="/category" title="Category">
            <LayoutGrid size={22} />
          </Link>
          <Link href="/product" title="Product">
            <Package size={22} />
          </Link>

          {/* 🔎 Search Input */}
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="search-input"
            />
          </form>

          {user && user.id && user.username && (
            <nav className="space-x-4">
              <button onClick={() => setOpenOrders(true)} className="relative">
                <ClipboardList size={24} />
              </button>
            </nav>
          )}

          {/* Orders Drawer */}
          <OrderListDrawer open={openOrders} onClose={() => setOpenOrders(false)} />

          {/* Cart Icon */}
          <button onClick={() => setOpen(true)} className="relative cart-icon">
            <ShoppingCart size={24} />
            <span className="cart-icon-count">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </button>

          <Link href="/login" title="Login">
            <User size={22} />
          </Link>
        </div>
      </div>

     

      {/* Cart Drawer */}
      {open && (
        <div className="cart-memu-container" onClick={() => setOpen(false)}>
          <div className="cart-memu" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="cart-header">
              <button onClick={clearCart} className="item-clear">
                Clear cart
              </button>
              {user && user.username ? (
                <h2 className="text-lg font-bold">{user.username}&apos;s cart</h2>
              ) : (
                <h2 className="text-lg font-bold">Your Cart</h2>
              )}
              <button onClick={() => setOpen(false)} className="cart-header-close-btn">
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="empty-cart">Your cart is empty</p>
              ) : (
                <ul className="cart-items-list">
                  {cart.map((item) => (
                    <li key={item.id} className="cart-item">
                      <div className="cart-item-image">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="cart-item-img"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="cart-item-details-wrapper">
                        <p className="cart-item-name">{item.name}</p>
                        <p className="cart-item-size">size: small (uk 8, 10)</p>

                        <div className="cart-item-controls-price">
                          <div className="cart-item-quantity-controls">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1, item.maxQuantity)
                              }
                              className="quantity-btn"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  Number(e.target.value),
                                  item.maxQuantity
                                )
                              }
                              className="cart-item-quantity-input"
                              min="1"
                              max={item.maxQuantity}
                            />
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1, item.maxQuantity)
                              }
                              className="quantity-btn"
                            >
                              +
                            </button>
                          </div>
                          <p className="cart-item-total-price">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Remove item */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="remove-item-icon-btn"
                      >
                        <X size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="cart-footer-buttons">
                <button onClick={() => setOpen(false)} className="cart-close-button">
                  Continue Shopping
                </button>
                <Link href="/checkout" className="cart-check-out">
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
