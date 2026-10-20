import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function OrderConfirmation() {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bokyra_latest_order')
      if (saved) {
        setOrder(JSON.parse(saved))
      }
    } catch {
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <main className="container" style={{ padding: '100px 32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving your order details...</p>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="container" style={{ padding: '100px 32px', textAlign: 'center' }}>
        <h1 className="section-title">No Active Order Found</h1>
        <p style={{ margin: '16px 0 32px', color: 'var(--text-muted)' }}>
          We could not find a recent order. If you haven't placed an order yet, browse our atelier collection.
        </p>
        <Link to="/shop" className="btn btn-primary">
          Explore Collection
        </Link>
      </main>
    )
  }

  return (
    <main className="order-confirmation-page">
      <div className="container" style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 24px 100px' }}>
        
        {/* Success Header */}
        <div className="confirmation-header" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#e6f4ea',
              color: '#137333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              margin: '0 auto 20px',
            }}
          >
            ✓
          </div>
          <p className="eyebrow">&bull; BOKYRA ATELIER ORDER CONFIRMED &bull;</p>
          <h1 className="section-title">Thank You for Your Order</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '0.95rem' }}>
            Your piece is being prepared for dispatch across Nepal. An order summary has been archived for your reference.
          </p>
        </div>

        {/* Order Details Card */}
        <div
          className="confirmation-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            padding: '36px',
            borderRadius: '4px',
            marginBottom: '32px',
          }}
        >
          {/* Metadata Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px',
              paddingBottom: '24px',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '28px',
            }}
          >
            <div>
              <span className="checkout-label">Order Reference</span>
              <strong style={{ fontSize: '1rem', letterSpacing: '0.06em' }}>{order.orderId}</strong>
            </div>

            <div>
              <span className="checkout-label">Date Placed</span>
              <span>{order.date}</span>
            </div>

            <div>
              <span className="checkout-label">Payment Method</span>
              <span>
                {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '📱 Digital Wallet (Demo)'}
              </span>
            </div>

            <div>
              <span className="checkout-label">Delivery Location</span>
              <span>{order.customer.city}, Nepal</span>
            </div>
          </div>

          {/* Delivery Recipient Info */}
          <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-serif)', marginBottom: '12px' }}>
              Delivery Recipient & Address
            </h3>
            <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>{order.customer.fullName}</strong></p>
            <p style={{ margin: '4px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{order.customer.address}, {order.customer.city}</p>
            <p style={{ margin: '4px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Phone: {order.customer.phone} &bull; Email: {order.customer.email}</p>
          </div>

          {/* Purchased Items List */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>
              Commissioned Pieces ({order.items.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border-light)',
                  }}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '2px' }}
                  />

                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>{item.product.name}</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Quantity: {item.quantity} &bull; NPR {item.product.price.toLocaleString()} each
                    </span>

                    {item.customization && (
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '0.78rem',
                          color: '#8B4513',
                          backgroundColor: '#faf6f0',
                          padding: '6px 10px',
                          borderRadius: '3px',
                          display: 'inline-block',
                        }}
                      >
                        ✦ Bespoke: {item.customization.leather} leather &bull; {item.customization.strap} strap
                        {item.customization.monogramEnabled && ` &bull; Initials: [${item.customization.initials}]`}
                      </div>
                    )}
                  </div>

                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    NPR {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div style={{ maxWidth: '320px', marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>NPR {order.subtotal.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
              <span>{order.deliveryFee === 0 ? 'Complimentary' : `NPR ${order.deliveryFee}`}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.15rem',
                fontWeight: 700,
                borderTop: '1px solid var(--border-light)',
                paddingTop: '12px',
                marginTop: '6px',
              }}
            >
              <span>Total Paid / Due</span>
              <span>NPR {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '14px 28px' }}>
            Explore More Silhouettes
          </Link>
          <Link to="/" className="btn btn-secondary" style={{ padding: '14px 28px' }}>
            Return to Atelier Home
          </Link>
        </div>

      </div>
    </main>
  )
}

export default OrderConfirmation
