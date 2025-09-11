import Link from "next/link";
import "../styles/product.css";

export interface IProduct {
  id: number;
  name: string;
  image_url: string;
  price: number;
}

interface ProductProps {
  products: IProduct[];
}

export default function Product({ products }: ProductProps) {
  return (
    <div className="product-list">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.id}`} 
          className="product-cards"
        >
          <img
            src={product.image_url}
            alt={product.name}
            className="product-img"
          />
          <h2>{product.name}</h2>
          <p>₦{product.price.toFixed(2)}</p>
        </Link>
      ))}
    </div>
  );
}
