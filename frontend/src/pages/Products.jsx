import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

const BASE_URL = "https://kammj2qk94.execute-api.ap-southeast-1.amazonaws.com";
const userId = "user1";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await fetch(`${BASE_URL}/products`);
    const data = await res.json();
    setProducts(data);
  };

  const addToCart = async (productId) => {
    await fetch(`${BASE_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId, productId })
    });
  };

  return (
    <div className="container">
      <h2>Products</h2>

      <div className="grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            addToCart={addToCart}
          />
        ))}
      </div>
    </div>
  );
}