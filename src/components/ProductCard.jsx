
import { Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'

function ProductCard({ id, name, category, price, image, stockStatus, customizable }) {
  const { wishlist, toggleWishlist } = useShop()
  const isWishlisted = wishlist.includes(id)

  function handleWishlist(e) {
    e.preventDefault()
    toggleWishlist(id)
  }

return (
  <div className="product-card">
    <div className="product-image-wrap">
      {customizable && stockStatus === 'In Stock' && (
        <Link
          to={`/customize?product=${id}`}
          className="customizable-badge"
          onClick={(e) => e.stopPropagation()}
        >
          ✦ CUSTOMIZABLE
        </Link>
      )}

      <Link to={`/shop/${id}`}>
        <img
          src={image}
          alt={name}
          className="product-image"
        />
      </Link>

      <button
        type="button"
        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
        onClick={handleWishlist}
        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isWishlisted ? '♥' : '♡'}
      </button>
    </div>

      <div className="product-info">
        <span
          className={`stock-status ${
            stockStatus === 'Sold Out' ? 'sold-out' : 'in-stock'
          }`}
        >
          {stockStatus || 'In Stock'}
        </span>

        <Link to={`/shop/${id}`}>
          <h3 className="product-name">{name}</h3>
        </Link>

        <div className="product-footer">
          <span className="product-price">
            NPR {price ? price.toLocaleString() : ''}
          </span>

          <Link to={`/shop/${id}`} className="product-link">
            VIEW DETAILS &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductCard