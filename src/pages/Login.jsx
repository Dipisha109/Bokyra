import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.email.trim() || !formData.password) {
      setError('Please provide your email and password.')
      return
    }

    // Retrieve registered users from localStorage
    const existingRaw = localStorage.getItem('bokyra_registered_users')
    let registeredUsers = []
    try {
      registeredUsers = existingRaw ? JSON.parse(existingRaw) : []
    } catch {
      registeredUsers = []
    }

    // Support legacy single-user key if present
    const legacyUserJson = localStorage.getItem('bokyra_registered_user')
    if (legacyUserJson) {
      try {
        const legacy = JSON.parse(legacyUserJson)
        if (legacy && !registeredUsers.some((u) => u.email === legacy.email)) {
          registeredUsers.push({
            name: legacy.name,
            email: legacy.email,
            credentialToken: legacy.credentialToken || btoa(legacy.password || '')
          })
        }
      } catch {
        // ignore malformed legacy
      }
    }

    const emailClean = formData.email.trim().toLowerCase()
    const passwordToken = btoa(formData.password)

    const matchedUser = registeredUsers.find(
      (u) => u.email === emailClean && u.credentialToken === passwordToken
    )

    if (matchedUser) {
      // Successful match
      localStorage.setItem('bokyra_logged_user', JSON.stringify({
        name: matchedUser.name,
        email: matchedUser.email
      }))

      window.dispatchEvent(new Event('storage'))
      setSuccess(`Welcome back, ${matchedUser.name}!`)

      setTimeout(() => {
        navigate('/')
      }, 1000)
    } else {
      setError('Invalid email or password. Please verify your credentials or register an account.')
    }
  }

  return (
    <main className="auth-page">
      <div className="container">
        <div className="auth-card">

          <div className="auth-header">
            <span className="eyebrow">&bull; BOKYRA ACCESS</span>
            <h1 className="section-title">Sign In</h1>
            <p className="auth-subtitle">
              Access your BOKYRA profile, saved wishlists, and tailored orders.
            </p>
            <div style={{ marginTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '6px 12px', borderRadius: '4px', letterSpacing: '0.04em' }}>
              🔒 <strong>Frontend Demo:</strong> Credentials are verified client-side using simulated local sessions.
            </div>
          </div>

          {error && <div className="auth-alert error">{error}</div>}
          {success && <div className="auth-alert success">{success}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary auth-btn">
              SIGN IN TO Bokyra &rarr;
            </button>
          </form>

          <div className="auth-footer">
            Don't have a Bokyra account yet?{' '}
            <Link to="/register">Create Account</Link>
          </div>

        </div>
      </div>
    </main>
  )
}

export default Login
