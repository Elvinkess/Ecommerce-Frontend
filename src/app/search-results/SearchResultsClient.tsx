"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "../styles/search_result.css";

export interface IProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productName: query }),
        });

        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch search results", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) return <p className="p-4">Loading results...</p>;
  if (products.length === 0) return <p className="p-4">No products found for &quot;{query}&quot;</p>;

  return (
    <div className="search-result">
      <h1>Search Results for &quot;{query}&quot;</h1>
      <div className="search-products">
        {products.map((product) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="products-link"
          >
            <Image
              src={product.image_url}
              alt={product.name}
              width={200}
              height={200}
              className="products-image"
            />
            <h2 className="products-name">{product.name}</h2>
            <p className="products-price">₦{product.price.toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
