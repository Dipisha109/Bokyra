import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'

function Cart() {
  const { cart, removeFromCart, updateQuantity } = useShop()
  const [promoCode, setPromoCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [promoMessage, setPromoMessage] = useState(null) // { type: 'success' | 'error', text: string }

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const rawSubtotal = cart.reduce(
    (total, item) => total + (item.customPrice ?? item.product.price) * item.quantity,
    0
  )

  const discountAmount = Math.round(rawSubtotal * discountPercent)
  const finalTotal = Math.max(0, rawSubtotal - discountAmount)

  function handleApplyPromo(e) {
    e.preventDefault()
    const clean = promoCode.trim().toUpperCase()
    if (!clean) return

    if (clean === 'BOKYRA10' || clean === 'ATELIER10') {
      setDiscountPercent(0.1)
      setPromoMessage({ type: 'success', text: '10% Atelier Privilège discount applied!' })
    } else {
      setDiscountPercent(0)
      setPromoMessage({ type: 'error', text: 'Invalid promo code. Try "BOKYRA10"' })
    }
  }

  function handleRemovePromo() {
    setDiscountPercent(0)
    setPromoCode('')
    setPromoMessage(null)
  }

  return (
    <main className="cart-page">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">Your Bag</h1>
          <p className="page-count">
            {totalItems} {totalItems === 1 ? 'silhouette' : 'silhouettes'} in atelier queue
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛍️</div>
            <h2>Your bag is empty</h2>
            <p>
              Browse our architectural collection and discover pieces tailored to your daily carry.
            </p>
            <Link to="/shop" className="btn btn-primary">
              Explore Collection &rarr;
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map((item) => {
                const product = item.product
                const itemUnitCost = item.customPrice ?? product.price
                const itemKey = item.cartItemId ?? product.id

                return (
                  <article className="cart-item" key={itemKey}>
                    <Link to={`/shop/${product.id}`} className="cart-item-image-link" tabIndex={-1} aria-hidden="true">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="cart-item-image"
                        loading="lazy"
                      />
                    </Link>

                    <div className="cart-item-info">
                      <div className="cart-item-header">
                        <span className="product-category">
                          {product.category || 'Silhouettes'}
                        </span>
                        {item.customization && (
                          <span className="cart-bespoke-tag">✦ BESPOKE</span>
                        )}
                      </div>

                      <Link to={`/shop/${product.id}`} className="cart-item-title-link">
                        <h3>{product.name}</h3>
                      </Link>

                      <p className="cart-item-unit-price">
                        NPR {itemUnitCost.toLocaleString()} each
                      </p>

                      {item.customization && (
                        <div className="cart-customization-pill-box">
                          <span className="cart-pill">Tone: {item.customization.leather}</span>
                          <span className="cart-pill">
                            Strap: {item.customization.strap === 'wide' ? 'Wide Ergonomic' : 'Standard'}
                          </span>
                          {item.customization.laptopSleeve && (
                            <span className="cart-pill">+ Laptop Sleeve</span>
                          )}
                          {item.customization.secretPocket && (
                            <span className="cart-pill">+ Hidden Pocket</span>
                          )}
                          {item.customization.monogramEnabled && (
                            <span className="cart-pill">
                              Monogram: [{item.customization.initials}] ({item.customization.stampingFinish})
                            </span>
                          )}
                        </div>
                      )}

                      <div className="cart-item-actions">
                        <div className="pd-quantity">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(itemKey)}
                          title="Remove item from bag"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <strong className="cart-item-total">
                      NPR {(itemUnitCost * item.quantity).toLocaleString()}
                    </strong>
                  </article>
                )
              })}
            </div>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>NPR {rawSubtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="cart-summary-row cart-discount-row">
                  <span>Privilège Discount (10%)</span>
                  <span>− NPR {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="cart-summary-row">
                <span>Atelier Shipping (Nepal)</span>
                <span className="cart-free-tag">COMPLIMENTARY</span>
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="cart-promo-form">
                <div className="cart-promo-input-row">
                  <input
                    type="text"
                    className="cart-promo-input"
                    placeholder="Promo code (e.g. BOKYRA10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    aria-label="Enter promotional discount code"
                  />
                  <button type="submit" className="cart-promo-btn">
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <div className={`cart-promo-msg ${promoMessage.type}`}>
                    <span>{promoMessage.text}</span>
                    {discountAmount > 0 && (
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="cart-promo-remove"
                        title="Remove promo"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </form>

              <div className="cart-summary-total">
                <span>Estimated Total</span>
                <strong>NPR {finalTotal.toLocaleString()}</strong>
              </div>

              <p className="cart-summary-note">
                Taxes, atelier inspection, and local delivery are included.
              </p>

              <Link
                to="/checkout"
                className="btn btn-primary cart-checkout-btn"
              >
                Proceed to Checkout &rarr;
              </Link>

              <Link to="/shop" className="cart-continue-link">
                &larr; Continue Exploring Collection
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}

export default Cart