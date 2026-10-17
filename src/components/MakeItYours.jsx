import { Link } from 'react-router-dom'
import craftImg from '../assets/artisan-craft.jpg'
import tagImg from '../assets/monogram-tag.jpg'

function MakeItYours() {
  return (
    <section className="make-it-yours-section">
      <div className="container">
        <div className="miy-grid">
          
          {/* Dual photo showcase */}
          <div className="miy-gallery">
            <div className="miy-photo-card card-craft">
              <img
                src={craftImg}
                alt="Artisan hand-stitching saddle leather"
                className="miy-img"
              />
            </div>
            <div className="miy-photo-card card-tag">
              <img
                src={tagImg}
                alt="Bespoke gold foil stamped initials A.L.R. on leather tag"
                className="miy-img"
              />
            </div>
          </div>

          {/* Narrative & Customization Call to action */}
          <div className="miy-narrative">
            {/* <span className="eyebrow">&bull; ATELIER BESPOKE</span> */}
            
            <h2 className="miy-title">Make it yours.</h2>

            <p className="miy-description">
              Customize selected BOKYRA bags with your preferred details. Select 
              handle drops, edge paint hues, and
              solid architectural hardware coatings.
            </p>

            <p className="miy-subtext">
              Each piece is individually numbered and completed by hand in our Kathmandu workshop. Please allow 4-6 weeks for completion.
            </p>

            <Link to="/customize" className="btn btn-secondary miy-btn">
              EXPLORE CUSTOMIZATION
            </Link>

            <div className="miy-features-grid">
              <div className="miy-feature-item">
                <span className="miy-feature-heading">HOT FOIL STAMPING</span>
                <span className="miy-feature-body">
                  Gold foil finishes.
                </span>
              </div>
              <div className="miy-feature-item">
                <span className="miy-feature-heading">TAILORED STRAPS</span>
                <span className="miy-feature-body">
                  Precision cut to your body dimensions.
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default MakeItYours
