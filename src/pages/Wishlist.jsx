import { Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import products from '../data/product'

function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useShop()

  const savedProducts = products.filter((product) =>
    wishlist.includes(product.id)
  )

  return (
    <main className="wishlist-page">
      <div className="container">
        {/* Wishlist Header */}
        <div className="wishlist-header">
          <div className="wishlist-header-left">
            <span className="wishlist-eyebrow">YOUR ATELIER SELECTIONS</span>
            <h1 className="wishlist-title">Saved Silhouettes</h1>
            <p className="wishlist-subtitle">
              {savedProducts.length === 0
                ? 'Keep track of bags you love, compare materials, and return whenever you are ready.'
                : `You have ${savedProducts.length} ${savedProducts.length === 1 ? 'silhouette' : 'silhouettes'} saved in your atelier wishlist.`}
            </p>
          </div>

          {savedProducts.length > 0 && (
            <Link to="/shop" className="btn btn-secondary wishlist-continue-btn">
              Continue Shopping →
            </Link>
          )}
        </div>

        {/* Empty State vs Compact Wishlist Cards */}
        {savedProducts.length === 0 ? (
          <div className="wishlist-empty-card">
            <div className="wishlist-empty-icon">♡</div>
            <h2 className="wishlist-empty-title">Your Wishlist is Empty</h2>
            <p className="wishlist-empty-desc">
              Explore our architectural backpacks, structured totes, and handcrafted leather carry goods. Click the heart icon on any piece to save it here.
            </p>
            <div className="wishlist-empty-actions">
              <Link to="/shop" className="btn btn-primary">
                Explore The Collection
              </Link>
              <Link to="/find-my-bag" className="btn btn-secondary">
                Find My Bag Quiz
              </Link>
            </div>
          </div>
        ) : (
          <div className="wishlist-grid">
            {savedProducts.map((product) => (
              <div className="wishlist-card" key={product.id}>
                {/* Compact Thumbnail Container */}
                <div className="wishlist-card-media">
                  <Link to={`/shop/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="wishlist-card-img"
                    />
                  </Link>
                  <button
                    type="button"
                    className="wishlist-card-remove"
                    onClick={() => toggleWishlist(product.id)}
                    title="Remove from saved"
                    aria-label="Remove from wishlist"
                  >
                    ✕
                  </button>
                  {product.customizable && (
                    <span className="wishlist-custom-tag">✦ CUSTOMIZABLE</span>
                  )}
                </div>

                {/* Card Info & Actions */}
                <div className="wishlist-card-body">
                  <span className="wishlist-card-cat">
                    {product.displayCategory || product.category}
                  </span>
                  <Link to={`/shop/${product.id}`} className="wishlist-card-name-link">
                    <h3 className="wishlist-card-name">{product.name}</h3>
                  </Link>
                  <span className="wishlist-card-price">
                    NPR {product.price?.toLocaleString()}
                  </span>

                  <div className="wishlist-card-actions">
                    <button
                      type="button"
                      className="btn btn-primary wishlist-add-btn"
                      onClick={() => addToCart(product, 1)}
                      disabled={product.stockStatus === 'Sold Out'}
                      style={product.stockStatus === 'Sold Out' ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                    >
                      {product.stockStatus === 'Sold Out' ? 'Sold Out' : 'Add to Bag'}
                    </button>
                    <Link to={`/shop/${product.id}`} className="wishlist-card-details-link">
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Wishlist