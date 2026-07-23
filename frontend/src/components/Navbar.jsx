import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-mark" aria-hidden="true" />
          Relay
        </Link>

        <nav className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Catalog
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'active' : '')}>
                Manage products
              </NavLink>
              <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
                All orders
              </NavLink>
              <NavLink to="/admin/statistics" className={({ isActive }) => (isActive ? 'active' : '')}>
                Statistics
              </NavLink>
            </>
          )}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated && (
            <Link to="/orders" className="navbar-orders-link">
              My orders
            </Link>
          )}

          <Link to="/cart" className="navbar-cart" aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}>
            <CartIcon />
            {itemCount > 0 && <span className="navbar-cart-badge mono">{itemCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="navbar-user">
              <Link to="/profile" className="navbar-user-name">
                {user.name}
              </Link>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <div className="navbar-user">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
