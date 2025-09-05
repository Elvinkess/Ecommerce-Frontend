"use client";

import "./styles/homepage.css";
import Link from "next/link";
import ImageCard from "./component/ImageCard";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8000/product/");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return (
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
        {user ? <h1>Welcome {user.username}</h1> : <p>Please log in</p>}
      </div>

      <div className="product-grid-container">
        <ImageCard products={products}></ImageCard>
      </div>
    </div>
  );
}
