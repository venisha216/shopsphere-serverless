import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Toast from "../components/Toast";

const BASE_URL = "https://kammj2qk94.execute-api.ap-southeast-1.amazonaws.com";
const userId = "user1";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [price, setPrice] = useState("All");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await fetch(`${BASE_URL}/products`);
    const data = await res.json();
    setProducts(data);
  };

  const addToCart = async (product) => {
    await fetch(`${BASE_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId, productId: product.id })
    });

    setToast({
      message: `${product.name} added to cart`,
      type: "success"
    });
  };

  // 🔍 FILTER LOGIC
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      category === "All" || p.category === category;

    const matchPrice =
      price === "All" ||
      (price === "low" && p.price < 1000) ||
      (price === "mid" && p.price >= 1000 && p.price <= 5000) ||
      (price === "high" && p.price > 5000);

    return matchSearch && matchCategory && matchPrice;
  });

  return (
    <div className="container">
      <h2>Products</h2>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search products..."
        className="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 🎯 FILTERS */}
      <div className="filters">
        {/* CATEGORY */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Home">Home</option>
          <option value="Books">Books</option>
          <option value="Fitness">Fitness</option>
        </select>

        {/* PRICE */}
        <select
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        >
          <option value="All">All Prices</option>
          <option value="low">Below ₹1000</option>
          <option value="mid">₹1000 - ₹5000</option>
          <option value="high">Above ₹5000</option>
        </select>
      </div>

      {/* 🛍 PRODUCTS */}
      <div className="grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              addToCart={() => addToCart(p)}
            />
          ))
        ) : (
          <p className="empty">No products found</p>
        )}
      </div>

      {/*  TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}