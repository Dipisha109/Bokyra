import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './admin.css'

function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to sign in.')
      sessionStorage.setItem('bokyra_admin_token', data.token)
      sessionStorage.setItem('bokyra_admin_username', data.username)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-eyebrow">BOKYRA · MANAGEMENT</div>
        <h1>Admin sign in</h1>
        <p className="admin-muted">Sign in to manage orders and store activity.</p>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <label className="admin-field">Username
          <input autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required />
        </label>
        <label className="admin-field">Password
          <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button className="admin-button" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Signing in…' : 'SIGN IN'}
        </button>
        <p className="admin-muted" style={{ marginTop: 22 }}><Link to="/" style={{ color: 'inherit' }}>← Back to BOKYRA store</Link></p>
      </form>
    </main>
  )
}
export default AdminLogin
