import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import { useShop } from '../context/ShopContext'

function Navbar() {
  // Track logged-in user state, initialized lazily from localStorage
  const { cartCount } = useShop()
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('bokyra_logged_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    function handleStorage() {
      try {
        const raw = localStorage.getItem('bokyra_logged_user')
        setCurrentUser(raw ? JSON.parse(raw) : null)
      } catch {
        setCurrentUser(null)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('bokyra_logged_user')
    setCurrentUser(null)
  }

  return (
    <header className="site-navbar">
      <div className="container nav-inner">

        {/* Brand Logo & Main Navigation */}
        <div className="nav-left">
          <Link to="/" className="brand-logo" title="BOKYRA Home">
            <img src={logoImg} alt="BOKYRA" className="brand-logo-img" />
          </Link>

          <nav className="nav-links">
            <Link to="/shop" className="nav-link">Shop</Link>
            <Link to="/#categories" className="nav-link">Categories</Link>
            <Link to="/find-my-bag" className="nav-link">Find My Bag</Link>
          </nav>
        </div>

        {/* Quick Action Icons / Links */}
        <div className="nav-right">
          <Link to="/shop" className="nav-icon-link" title="Search products"> Search
            {/* 🔍 */}
          </Link>
          
          <Link to="/wishlist" className="nav-icon-link" title="Wishlist">Wishlist
            {/* ♡ */}
          </Link>

          <Link to="/cart" className="nav-icon-link" title="Shopping Cart"> Cart
            {/* 🛍️ */}
            <span className="cart-badge">{cartCount}</span>
          </Link>

          {/* Dynamic User Profile or Login Link */}
          {currentUser ? (
            <div className="nav-user-pill">
              <span>👤 {currentUser.name}</span>
              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
                title="Log out of atelier"
              >
                (Exit)
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-icon-link" title="Sign In or Register">
              Account 👤
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}

export default Navbar