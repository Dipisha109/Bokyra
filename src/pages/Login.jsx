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

    // Retrieve saved user from localStorage
    const savedUserJson = localStorage.getItem('bokyra_registered_user')
    const savedUser = savedUserJson ? JSON.parse(savedUserJson) : null

    if (
      savedUser &&
      savedUser.email === formData.email.trim().toLowerCase() &&
      savedUser.password === formData.password
    ) {
      // Successful match
      localStorage.setItem('bokyra_logged_user', JSON.stringify({
        name: savedUser.name,
        email: savedUser.email
      }))

      window.dispatchEvent(new Event('storage'))
      setSuccess(`Welcome back, ${savedUser.name}!`)

      setTimeout(() => {
        navigate('/')
      }, 1000)
    } else {
      // Fallback demo simulation if user hasn't registered yet or wants quick test
      if (!savedUser) {
        // Quick demo login: create instant session
        const fallbackName = formData.email.split('@')[0] || 'Collector'
        const cleanName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1)

        localStorage.setItem('bokyra_logged_user', JSON.stringify({
          name: cleanName,
          email: formData.email.trim().toLowerCase()
        }))

        window.dispatchEvent(new Event('storage'))
        setSuccess(`Welcome, ${cleanName}! (Demo Session)`)

        setTimeout(() => {
          navigate('/')
        }, 1000)
      } else {
        setError('Invalid email or password. Please verify your credentials.')
      }
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
              Access your Bokyra profile, saved wishlists, and tailored orders.
            </p>
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
