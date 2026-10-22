import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="container not-found-inner">
        <span className="not-found-eyebrow">404 • ROUTE UNCHARTED</span>
        <h1 className="not-found-title">The Silhouette You Seek Cannot Be Found</h1>
        <p className="not-found-subtitle">
          The atelier link you followed may have moved, expired, or been renamed. Allow us to guide you back to our carry silhouettes.
        </p>
        <div className="not-found-actions">
          <Link to="/shop" className="btn btn-primary">
            Browse All Bags
          </Link>
          <Link to="/" className="btn btn-secondary">
            Return to Atelier Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
