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
              <div className="pd-specs-card">
                <span className="pd-specs-title">
                  Architectural Specifications
                </span>
                <ul className="pd-specs-list">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="pd-specs-item">
                      <span className="pd-specs-bullet">✓</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Purchase Controls Row */}
            <div className="pd-purchase-row">
              <div className="pd-quantity">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || product.stockStatus === 'Sold Out'}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.stockStatus === 'Sold Out'}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className={`btn btn-primary pd-cart-btn ${addedToCart ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={product.stockStatus === 'Sold Out'}
              >
                {product.stockStatus === 'Sold Out'
                  ? 'SOLD OUT'
                  : addedToCart
                  ? '✓ ADDED TO BAG'
                  : `ADD TO BAG — NPR ${(product.price * quantity).toLocaleString()}`}
              </button>
            </div>

            {product.customizable && product.stockStatus !== 'Sold Out' && (
              <Link
                to={`/customize?productId=${product.id}`}
                className="btn pd-customize-btn"
              >
                ✦ BESPOKE 3D CUSTOMIZER &rarr;
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