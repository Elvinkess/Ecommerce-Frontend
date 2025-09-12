"use client";
import { useEffect, useState } from "react";
import Product from "../component/Product";
import { IProduct, ProductProps } from "../component/ImageCard";


export default function Products() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 8;

  const fetchProducts = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/paginate?page=${page}&limit=${limit}`
      );
      const data = await res.json();

      setProducts((prev) =>
        page === 1 ? data.products : [...prev, ...data.products] // replace for page 1
      );
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  // Only run on mount
  useEffect(() => {
    fetchProducts(1);
  }, []);

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  };

  return (
    <div>
      <Product products={products} />

      {page < totalPages && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className={`load-more-btn ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Loading..." : "More Product"}
          </button>
        </div>
      )}
    </div>
  );
}



















































// // app/products/page.tsx
// import Product from "../component/Product";

// async function getProducts(page: number, limit: number) {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/paginate?page=${page}&limit=${limit}`,
//     { cache: "no-store" } // so it always fetches fresh data
//   );
//   return res.json();
// }

// export default async function Products({ searchParams }: { searchParams: { page?: string } }) {
//   const page = Number(searchParams.page) || 1;
//   const limit = 8;

//   const { products, totalPages } = await getProducts(page, limit);

//   return (
//     <div>
//       <Product products={products} />

//       {/* Pagination Controls */}
//       <div className="flex justify-center gap-4 mt-6">
//         {page > 1 && (
//           <a href={`/products?page=${page - 1}`} className="px-4 py-2 bg-gray-200 rounded">
//             Previous
//           </a>
//         )}
//         {page < totalPages && (
//           <a href={`/products?page=${page + 1}`} className="px-4 py-2 bg-gray-200 rounded">
//             Next
//           </a>
//         )}
//       </div>
//     </div>
//   );
// }
