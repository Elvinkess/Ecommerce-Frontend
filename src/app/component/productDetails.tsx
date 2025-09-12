"use client";
import "../styles/productDetails.css";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Notification from "../component/NotifyCart"

interface Product {
  data: {
    id: number;
    name: string;
    price: number;
    description: string;
    image_url: string;
    outOfStock: boolean;
    inventory: {
      quantity_available: number;
    };
  };
}


export default function ProductDetail({ product }: { product:Product  }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [showNotif, setShowNotif] = useState(false);

  // Check if product is already in cart
  const inCart = cart.find((c) => c.id === product.data.id);

  // Sync quantity state with cart if already in cart
  useEffect(() => {
    if (inCart) setQuantity(inCart.quantity);
  }, [inCart]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 1;
    const safeValue = Math.max(
      1,
      Math.min(value, product.data.inventory.quantity_available)
    );
    setQuantity(safeValue);
  };

  const handleAddToCart = () => {
    if (inCart) {
      // If product already in cart, increase its quantity
      const newQuantity = Math.min(
        inCart.quantity + quantity,
        product.data.inventory.quantity_available
      );
      updateQuantity(product.data.id, newQuantity);
    } else {
      // If not in cart, add it
      addToCart(
        {
          id: product.data.id,
          name: product.data.name,
          price: product.data.price,
          image_url: product.data.image_url,
          maxQuantity: product.data.inventory.quantity_available,
        },
        quantity
      );
    }
    setShowNotif(true);
  };

  return (
    <div className="dynamic_product">

      <img
        className="product-image"
        src={
          product.data.image_url ||
          "https://plus.unsplash.com/premium_photo-1732464750403-e77679a10e14?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
        alt={product.data.name}
      />
      <div className="image-detals">
         <h1>{product.data.name}</h1>

        <p>{product.data.description}</p>
        <p>
        Price: <strong>₦ {product.data.price}</strong>
        </p>
        <p>
        Available:{" "}
        <strong>{product.data.inventory.quantity_available}</strong>
        </p>

        {/* Quantity Input */}
        <div className="quantity_input">
        <label htmlFor="quantity">Quantity: </label>
        <input
            id="quantity"
            type="number"
            min={1}
            max={product.data.inventory.quantity_available}
            value={quantity}
            onChange={handleQuantityChange}
        />
        </div>
        <button
            onClick={handleAddToCart}
            className="add-to-cart-btn"
            disabled={product.data.outOfStock} // disable when out of stock
        >
          {product.data.outOfStock
          ? "Out of Stock"
          : inCart
            ? "Update Cart"
            : "Add to Cart"}
      </button>


       
      </div>
      {showNotif && (
        <Notification
          message={`${product.data.name} added to cart ✅`}
          onClose={() => setShowNotif(false)}
        />
      )}
      
    </div>
  );
}
