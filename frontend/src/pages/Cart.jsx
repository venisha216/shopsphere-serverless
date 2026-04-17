import { useEffect, useState } from "react";
import Toast from "../components/Toast";

const BASE_URL = "https://kammj2qk94.execute-api.ap-southeast-1.amazonaws.com";
const userId = "user1";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadCart();
    loadProducts();
  }, []);

  const loadCart = async () => {
    const res = await fetch(`${BASE_URL}/cart?userId=${userId}`);
    const data = await res.json();
    setCart(data);
  };

  const loadProducts = async () => {
    const res = await fetch(`${BASE_URL}/products`);
    const data = await res.json();
    setProducts(data);
  };

  const removeItem = async (productId) => {
    await fetch(`${BASE_URL}/cart/${productId}?userId=${userId}`, {
      method: "DELETE"
    });

    setToast({ message: "Item removed", type: "error" });
    loadCart();
  };

  const orderSingle = async (productId) => {
    await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, items: [productId] })
    });

    setToast({ message: "Order placed", type: "success" });
  };

  const orderAll = async () => {
  await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId   // ✅ ONLY THIS
    })
  });

  setToast({ message: "Order placed", type: "success" });
  loadCart();
};

  const cartItems = products.filter(p => cart.includes(p.id));

  return (
    <div className="container">
      <h2>Your Cart</h2>

      {cartItems.length > 0 && (
        <button className="primary" onClick={orderAll}>
          Order All
        </button>
      )}

      {cartItems.length === 0 ? (
        <p className="empty">Cart is empty</p>
      ) : (
        <div className="grid">
          {cartItems.map((item) => (
            <div className="card" key={item.id}>
              <h3>{item.name}</h3>
              <p className="price">₹{item.price}</p>

              <div className="actions">
                <button onClick={() => orderSingle(item.id)}>
                  Order
                </button>

                <button
                  className="danger"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <Toast {...toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
}