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
          <div key={product.id} className="product-card">
            <img src={product.image_url} alt={product.name} className="product-img" />
            <h2>{product.name}</h2>
            <p>${product.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    );
  }
  