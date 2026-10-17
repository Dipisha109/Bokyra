import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import products from '../data/product'
import { useShop } from '../context/ShopContext'
import WhyThisBag from '../components/WhyThisBag'
import WillItFit from '../components/WillItFit'

function ProductDetails() {
  // useParams() reads the ":id" from the URL /shop/1
  const { id } = useParams()

  // .find() searches the products array for a matching id
  const product = products.find(
    (item) => item.id === Number(id)
  )

  // State: track quantity and wishlist status
  const [quantity, setQuantity] = useState(1)
const [addedToCart, setAddedToCart] = useState(false)

const { wishlist, toggleWishlist, addToCart } = useShop()
const isWishlisted = wishlist.includes(product?.id)

  // Guard: if someone visits /shop/999 and no product exists
  if (!product) {
    return (
      <main className="container" style={{ padding: '100px 32px', textAlign: 'center' }}>
        <h1 className="section-title">Product not found</h1>
        <p style={{ margin: '16px 0 32px', color: '#5C5852' }}>
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </main>
    )
  }

  
function handleAddToCart() {
  if (product.stockStatus === 'Sold Out') {
    return
  }

  addToCart(product, quantity)
  setAddedToCart(true)

  setTimeout(() => {
    setAddedToCart(false)
  }, 2000)
}

  return (
    <main className="product-details-page">
      <div className="container">

        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/shop">Shop</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="pd-grid">

          {/* Left: Product Image */}
          <div className="pd-image-col">
            <div className="pd-image-main">
              <img src={product.image} alt={product.name} />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="pd-info-col">
            <span className="pd-collection">{product.displayCategory || product.category}</span>

            <h1 className="pd-title">{product.name}</h1>

            <div className="pd-price-row">
              <span className="pd-price">
                NPR {product.price.toLocaleString()}
              </span>
              <span className="pd-tax-note">TAXES & ATELIER SHIPPING INCLUDED</span>
            </div>

            <p className="pd-description">{product.description}</p>
            <WhyThisBag product={product} />
            <WillItFit product={product} />

            {product.highlights && product.highlights.length > 0 && (
              <div style={{ margin: '20px 0', padding: '16px', background: 'var(--bg-muted)', borderRadius: '4px' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Architectural Specifications
                </span>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {product.highlights.map((h, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#a3723a' }}>✓</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="pd-quantity">
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pd-actions">
              <button
                className="btn btn-primary pd-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stockStatus === 'Sold Out'}
              >
                {/* {addedToCart ? '✓ ADDED TO CART' : `ADD TO CART — NPR ${(product.price * quantity).toLocaleString()}`} */}
                {product.stockStatus === 'Sold Out'
                  ? 'SOLD OUT'
                  : addedToCart
                  ? 'ADDED TO CART'
                 : 'ADD TO CART'}
              </button>
            </div>

            
              {product.customizable && product.stockStatus !== 'Sold Out' && (
                <Link
                  to={`/customize?productId=${product.id}`}
                  className="btn pd-customize-btn"
                >
                  CUSTOMIZE THIS BAG →
                </Link>
              )}


            <button
              type="button"
              className={`pd-wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={() => toggleWishlist(product.id)}
            >
              {isWishlisted ? '♥ SAVED TO WISHLIST' : '♡ SAVE TO WISHLIST'}
            </button>

            {/* Delivery Info */}
            <div className="pd-delivery">
              <div className="pd-delivery-item">
                <span>🚚</span>
                <span> Delivery across Kathmandu in Nepal</span>
              </div>
              <div className="pd-delivery-item">
                <span>🔧</span>
                <span>Warranty and repair</span>
              </div>
              <div className="pd-delivery-item">
                <span>📦</span>
                <span>Ships within 24–48 hours</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

export default ProductDetails