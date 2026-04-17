export default function ProductCard({ product, addToCart }) {
  return (
    <div className="card">

      {/*  PRODUCT IMAGE */}
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
      />

      {/*  PRODUCT DETAILS */}
      <div className="card-content">
        <h3>{product.name}</h3>

        <p className="category">{product.category}</p>

        <p className="price">₹{product.price}</p>

        <button onClick={() => addToCart(product.id)}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}