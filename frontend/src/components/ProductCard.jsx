export default function ProductCard({ product, addToCart }) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p className="price">₹{product.price}</p>

      <button onClick={() => addToCart(product.id)}>
        Add to Cart
      </button>
    </div>
  );
}