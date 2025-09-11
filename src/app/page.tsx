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
  const [showNotif, setShowNotif] = useState(false);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product/paginate?page=1&limit=6`);
        const {products} = await res.json();
        setProducts(products);
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
        {user && user.username ? <h1>Welcome {user.username}</h1> : <p>Please log in</p>}
      </div>

      <div className="product-grid-container">
        <ImageCard products={products}></ImageCard>
      </div>
    </div>
  );
}
