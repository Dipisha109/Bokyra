
import { Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'

function ProductCard({ id, name, category, price, image, stockStatus, customizable }) {
  const { wishlist, toggleWishlist } = useShop()
  const isWishlisted = wishlist.includes(id)
  const isSoldOut = stockStatus === 'Sold Out'

  function handleWishlist(e) {
    e.preventDefault()
    toggleWishlist(id)
  }

  return (
    <article className={`product-card ${isSoldOut ? 'product-card-sold-out' : ''}`}>
      <div className="product-image-wrap">
        {customizable && !isSoldOut && (
          <Link
            to={`/customize?productId=${id}`}
            className="customizable-badge"
            onClick={(e) => e.stopPropagation()}
            title="Open bespoke 3D customizer for this model"
          >
            ✦ CUSTOMIZABLE
          </Link>
        )}

        {isSoldOut && (
          <span className="sold-out-badge" aria-label="Sold out">
            SOLD OUT
          </span>
        )}

        <Link to={`/shop/${id}`} className="product-image-link" tabIndex={-1} aria-hidden="true">
          <img
            src={image}
            alt={name}
            className="product-image"
            loading="lazy"
          />
        </Link>

        <button
          type="button"
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlist}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
        >
          {isWishlisted ? '♥' : '♡'}
        </button>
      </div>

      <div className="product-info">
        <div className="product-meta-row">
          <p className="product-category">{category || 'Silhouettes'}</p>
          <span className={`stock-status-pill ${isSoldOut ? 'sold-out' : 'in-stock'}`}>
            {isSoldOut ? 'Sold Out' : 'Available'}
          </span>
        </div>

        <Link to={`/shop/${id}`} className="product-name-link">
          <h3 className="product-name">{name}</h3>
        </Link>

        <div className="product-footer">
          <span className="product-price">
            NPR {price ? price.toLocaleString() : '—'}
          </span>

          <Link to={`/shop/${id}`} className="product-link">
            <span>View Details</span>
            <span className="product-link-arrow">&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ProductCard