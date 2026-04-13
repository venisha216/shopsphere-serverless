import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
export default function Navbar() {
  return (
    <nav className="navbar">
      <h1>ShopSphere</h1>

      <div className="nav-links">
        <NavLink to="/" end>Products</NavLink>
        <NavLink to="/cart">Cart</NavLink>
        <NavLink to="/orders">Orders</NavLink>
      </div>
    </nav>
  );
}