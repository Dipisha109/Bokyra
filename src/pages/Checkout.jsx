import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext'

function Checkout() {
  const navigate = useNavigate()
  const { cart, clearCart } = useShop()

  // Read logged-in user if available to pre-fill their name & email
  const loggedUser = (() => {
    try {
      const raw = localStorage.getItem('bokyra_logged_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  // Controlled form state
  const [formData, setFormData] = useState({
    fullName: loggedUser?.name || '',
    email: loggedUser?.email || '',
    phone: '',
    address: '',
    city: 'Kathmandu',
    notes: ''
  })

  // Payment method selection ('cod' or 'digital')
  const [paymentMethod, setPaymentMethod] = useState('cod')

  // Calculation
  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  )
  const deliveryFee = subtotal > 0 ? (subtotal >= 10000 ? 0 : 250) : 0
  const finalTotal = subtotal + deliveryFee

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()

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
      total: finalTotal,
    }

    // Save order details to localStorage for the Order Confirmation page
    localStorage.setItem('bokyra_latest_order', JSON.stringify(orderData))

    // Clear the cart
    clearCart()

    // Navigate to Order Confirmation
    navigate('/order-confirmation')
  }

  // If cart is empty, redirect user gently
  if (cart.length === 0) {
    return (
      <main className="container" style={{ padding: '80px 32px', textAlign: 'center' }}>
        <h1 className="section-title">Your Bag is Empty</h1>
        <p style={{ margin: '16px 0 24px', color: 'var(--text-muted)' }}>
          Please add items to your bag before proceeding to checkout.
        </p>
        <Link to="/shop" className="btn btn-primary">Explore Catalog</Link>
      </main>
    )
  }

   return (
    <main className="checkout-page">
      <div className="container">
        
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <p className="eyebrow">&bull; ATELIER ORDER &bull; DISPATCH IN NEPAL</p>
          <h1 className="section-title">Shipping & Payment</h1>
        </div>

        <div className="checkout-grid">
          
          {/* Left Column: Delivery & Payment Form */}
          <section className="checkout-card">
            <form onSubmit={handleSubmit}>
              <h2 className="checkout-title">1. Delivery Information</h2>

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
                  <label className="checkout-label">Email Address *</label>
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
                  <label className="checkout-label">Phone Number (Nepal) *</label>
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
                    <option value="Kathmandu">Kathmandu Valley (Inside Ring Road)</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Outside Valley">Outside Valley (Standard Courier)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label className="checkout-label">Street / Area Address *</label>
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
                <h2 className="checkout-title">2. Select Payment Method</h2>

                <div className="payment-grid" role="radiogroup" aria-label="Payment method selection">
                  <label
                    className={`payment-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                    htmlFor="payment-cod"
                  >
                    <div className="payment-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="radio"
                          id="payment-cod"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="payment-radio"
                        />
                        <span className="payment-card-title">💵 Cash on Delivery</span>
                      </div>
                      <span className="payment-demo-badge">POPULAR</span>
                    </div>
                    <p className="payment-card-desc">
                      Pay in cash or mobile QR scan at your doorstep upon receiving your bag.
                    </p>
                  </label>

                  <label
                    className={`payment-card ${paymentMethod === 'digital' ? 'active' : ''}`}
                    htmlFor="payment-digital"
                  >
                    <div className="payment-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="radio"
                          id="payment-digital"
                          name="paymentMethod"
                          value="digital"
                          checked={paymentMethod === 'digital'}
                          onChange={() => setPaymentMethod('digital')}
                          className="payment-radio"
                        />
                        <span className="payment-card-title">📱 Digital Payment (Demo)</span>
                      </div>
                      <span className="payment-demo-badge">SIMULATED</span>
                    </div>
                    <p className="payment-card-desc">
                      Simulate payment via eSewa, Khalti, or Fonepay (No real money deducted).
                    </p>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>
                {paymentMethod === 'cod'
                  ? 'CONFIRM ORDER (CASH ON DELIVERY) →'
                  : 'CONFIRM SIMULATED PAYMENT →'}
              </button>
            </form>
          </section>

          {/* Right Column: Order Review */}
          <aside className="checkout-summary">
            <h3 className="checkout-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
              Order Review ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </h3>

            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
              {cart.map((item) => (
                <div key={item.cartItemId ?? item.product.id} className="checkout-item-row">
                  <img src={item.product.image} alt={item.product.name} className="checkout-item-img" />
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    <strong style={{ display: 'block' }}>{item.product.name}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</span>
                    {item.customization && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#8B4513' }}>
                        ✦ Custom ({item.customization.leather})
                      </span>
                    )}
                    <span style={{ display: 'block', fontWeight: 600, marginTop: '4px' }}>
                      NPR {(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span>Subtotal</span>
                <span>NPR {subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.88rem' }}>
                <span>Delivery (Nepal)</span>
                <span>{deliveryFee === 0 ? 'Complimentary' : `NPR ${deliveryFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
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
