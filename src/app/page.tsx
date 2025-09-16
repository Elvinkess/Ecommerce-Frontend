"use client";

import "./styles/homepage.css";
import Link from "next/link";
import ImageCard, { IProduct } from "./component/ImageCard";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, guestId } = useAuth();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/paginate?page=1&limit=6`
        );
        const { products } = await res.json();
        setProducts(products);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading)
    return (
      <div className="spinner">
        <div className="loader"></div>
      </div>
    );

  return (
    <div>
      <div className="homepage-container">
        <button>
          <Link href="/product">SHOP NOW</Link>
        </button>
      </div>

      <div>
        {user && user.username ? (
          <h1>Welcome {user.username}</h1>
        ) : (
          <p>Welcome, guest user (ID: {guestId})</p>
        )}
      </div>

      <div className="product-grid-container">
        <ImageCard products={products}></ImageCard>
      </div>
    </div>
  );
}
