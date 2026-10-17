import { Link } from 'react-router-dom'
import heroBag from '../assets/hero-bag.jpg'

function Hero() {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">

          {/* Left Column: Editorial Copy, CTAs, and Specs */}
          <div className="hero-content">
            <p className="eyebrow">• COLLECTION 2026</p>

            <h1 className="hero-headline">
              Find the bag that fits your life.
            </h1>

            <p className="hero-description">
              Discover bags designed around your style, purpose and everyday needs.
              Made with balanced design, lasting quality, and everyday usefulness.
            </p>

            <div className="hero-buttons">
              <Link to="/find-my-bag" className="btn btn-primary">
                FIND MY BAG &rarr;
              </Link>

              <Link to="/shop" className="btn btn-secondary">
                SHOP COLLECTION
              </Link>
            </div>

            <div className="hero-specs">
              <div className="spec-item">
                <strong className="spec-value">01</strong>
                <span className="spec-label">FULL-GRAIN VACHETTA</span>
              </div>

              <div className="spec-item">
                <strong className="spec-value">Lifetime</strong>
                <span className="spec-label">REPAIR GUARANTEE</span>
              </div>

              {/* <div className="spec-item">
                <strong className="spec-value">0.8mm</strong>
                <span className="spec-label">PRECISION EDGE PAINT</span>
              </div> */}
            </div>
          </div>

          {/* Right Column: Hero Bag Image & Architectural Badge */}
          <div className="hero-image-col">
            <div className="hero-image-wrapper">
              <img src={heroBag} alt="BOKYRA Forme 01 Basalt Backpack" />

              <div className="hero-badge-overlay">
                <div className="hero-badge-left">
                  <span className="hero-badge-edition">EDITION</span>
                  <strong className="hero-badge-name">The Forme 01 Basalt Backpack</strong>
                </div>
                <span className="hero-badge-count">Edition 240 / 500</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default Hero