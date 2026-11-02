
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext'

function Checkout() {
  const navigate = useNavigate()

  const {
    cart,
    clearCart,
    appliedPromo,
    setAppliedPromo,
    removeAppliedPromo,
  } = useShop()

  // Local input for entering a new promo code
  const [promoInput, setPromoInput] = useState('')
  const [promoMessage, setPromoMessage] = useState('')
  const [isCheckingPromo, setIsCheckingPromo] = useState(false)

  // Read logged-in user if available to pre-fill their name and email
  const loggedUser = (() => {
    try {
      const raw = localStorage.getItem('bokyra_logged_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  // Controlled delivery form state
  const [formData, setFormData] = useState({
    fullName: loggedUser?.name || '',
    email: loggedUser?.email || '',
    phone: '',
    address: '',
    city: 'Kathmandu',
    notes: '',
  })

  // Payment method selection ('cod' or 'digital')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  // Order calculation
  const subtotal = cart.reduce(
    (total, item) =>
      total + (item.customPrice ?? item.product.price) * item.quantity,
    0
  )

  const deliveryFee =
    subtotal > 0 ? (subtotal >= 10000 ? 0 : 250) : 0

  const discount = appliedPromo?.discount || 0
  const finalTotal = Math.max(0, subtotal + deliveryFee - discount)

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Validate a new promo code with the backend
  async function handleApplyPromo(e) {
    e.preventDefault()

    const clean = promoInput.trim().toUpperCase()

    if (!clean) {
      setPromoMessage('Please enter a promo code.')
      return
    }

    try {
      setIsCheckingPromo(true)
      setPromoMessage('')

      const response = await fetch(
        'http://localhost:5000/api/promotions/validate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: clean,
            subtotal,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Invalid promo code.')
      }

      setAppliedPromo({
        promoCode: clean,
        discount: Number(data.discount),
        promotion: data.promotion || null,
      })

      setPromoInput('')
      setPromoMessage('Promo code applied successfully!')
    } catch (error) {
      setPromoMessage(error.message)
    } finally {
      setIsCheckingPromo(false)
    }
  }

  // Remove the currently applied promo code
  function handleRemovePromo() {
    removeAppliedPromo()
    setPromoInput('')
    setPromoMessage('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (isProcessing) return

    setIsProcessing(true)
    setPaymentError('')

    const orderId = `BKR-${Date.now().toString().slice(-6)}`

    const orderData = {
      orderId,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      customer: formData,
      paymentMethod,
      items: cart,
      subtotal,
      deliveryFee,
      promoCode: appliedPromo?.promoCode || null,
      discount,
      total: finalTotal,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'initiated',
    }

    // Cash on Delivery: save the order in the backend database
    if (paymentMethod === 'cod') {
      try {
        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order: orderData }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Could not save your order.')
        }

        // Use the backend-calculated order details when available
        const confirmedOrder = {
          ...orderData,
          ...(data.order || {}),
        }

        localStorage.setItem(
          'bokyra_latest_order',
          JSON.stringify(confirmedOrder)
        )

        clearCart()
        navigate('/order-confirmation')
      } catch (error) {
        setPaymentError(
          error.message || 'Could not save your order. Please try again.'
        )
        setIsProcessing(false)
      }

      return
    }

    // Digital payment: ask the backend to initiate Khalti
    try {
      const response = await fetch(
        'http://localhost:5000/api/khalti/initiate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order: orderData }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.payment_url || !data.pidx) {
        throw new Error(
          data.error || 'Could not start Khalti payment.'
        )
      }

      // Save the backend-calculated order details for the return flow.
      // This does not mean the payment has succeeded.
      const pendingOrder = {
        ...orderData,
        ...(data.order || {}),
        khaltiPidx: data.pidx,
      }

      localStorage.setItem(
        'bokyra_latest_order',
        JSON.stringify(pendingOrder)
      )

      window.location.href = data.payment_url
    } catch (error) {
      setPaymentError(
        error.message || 'Unable to start payment. Please try again.'
      )
      setIsProcessing(false)
    }
  }

  // If cart is empty, redirect user gently
  if (cart.length === 0) {
    return (
      <main
        className="container"
        style={{ padding: '80px 32px', textAlign: 'center' }}
      >
        <h1 className="section-title">Your Bag is Empty</h1>

        <p style={{ margin: '16px 0 24px', color: 'var(--text-muted)' }}>
          Please add items to your bag before proceeding to checkout.
        </p>

        <Link to="/shop" className="btn btn-primary">
          Explore Catalog
        </Link>
      </main>
    )
  }

  return (
    <main className="checkout-page">
      <div className="container">

        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <p className="eyebrow">
            &bull; ATELIER ORDER &bull; DISPATCH IN NEPAL
          </p>

          <h1 className="section-title">Shipping & Payment</h1>
        </div>

        <div className="checkout-grid">

          {/* Left Column: Delivery & Payment Form */}
          <section className="checkout-card">
            <form onSubmit={handleSubmit}>
              <h2 className="checkout-title">
                1. Delivery Information
              </h2>

              <div className="form-row">
                <div>
                  <label className="checkout-label">Full Name *</label>

                  <input
                    type="text"
                    name="fullName"
                    className="checkout-input"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Elena Thapa"
                  />
                </div>

                <div>
                  <label className="checkout-label">
                    Email Address *
                  </label>

                  <input
                    type="email"
                    name="email"
                    className="checkout-input"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="elena@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="checkout-label">
                    Phone Number (Nepal) *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    className="checkout-input"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="98XXXXXXXX"
                  />
                </div>

                <div>
                  <label className="checkout-label">City *</label>

                  <select
                    name="city"
                    className="checkout-input"
                    value={formData.city}
                    onChange={handleChange}
                  >
                    <option value="Kathmandu">
                      Kathmandu Valley (Inside Ring Road)
                    </option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Outside Valley">
                      Outside Valley (Standard Courier)
                    </option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label className="checkout-label">
                  Street / Area Address *
                </label>

                <textarea
                  name="address"
                  className="checkout-input"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House/Street number, Ward, Landmark..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Payment Method Selection */}
              <div style={{ marginBottom: '28px' }}>
                <h2 className="checkout-title">
                  2. Select Payment Method
                </h2>

                <div
                  className="payment-grid"
                  role="radiogroup"
                  aria-label="Payment method selection"
                >
                  <label
                    className={`payment-card ${paymentMethod === 'cod' ? 'active' : ''
                      }`}
                    htmlFor="payment-cod"
                  >
                    <div className="payment-card-header">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <input
                          type="radio"
                          id="payment-cod"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="payment-radio"
                        />

                        <span className="payment-card-title">
                          💵 Cash on Delivery
                        </span>
                      </div>

                      <span className="payment-demo-badge">
                        POPULAR
                      </span>
                    </div>

                    <p className="payment-card-desc">
                      Pay in cash or mobile QR scan at your doorstep upon
                      receiving your bag.
                    </p>
                  </label>

                  <label
                    className={`payment-card ${paymentMethod === 'digital' ? 'active' : ''
                      }`}
                    htmlFor="payment-digital"
                  >
                    <div className="payment-card-header">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <input
                          type="radio"
                          id="payment-digital"
                          name="paymentMethod"
                          value="digital"
                          checked={paymentMethod === 'digital'}
                          onChange={() => setPaymentMethod('digital')}
                          className="payment-radio"
                        />

                        <span className="payment-card-title">
                          📱 Digital Payment (Demo)
                        </span>
                      </div>

                      <span className="payment-demo-badge">
                        SIMULATED
                      </span>
                    </div>

                    <p className="payment-card-desc">
                      Simulate payment via eSewa, Khalti, or Fonepay
                      (No real money deducted).
                    </p>
                  </label>
                </div>
              </div>

              {paymentError && (
                <p
                  role="alert"
                  style={{ color: 'red', marginBottom: '12px' }}
                >
                  {paymentError}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '16px' }}
                disabled={isProcessing}
              >
                {isProcessing
                  ? 'REDIRECTING TO PAYMENT...'
                  : paymentMethod === 'cod'
                    ? 'CONFIRM ORDER (CASH ON DELIVERY) →'
                    : 'PAY WITH KHALTI →'}
              </button>
            </form>
          </section>

          {/* Right Column: Order Review */}
          <aside className="checkout-summary">
            <h3
              className="checkout-title"
              style={{ fontSize: '1.1rem', marginBottom: '16px' }}
            >
              Order Review ({cart.length}{' '}
              {cart.length === 1 ? 'item' : 'items'})
            </h3>

            <div
              style={{
                maxHeight: '300px',
                overflowY: 'auto',
                marginBottom: '20px',
              }}
            >
              {cart.map((item) => {
                const itemPrice = item.customPrice ?? item.product.price

                return (
                  <div
                    key={item.cartItemId ?? item.product.id}
                    className="checkout-item-row"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="checkout-item-img"
                    />

                    <div style={{ flex: 1, fontSize: '0.85rem' }}>
                      <strong style={{ display: 'block' }}>
                        {item.product.name}
                      </strong>

                      <span style={{ color: 'var(--text-muted)' }}>
                        Qty: {item.quantity}
                      </span>

                      {item.customization && (
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            color: '#8B4513',
                          }}
                        >
                          ✦ Custom ({item.customization.leather})
                        </span>
                      )}

                      <span
                        style={{
                          display: 'block',
                          fontWeight: 600,
                          marginTop: '4px',
                        }}
                      >
                        NPR{' '}
                        {(itemPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Promo Code Section */}
            <div
              style={{
                borderTop: '1px solid var(--border-light)',
                paddingTop: '16px',
                marginBottom: '20px',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>
                Have a promo code?
              </h4>

              {!appliedPromo ? (
                <form
                  onSubmit={handleApplyPromo}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'stretch',
                  }}
                >
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value)
                      setPromoMessage('')
                    }}
                    placeholder="Enter promo code"
                    aria-label="Promo code"
                    className="checkout-input"
                    style={{ flex: 1, minWidth: 0 }}
                    disabled={isCheckingPromo || isProcessing}
                  />

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      isCheckingPromo ||
                      isProcessing ||
                      !promoInput.trim()
                    }
                    style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}
                  >
                    {isCheckingPromo ? 'Checking...' : 'Apply'}
                  </button>
                </form>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '4px',
                  }}
                >
                  <div>
                    <strong style={{ display: 'block' }}>
                      {appliedPromo.promoCode}
                    </strong>

                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Promo code applied
                    </span>

                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: 'green',
                        marginTop: '4px',
                      }}
                    >
                      Discount: - NPR {discount.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    disabled={isProcessing}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#a33',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {promoMessage && (
                <p
                  role="status"
                  style={{
                    marginTop: '8px',
                    fontSize: '0.82rem',
                    color: appliedPromo ? 'green' : '#b42318',
                  }}
                >
                  {promoMessage}
                </p>
              )}
            </div>

            {/* Price Summary */}
            <div
              style={{
                borderTop: '1px solid var(--border-light)',
                paddingTop: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '0.88rem',
                }}
              >
                <span>Subtotal</span>
                <span>NPR {subtotal.toLocaleString()}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '0.88rem',
                }}
              >
                <span>Delivery (Nepal)</span>
                <span>
                  {deliveryFee === 0
                    ? 'Complimentary'
                    : `NPR ${deliveryFee.toLocaleString()}`}
                </span>
              </div>

              {appliedPromo && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    fontSize: '0.88rem',
                    color: 'green',
                  }}
                >
                  <span>Promo Discount</span>
                  <span>
                    - NPR {discount.toLocaleString()}
                  </span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '12px',
                }}
              >
                <span>Total</span>
                <span>NPR {finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}

export default Checkout
