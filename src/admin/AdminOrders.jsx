import { useEffect, useState, useMemo, useCallback } from 'react'
import { adminFetch } from './AdminLayout'
import './admin.css'

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const statusLabels = {
  all: 'All Orders',
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function OrderStatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase()
  return (
    <span className={`admin-status admin-status-${normalized}`}>
      <span className="admin-status-dot" aria-hidden="true" />
      {normalized ? normalized[0].toUpperCase() + normalized.slice(1) : '—'}
    </span>
  )
}

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  const loadOrders = useCallback(async () => {
    try {
      const query = status === 'all' ? '' : `?status=${encodeURIComponent(status)}`
      const data = await adminFetch(`/api/admin/orders${query}`)
      setOrders(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }, [status])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Close modal on Escape key press
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && selectedOrder) {
        setSelectedOrder(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedOrder])

  async function updateStatus(orderId, nextStatus) {
    setBusy(orderId)
    setError('')
    try {
      await adminFetch(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })
      // Update selectedOrder if it's currently open
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(prev => (prev ? { ...prev, orderStatus: nextStatus } : null))
      }
      await loadOrders()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  // Filter orders by Order ID or Customer Full Name (case-insensitive, partial matching)
  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return orders

    return orders.filter(order => {
      const orderId = String(order.orderId || '').toLowerCase()
      const customerName = String(order.customer?.fullName || '').toLowerCase()
      return orderId.includes(query) || customerName.includes(query)
    })
  }, [orders, searchQuery])

  return (
    <section>
      <header className="admin-topbar">
        <div>
          <h1>Orders Management</h1>
          <p className="admin-content-muted">Track and manage all customer orders.</p>
        </div>
      </header>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-panel">
        {/* Search Bar & Status Filter Bar */}
        <div className="admin-orders-controls">
          <div className="admin-search-box">
            <svg
              className="admin-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by order ID or customer name…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search orders by ID or customer name"
            />
            {searchQuery && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="admin-status-tabs" role="tablist" aria-label="Filter orders by status">
            <button
              type="button"
              role="tab"
              aria-selected={status === 'all'}
              className={`admin-status-tab ${status === 'all' ? 'active' : ''}`}
              onClick={() => setStatus('all')}
            >
              All Orders
            </button>
            {statuses.map(item => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={status === item}
                className={`admin-status-tab ${status === item ? 'active' : ''}`}
                onClick={() => setStatus(item)}
              >
                {statusLabels[item] || item}
              </button>
            ))}
          </div>

          {/* Synchronized select filter for compact view / test compatibility */}
          <select
            className="admin-filter admin-filter-select"
            aria-label="Filter orders"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="all">All orders</option>
            {statuses.map(item => (
              <option key={item} value={item}>
                {statusLabels[item] || item}
              </option>
            ))}
          </select>
        </div>

        {/* Orders Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Delivery status</th>
                <th>Update</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.orderId}>
                  <td>
                    <button
                      type="button"
                      className="admin-order-id-btn"
                      onClick={() => setSelectedOrder(order)}
                      title="Inspect order details"
                    >
                      {order.orderId}
                    </button>
                  </td>
                  <td>
                    <div className="admin-customer-cell">
                      <strong>{order.customer?.fullName || '—'}</strong>
                      {order.customer?.phone && (
                        <small>{order.customer.phone}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="admin-items-summary">
                      {order.items?.map(item => `${item.product?.name || 'Bag'} × ${item.quantity}`).join(', ') || '—'}
                    </span>
                  </td>
                  <td>
                    <strong>NPR {Number(order.total || 0).toLocaleString('en-IN')}</strong>
                  </td>
                  <td>
                    <div>
                      <span>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Khalti'}</span>
                      <br />
                      <span className={`admin-payment-badge admin-payment-${order.paymentStatus}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td>
                    <OrderStatusBadge status={order.orderStatus} />
                  </td>
                  <td>
                    <div className="admin-actions">
                      <select
                        aria-label={`Update ${order.orderId} status`}
                        value={order.orderStatus}
                        disabled={busy === order.orderId}
                        onChange={e => updateStatus(order.orderId, e.target.value)}
                      >
                        {statuses.map(item => (
                          <option key={item} value={item}>
                            {item[0].toUpperCase() + item.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-view-btn"
                      onClick={() => setSelectedOrder(order)}
                      title={`View details for ${order.orderId}`}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty state messages */}
          {!filteredOrders.length && (
            <div className="admin-empty">
              {searchQuery ? (
                <div>
                  <p>
                    No orders match <strong>"{searchQuery}"</strong>
                    {status !== 'all' ? ` with status "${statusLabels[status] || status}"` : ''}.
                  </p>
                  <button
                    type="button"
                    className="admin-text-button"
                    onClick={() => setSearchQuery('')}
                    style={{ marginTop: '8px' }}
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <p>
                  No {status === 'all' ? '' : `${statusLabels[status] || status} `}orders match this filter.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-details-title"
          onClick={() => setSelectedOrder(null)}
        >
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">ORDER DETAILS</span>
                <h2 id="order-details-title">{selectedOrder.orderId}</h2>
                <p className="admin-content-muted">
                  Placed on {selectedOrder.createdAt || '—'}
                </p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Status & Update Section */}
              <div className="admin-detail-status-card">
                <div>
                  <span className="admin-detail-label">Delivery Status</span>
                  <OrderStatusBadge status={selectedOrder.orderStatus} />
                </div>
                <div className="admin-detail-status-select-wrap">
                  <label htmlFor="modal-status-select" className="admin-detail-label">
                    Update Status
                  </label>
                  <select
                    id="modal-status-select"
                    className="admin-filter"
                    value={selectedOrder.orderStatus}
                    disabled={busy === selectedOrder.orderId}
                    onChange={e => updateStatus(selectedOrder.orderId, e.target.value)}
                  >
                    {statuses.map(item => (
                      <option key={item} value={item}>
                        {item[0].toUpperCase() + item.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Information */}
              <div className="admin-detail-section">
                <h3>Customer Information</h3>
                <div className="admin-detail-grid">
                  <div>
                    <span className="admin-detail-label">Full Name</span>
                    <p>{selectedOrder.customer?.fullName || '—'}</p>
                  </div>
                  <div>
                    <span className="admin-detail-label">Phone</span>
                    <p>{selectedOrder.customer?.phone || '—'}</p>
                  </div>
                  <div>
                    <span className="admin-detail-label">Email</span>
                    <p>{selectedOrder.customer?.email || '—'}</p>
                  </div>
                  <div>
                    <span className="admin-detail-label">Delivery Address</span>
                    <p>
                      {selectedOrder.customer?.address || '—'}
                      {selectedOrder.customer?.city ? `, ${selectedOrder.customer.city}` : ''}
                    </p>
                  </div>
                </div>
                {selectedOrder.customer?.notes && (
                  <div style={{ marginTop: '12px' }}>
                    <span className="admin-detail-label">Order Notes</span>
                    <p className="admin-detail-notes">{selectedOrder.customer.notes}</p>
                  </div>
                )}
              </div>

              {/* Ordered Products */}
              <div className="admin-detail-section">
                <h3>Ordered Products ({selectedOrder.items?.length || 0})</h3>
                <div className="admin-detail-items">
                  {selectedOrder.items?.map((item, index) => {
                    const productName = item.product?.name || item.name || 'Bag'
                    const price = Number(item.product?.price || item.price || 0)
                    const qty = Number(item.quantity || 1)
                    const itemTotal = price * qty

                    return (
                      <div key={item.cartItemId || index} className="admin-detail-item-row">
                        <div className="admin-detail-item-info">
                          <strong>{productName}</strong>
                          <span className="admin-content-muted">
                            {item.product?.displayCategory || item.product?.category || ''}
                          </span>
                          {item.customization && (
                            <span className="admin-monogram-tag">
                              Customization: {typeof item.customization === 'string' ? item.customization : JSON.stringify(item.customization)}
                            </span>
                          )}
                          {item.monogram && (
                            <span className="admin-monogram-tag">
                              Monogram: "{item.monogram}"
                            </span>
                          )}
                        </div>
                        <div className="admin-detail-item-pricing">
                          <span>NPR {price.toLocaleString('en-IN')} × {qty}</span>
                          <strong>NPR {itemTotal.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Payment & Financial Breakdown */}
              <div className="admin-detail-section">
                <h3>Payment & Financial Summary</h3>
                <div className="admin-detail-grid" style={{ marginBottom: '14px' }}>
                  <div>
                    <span className="admin-detail-label">Payment Method</span>
                    <p>
                      {selectedOrder.paymentMethod === 'cod'
                        ? 'Cash on Delivery (COD)'
                        : 'Digital (Khalti Payment)'}
                    </p>
                  </div>
                  <div>
                    <span className="admin-detail-label">Payment Status</span>
                    <p>
                      <span className={`admin-payment-badge admin-payment-${selectedOrder.paymentStatus}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </p>
                  </div>
                  {selectedOrder.khaltiTransactionId && (
                    <div>
                      <span className="admin-detail-label">Khalti Transaction ID</span>
                      <p><code>{selectedOrder.khaltiTransactionId}</code></p>
                    </div>
                  )}
                  {selectedOrder.khaltiPidx && (
                    <div>
                      <span className="admin-detail-label">Khalti Pidx</span>
                      <p><code>{selectedOrder.khaltiPidx}</code></p>
                    </div>
                  )}
                </div>

                <div className="admin-summary-box">
                  <div className="admin-summary-row">
                    <span>Subtotal</span>
                    <span>NPR {Number(selectedOrder.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="admin-summary-row">
                    <span>Delivery Fee</span>
                    <span>NPR {Number(selectedOrder.deliveryFee || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {Number(selectedOrder.discount || 0) > 0 && (
                    <div className="admin-summary-row admin-summary-discount">
                      <span>
                        Discount {selectedOrder.promoCode ? `(${selectedOrder.promoCode})` : ''}
                      </span>
                      <span>- NPR {Number(selectedOrder.discount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="admin-summary-row admin-summary-total">
                    <strong>Final Total</strong>
                    <strong>NPR {Number(selectedOrder.total || 0).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminOrders
