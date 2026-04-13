import { useEffect, useState } from "react";

const BASE_URL = "https://kammj2qk94.execute-api.ap-southeast-1.amazonaws.com";
const userId = "user1";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  const loadOrders = async () => {
    const res = await fetch(`${BASE_URL}/orders?userId=${userId}`);
    const data = await res.json();
    setOrders(data);
  };

  const loadProducts = async () => {
    const res = await fetch(`${BASE_URL}/products`);
    const data = await res.json();
    setProducts(data);
  };

  const cancelOrder = async (orderId) => {
    await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: "DELETE"
    });

    loadOrders();
  };

  const getProductName = (id) => {
    return products.find(p => p.id === id)?.name || id;
  };

  return (
    <div className="container">
      <h2>Your Orders</h2>

      {orders.length === 0 ? (
        <p className="empty">No orders yet</p>
      ) : (
        <div className="orders-grid">
          {orders.map((order, index) => (
            <div className="order-card" key={order.orderId}>
              <h3>Order {index + 1}</h3>

              <ul>
                {order.items.map((item, i) => (
                  <li key={i}>{getProductName(item)}</li>
                ))}
              </ul>

              <button
                className="danger"
                onClick={() => cancelOrder(order.orderId)}
              >
                Cancel Order
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}