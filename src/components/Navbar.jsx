import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import { useShop } from '../context/ShopContext'

const shopCategories = [
  { label: 'All Products', path: '/shop' },
  { label: 'Office / Tote Bags', path: '/shop?category=Tote' },
  { label: 'Backpacks / Travels', path: '/shop?category=Backpack' },
  { label: 'Slings & Crossbody', path: '/shop?category=Sling%20%2F%20Crossbody' },
  { label: 'Executive Briefcases', path: '/shop?category=Briefcase' },
  { label: 'Travel Duffels', path: '/shop?category=Duffel' },
]

function Navbar() {
  const navigate = useNavigate()
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

  // State for shop dropdown menu (Screenshot #3)
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false)

  // State for header search bar modal
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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

  // Handle search submission from header
  function handleSearchSubmit(e) {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchTerm.trim())}`)
      setIsSearchOpen(false)
    }
  }

  // Quick tag selection inside search modal
  function handleQuickSearch(tag) {
    setSearchTerm(tag)
    navigate(`/shop?q=${encodeURIComponent(tag)}`)
    setIsSearchOpen(false)
  }

  // Close search when pressing Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen])

  return (
    <header className="site-navbar">
      <div className="container nav-inner">

        {/* Brand Logo & Main Navigation */}
        <div className="nav-left">
          <Link to="/" className="brand-logo" title="BOKYRA Home">
            <img src={logoImg} alt="BOKYRA" className="brand-logo-img" />
          </Link>

          <nav className="nav-links">
            {/* SHOP Dropdown Menu (Screenshot #3) */}
            <div
              className="nav-dropdown-wrapper"
              onMouseEnter={() => setIsShopDropdownOpen(true)}
              onMouseLeave={() => setIsShopDropdownOpen(false)}
            >
              <Link
                to="/shop"
                className="nav-link nav-dropdown-trigger"
                onClick={() => setIsShopDropdownOpen(false)}
              >
                <span>SHOP</span>
                <span className="nav-caret">▾</span>
              </Link>

              {isShopDropdownOpen && (
                <div className="nav-dropdown-menu">
                  {shopCategories.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      className="nav-dropdown-item"
                      onClick={() => setIsShopDropdownOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/find-my-bag" className="nav-link">Find My Bag</Link>
            <Link to="/about" className="nav-link">About Us</Link>
          </nav>
        </div>

        {/* Quick Action Icons / Links */}
        <div className="nav-right">
          <button
            type="button"
            className="nav-icon-link nav-search-toggle"
            title="Search products"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            aria-expanded={isSearchOpen}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Search</span>
          </button>
          
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

      {/* Header Search Modal Overlay (Top-Middle of screen) */}
      {isSearchOpen && (
        <div
          className="nav-search-modal-backdrop"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="nav-search-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nav-search-modal-header">
              <span className="nav-search-title">Search BOKYRA</span>
              <button
                type="button"
                className="nav-search-modal-close"
                onClick={() => setIsSearchOpen(false)}
                title="Close search (Esc)"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="nav-search-form">
              <div className="nav-search-field-box">
                <svg
                  className="nav-search-input-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className="nav-search-input"
                  placeholder="Type here to search (e.g. Apex, Office, Backpack)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="nav-search-submit-btn">
                  Search
                </button>
              </div>
            </form>

            {/* Quick popular search suggestions */}
            <div className="nav-search-suggestions">
              <span className="nav-search-suggestions-label">Popular:</span>
              {['Office bag', 'Backpack', 'Tote', 'Laptop', 'Travel', 'Casual'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="nav-search-tag-chip"
                  onClick={() => handleQuickSearch(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar