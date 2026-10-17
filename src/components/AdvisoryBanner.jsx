import { Link } from 'react-router-dom'
import walkImg from '../assets/advisory-walk.jpg'

function AdvisoryBanner() {
  return (
    <section className="advisory-section">
      <div className="container">
        <div className="advisory-card">
          <div className="advisory-content">
            <span className="eyebrow">
              <span className="advisory-icon">⚲</span> PERSONALIZED ADVISORY
            </span>

            <h2 className="advisory-title">
              Not sure which bag is right for you?
            </h2>

            <p className="advisory-description">
              Tell us what you need and we'll help you find your match. Answer four quick questions, and our bag finder will match you with a bag
              for what you carry, how you like to wear it, and your style.
            </p>

            <div className="advisory-action-group">
              <Link to="/find-my-bag" className="btn btn-primary">
                FIND MY BAG &rarr;
              </Link>
              <span className="advisory-note">
                TAKES ~60 SECONDS &bull; ZERO COMMITMENT
              </span>
            </div>
          </div>

          <div className="advisory-media-wrap">
            <span className="advisory-badge">DYNAMIC FIT ENGINE V2.4</span>
            <img
              src={walkImg}
              alt="Person carrying BOKYRA bag in minimalist architectural space"
              className="advisory-img"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdvisoryBanner
