import { useEffect, useState } from 'react'
import { adminFetch } from './AdminLayout'
import './admin.css'

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('all')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  async function loadOrders() {
    try {
      const query = status === 'all' ? '' : `?status=${encodeURIComponent(status)}`
      setOrders(await adminFetch(`/api/admin/orders${query}`))
      setError('')
    } catch (err) { setError(err.message) }
  }
  useEffect(() => { loadOrders() }, [status])

  async function updateStatus(orderId, nextStatus) {
    setBusy(orderId)
    setError('')
    try {
      await adminFetch(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH', body: JSON.stringify({ status: nextStatus }),
      })
      await loadOrders()
    } catch (err) { setError(err.message) }
    finally { setBusy('') }
  }

  return (
    <section>
      <header className="admin-topbar">
        <div><h1>Orders</h1><p className="admin-content-muted">Review purchases and update delivery progress.</p></div>
        <select className="admin-filter" aria-label="Filter orders" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">All orders</option>
          {statuses.map(item => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
        </select>
      </header>
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-panel"><div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Delivery status</th><th>Update</th></tr></thead>
          <tbody>{orders.map(order => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>{order.customer?.fullName || '—'}<br/><small>{order.customer?.phone || ''}</small></td>
              <td>{order.items?.map(item => `${item.product?.name || 'Bag'} × ${item.quantity}`).join(', ')}</td>
              <td>NPR {Number(order.total).toLocaleString('en-IN')}</td>
              <td>{order.paymentMethod}<br/><span className="admin-status">{order.paymentStatus}</span></td>
              <td><span className="admin-status">{order.orderStatus}</span></td>
              <td><div className="admin-actions">
                <select aria-label={`Update ${order.orderId} status`} value={order.orderStatus} disabled={busy === order.orderId} onChange={e => updateStatus(order.orderId, e.target.value)}>
                  {statuses.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
        {!orders.length && <p className="admin-empty">No orders match this filter.</p>}
      </div></div>
    </section>
  )
}
export default AdminOrders
