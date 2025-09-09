"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import "../styles/imageCard.css";
import { useCart } from '../context/CartContext';
import Link from 'next/link';

export interface IProduct {
  id: number;
  name: string;
  image_url: string;
  price: number;
  maxQuantity: number;
}

interface ProductProps {
  products: IProduct[];
}

const ImageCard: React.FC<ProductProps> = ({ products }) => {
  const { addToCart } = useCart();
  const [showNotif, setShowNotif] = useState(false);
  const [notifText, setNotifText] = useState("");

  const handleAddToCart = (product: IProduct) => {
    addToCart(product, 1); // Default quantity 1
    setNotifText(`${product.name} added to cart`);
    setShowNotif(true);

    setTimeout(() => setShowNotif(false), 3000); // Hide after 3s
  };

  return (
    <>
      {/* Product grid */}
      <div className="product-card product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <Link href={`/product/${product.id}`} className="product-image-container">
              <Image
                src={
                  product.image_url && product.image_url.trim() !== ""
                    ? product.image_url
                    : "https://via.placeholder.com/400"
                }
                alt={product.name}
                width={400}
                height={400}
                className="product-image-card"
              />
            </Link>
  
            <div className="product-info">
              <h3 className="product-title">{product.name}</h3>
              <p className="product-price">Price: ₦{product.price}</p>
              <button
                className="cart-btn"
                onClick={() => handleAddToCart(product)}
              >
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
  
      {/* Notification (now outside grid, fixed to viewport) */}
      {showNotif && (
        <div className="cart-notification">
          {notifText}
        </div>
      )}
    </>
  );
  
};

export default ImageCard;
