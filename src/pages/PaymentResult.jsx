
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useShop } from '../context/ShopContext'

// Khalti redirects back with these query params:
// ?pidx=xxx&status=Completed&transaction_id=xxx&tidx=xxx&amount=xxx&mobile=xxx&purchase_order_id=xxx
// ?pidx=xxx&status=User canceled  (user pressed back/cancel)

function PaymentResult() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useShop()

  const pidx = searchParams.get('pidx')
  const khaltiStatus = searchParams.get('status') // Khalti's own status in the URL

  const [uiStatus, setUiStatus] = useState('checking') // checking | success | failed | cancelled | review
  const [headline, setHeadline] = useState('Verifying your payment…')
  const [detail, setDetail] = useState('')
  const [orderId, setOrderId] = useState(null)

  // Prevent double-verification on React StrictMode double-invoke
  const verifiedRef = useRef(false)

  useEffect(() => {
    if (verifiedRef.current) return
    verifiedRef.current = true

    async function verifyPayment() {
      // 1. Khalti itself tells us the payment was cancelled / user went back
      if (
        khaltiStatus &&
        (khaltiStatus.toLowerCase().includes('cancel') ||
          khaltiStatus.toLowerCase().includes('user canceled') ||
          khaltiStatus.toLowerCase() === 'expired')
      ) {
        setHeadline('Payment Cancelled')
        setDetail(
          'You cancelled the payment before it was completed. Your order has not been charged. You can return to checkout and try again.'
        )
        setUiStatus('cancelled')
        return
      }

      // 2. No pidx at all — something very wrong
      if (!pidx) {
        setHeadline('Missing Payment Reference')
        setDetail(
          'No payment reference was found in the return URL. If you completed a payment, please contact the store with your order details.'
        )
        setUiStatus('failed')
        return
      }

      // 3. Read the locally-saved pending order to match against Khalti's result
      let savedOrder = null
      try {
        savedOrder = JSON.parse(localStorage.getItem('bokyra_latest_order') || 'null')
      } catch {
        savedOrder = null
      }

      if (
        !savedOrder ||
        savedOrder.khaltiPidx !== pidx ||
        !savedOrder.orderId ||
        !Number.isFinite(Number(savedOrder.total))
      ) {
        setHeadline('Order Reference Mismatch')
        setDetail(
          'The saved BOKYRA order reference does not match this payment. If you believe you paid, note your Khalti transaction ID and contact the store. Do not pay again.'
        )
        setUiStatus('review')
        return
      }

      // 4. Ask our backend to verify the payment with Khalti
      try {
        const response = await fetch('http://localhost:5000/api/khalti/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pidx }),
        })

        const data = await response.json()

        // Backend returned an error (network error caught below, HTTP errors handled here)
        if (!response.ok) {
          const errMsg = data?.error || `Server error (HTTP ${response.status})`

          // 502 means Khalti lookup itself returned an error (e.g. 404 invalid pidx)
          if (response.status === 502) {
            setHeadline('Payment Verification Failed')
            setDetail(
              `We could not verify this payment with Khalti: ${errMsg}. ` +
              'This can happen if the payment was not completed or the Sandbox session expired. ' +
              'Please do not pay again — return to checkout and try a fresh payment.'
            )
            setUiStatus('failed')
            return
          }

          // 409 means amount mismatch — serious, needs manual review
          if (response.status === 409) {
            setHeadline('Amount Mismatch — Review Required')
            setDetail(
              errMsg +
              ' Please keep your Khalti receipt and contact the store. Do not attempt another payment for this order.'
            )
            setUiStatus('review')
            return
          }

          throw new Error(errMsg)
        }

        // 5. Payment is not yet completed (Pending / Initiated / User canceled via Khalti's API)
        if (!data.verified) {
          const s = data.status || 'Unknown'
          if (s === 'User canceled' || s.toLowerCase().includes('cancel')) {
            setHeadline('Payment Cancelled')
            setDetail(
              'Khalti confirms this payment was cancelled. Your order has not been charged. Return to checkout to try again.'
            )
            setUiStatus('cancelled')
          } else {
            setHeadline('Payment Not Completed')
            setDetail(
              `Khalti reports this payment as "${s}". If you believe this is an error, wait a few minutes and refresh, or contact the store with your order ID.`
            )
            setUiStatus('failed')
          }
          return
        }

        // 6. Verify locally that the pidx and orderId match what we saved
        if (
          savedOrder.khaltiPidx !== pidx ||
          savedOrder.orderId !== data.orderId
        ) {
          setHeadline('Order Mismatch')
          setDetail(
            'Khalti confirmed a payment but it does not match the saved BOKYRA order. ' +
            'Please keep your Khalti transaction ID and contact the store immediately. Do not pay again.'
          )
          setUiStatus('review')
          return
        }

        // 7. ✅ Payment verified! Update local state, clear cart, navigate to confirmation
        const confirmedOrder = {
          ...savedOrder,
          paymentStatus: 'paid',
          khaltiTransactionId: data.transactionId,
          // Overwrite total with backend-verified value (in NPR, converted from paisa)
          total: data.amount / 100,
        }

        localStorage.setItem('bokyra_latest_order', JSON.stringify(confirmedOrder))
        clearCart()

        setOrderId(data.orderId)
        setHeadline('Payment Successful!')
        setDetail('Your Khalti payment was verified successfully. Redirecting to your order confirmation…')
        setUiStatus('success')

        // Small delay then navigate to confirmation
        setTimeout(() => {
          navigate('/order-confirmation', { replace: true })
        }, 2000)
      } catch (error) {
        setHeadline('Verification Error')
        setDetail(
          error.message ||
          'Unable to verify the payment. Please try refreshing this page. If the problem persists, contact the store with your order ID.'
        )
        setUiStatus('failed')
      }
    }

    verifyPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const iconMap = {
    checking: '⏳',
    success: '✓',
    failed: '✕',
    cancelled: '↩',
    review: '⚠',
  }

  const colorMap = {
    checking: '#5C5852',
    success: '#137333',
    failed: '#b42318',
    cancelled: '#856404',
    review: '#7d3c98',
  }

  const bgMap = {
    checking: '#F6F4EF',
    success: '#e6f4ea',
    failed: '#fde8e6',
    cancelled: '#fffbeb',
    review: '#f5eafb',
  }

  const currentColor = colorMap[uiStatus]
  const currentBg = bgMap[uiStatus]

  return (
    <main
      className="container"
      style={{
        padding: '80px 20px 120px',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: currentBg,
          color: currentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: uiStatus === 'checking' ? '2rem' : '2.2rem',
          margin: '0 auto 24px',
          border: `2px solid ${currentColor}22`,
          transition: 'all 0.4s ease',
          animation: uiStatus === 'checking' ? 'spin 1.5s linear infinite' : 'none',
        }}
        aria-hidden="true"
      >
        {iconMap[uiStatus]}
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}
      >
        {headline}
      </h1>

      <p
        role="status"
        aria-live="polite"
        style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          margin: '0 auto 32px',
          maxWidth: '480px',
        }}
      >
        {detail}
      </p>

      {orderId && uiStatus === 'success' && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Order Reference: <strong>{orderId}</strong>
        </p>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {uiStatus === 'success' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/order-confirmation', { replace: true })}
          >
            VIEW ORDER CONFIRMATION →
          </button>
        )}

        {(uiStatus === 'failed' || uiStatus === 'cancelled') && (
          <Link to="/checkout" className="btn btn-primary">
            RETURN TO CHECKOUT
          </Link>
        )}

        {uiStatus === 'review' && (
          <>
            <Link to="/shop" className="btn btn-secondary">
              RETURN TO SHOP
            </Link>
            <Link to="/order-confirmation" className="btn btn-primary">
              VIEW ORDER DETAILS
            </Link>
          </>
        )}

        {uiStatus === 'checking' && (
          <button type="button" className="btn btn-secondary" disabled>
            Verifying…
          </button>
        )}
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}

export default PaymentResult
