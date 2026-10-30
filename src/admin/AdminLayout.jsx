import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './admin.css'

export async function adminFetch(path, options = {}) {
  const token = sessionStorage.getItem('bokyra_admin_token')
  const response = await fetch(`http://localhost:5000${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
      ...options.headers,
    },
  })
  const data = await response.json()
  if (response.status === 401) {
    sessionStorage.removeItem('bokyra_admin_token')
    sessionStorage.removeItem('bokyra_admin_username')
    window.location.assign('/admin/login')
    throw new Error('Your admin session expired. Please sign in again.')
  }
  if (!response.ok) throw new Error(data.error || 'Request failed.')
  return data
}

function AdminLayout() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let active = true
    adminFetch('/api/admin/me')
      .then(() => { if (active) setChecking(false) })
      .catch(err => {
        if (active) {
          setAuthError(err.message)
          navigate('/admin/login', { replace: true })
        }
      })
    return () => { active = false }
  }, [navigate])

  function logout() {
    sessionStorage.removeItem('bokyra_admin_token')
    sessionStorage.removeItem('bokyra_admin_username')
    navigate('/admin/login', { replace: true })
  }

  if (checking) return <div className="admin-login-page">{authError || 'Checking admin session…'}</div>

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">BOKYRA<small>ADMINISTRATION</small></div>
        <nav className="admin-nav">
          <NavLink end to="/admin">Overview</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
          <span title="Available in a later stage" style={{ color: '#9b978e', padding: '11px 12px', fontSize: 14 }}>Products · Later</span>
          <span title="Available in a later stage" style={{ color: '#9b978e', padding: '11px 12px', fontSize: 14 }}>Promotions · Later</span>
          <span title="Available in a later stage" style={{ color: '#9b978e', padding: '11px 12px', fontSize: 14 }}>Customers · Later</span>
          <span title="Available in a later stage" style={{ color: '#9b978e', padding: '11px 12px', fontSize: 14 }}>Reports · Later</span>
        </nav>
        <button className="admin-logout" onClick={logout}>Sign out</button>
      </aside>
      <main className="admin-main"><Outlet /></main>
    </div>
  )
}
export default AdminLayout
