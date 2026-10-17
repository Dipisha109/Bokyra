import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()

  // Controlled component state for inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Feedback messages
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Handle keystrokes dynamically
  function handleChange(e) {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill out all required fields.')
      return
    }

    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters long.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.')
      return
    }

    // Save user to localStorage
    const newUser = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password
    }

    localStorage.setItem('bokyra_registered_user', JSON.stringify(newUser))
    
    // Automatically log in the newly registered user
    localStorage.setItem('bokyra_logged_user', JSON.stringify({
      name: newUser.name,
      email: newUser.email
    }))

    // Dispatch custom storage event so Navbar updates immediately
    window.dispatchEvent(new Event('storage'))

    setSuccess('Bokyra account created successfully! Redirecting...')

    setTimeout(() => {
      navigate('/')
    }, 1200)
  }

  return (
    <main className="auth-page">
      <div className="container">
        <div className="auth-card">

          <div className="auth-header">
            <span className="eyebrow">&bull; BOKYRA ATELIER</span>
            <h1 className="section-title">Create Account</h1>
            <p className="auth-subtitle">
              Join the Bokyra community for curated recommendations, personalized bag matching, and to place your order.
            </p>
          </div>

          {error && <div className="auth-alert error">{error}</div>}
          {success && <div className="auth-alert success">{success}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. Elena Thapa"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
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
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Re-type your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary auth-btn">
              CREATE BOKYRA PROFILE &rarr;
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign In</Link>
          </div>

        </div>
      </div>
    </main>
  )
}

export default Register
