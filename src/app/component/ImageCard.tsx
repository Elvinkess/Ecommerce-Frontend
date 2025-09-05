"use client";

import React from 'react';
import Image from 'next/image';
import "../styles/imageCard.css"
import { useCart } from '../context/CartContext';
import Link from 'next/link';


export interface IProduct {
  id: number;
  name: string;
  image_url: string;
  price: number;
  maxQuantity:number
}

interface ProductProps {
  products: IProduct[];
}

const ImageCard: React.FC<ProductProps> = ({ products }) => {
    const { addToCart } = useCart();
  return (
    <div className="product-card product-grid">
      {products.map((product) => (
        <div key={product.id} className="product-card border rounded-lg shadow p-4">
          {/* Product image */}
          <Link href={`/product/${product.id}`} className=" product-image-container">
            <Image
                src= {product.image_url && product.image_url.trim() !== "" 
                  ? product.image_url 
                  : "https://plus.unsplash.com/premium_photo-1732464750403-e77679a10e14?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                alt={product.name}
                width={400}
                height={400}
                className="product-image-card"
                
            />
            {/* Quick view overlay */}
            
          </Link>
            

            

          {/* Product info */}
          <div className="product-info ">
            <h3 className="product-title ">{product.name}</h3>
            <p className="product-price">Price: ₦{product.price}</p>
            <button className='cart-btn' onClick={() => addToCart(product)}> Add to cart</button>

          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageCard;
