import ProductDetail from "@/app/component/productDetails";

export default async function ProductPage({ params }: { params: { id: string } }) {
  // params.id is available here synchronously
  const id = params.id;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product/${id}`, {
    cache: "no-store", // avoid caching during dev
  });

  if (!res.ok) {
    return <h1>Product not found</h1>;
  }

  const product = await res.json();

  console.log("product:", product);

  return <ProductDetail product={product} />;
}
