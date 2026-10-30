import { useEffect, useState } from 'react'
import { adminFetch } from './AdminLayout'
import './admin.css'

const money = value => `NPR ${Number(value || 0).toLocaleString('en-IN')}`

function AdminDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    adminFetch('/api/admin/dashboard').then(setData).catch(err => setError(err.message))
  }, [])

  if (error) return <p className="admin-error">{error}</p>
  if (!data) return <p className="admin-content-muted">Loading dashboard…</p>
  const stats = data.stats

  return (
    <section>
      <header className="admin-topbar">
        <div><h1>Overview</h1><p className="admin-content-muted">A snapshot of BOKYRA store activity.</p></div>
        <span className="admin-muted">Welcome, {sessionStorage.getItem('bokyra_admin_username')}</span>
      </header>
      <div className="admin-stat-grid">
        <div className="admin-stat"><span>Total orders</span><strong>{stats.totalOrders}</strong></div>
        <div className="admin-stat"><span>Paid Khalti sales</span><strong>{money(stats.paidSales)}</strong></div>
        <div className="admin-stat"><span>Pending orders</span><strong>{stats.pendingOrders}</strong></div>
        <div className="admin-stat"><span>Delivered orders</span><strong>{stats.deliveredOrders}</strong></div>
      </div>
      <div className="admin-panel">
        <h2>Recent orders</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Order status</th></tr></thead>
            <tbody>{data.recentOrders.map(order => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td><td>{order.customer?.fullName || '—'}</td>
                <td>{order.createdAt}</td><td>{money(order.total)}</td>
                <td>{order.paymentMethod} · {order.paymentStatus}</td>
                <td><span className="admin-status">{order.orderStatus}</span></td>
              </tr>
            ))}</tbody>
          </table>
          {!data.recentOrders.length && <p className="admin-empty">No orders have been recorded yet.</p>}
        </div>
      </div>
      <p className="admin-content-muted" style={{ marginTop: 14 }}>
        Sales currently counts successfully paid Khalti orders only. COD orders remain excluded until collection is confirmed; we'll improve revenue reporting in a later stage.
      </p>
    </section>
  )
}
export default AdminDashboard
