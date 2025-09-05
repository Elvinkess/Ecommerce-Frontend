"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import{useAuth} from "../context/AuthContext"
import { ShoppingCart, Info, User, LayoutGrid, Package, X } from "lucide-react";

export default function Header() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const [open, setOpen] = useState(false);
  const{user}= useAuth()

  // Helper for safe quantity updates
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
          <Link href="/about" title="About">
            <Info size={22} />
          </Link>

          {/* Cart Icon with badge (toggles drawer) */}
          <button
            onClick={() => setOpen(true)}
            className="relative cart-icon"
          >
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
        <div className="cart-memu-container"onClick={() => setOpen(false)} >
          <div className="cart-memu"onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="cart-header">
              <button onClick={clearCart} className="item-clear">Clear cart</button>
              {user && user.username ? (
                <h2 className="text-lg font-bold">{user.username}'s cart</h2>
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
                      {/* Product Image Placeholder */}
                      <div className="cart-item-image-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"
                          viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className="lucide lucide-square-stack">
                          <rect width="18" height="18" x="3" y="3" rx="2"/>
                          <path d="M7 7v10h10"/>
                          <path d="M11 11v6h6"/>
                        </svg>
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
                <button
                  onClick={() => setOpen(false)}
                  className="cart-close-button"
                >
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
