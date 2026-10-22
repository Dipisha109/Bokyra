import { Link } from 'react-router-dom'
import artisanCraftImg from '../assets/artisan-craft.jpg'
import advisoryWalkImg from '../assets/advisory-walk.jpg'
import monogramTagImg from '../assets/monogram-tag.jpg'

function About() {
  return (
    <div className="about-page">
      {/* 1. Hero Banner */}
      <section className="about-hero">
        <div className="container about-hero-inner">
          <span className="about-eyebrow">THE BOKYRA ATELIER • KATHMANDU</span>
          <h1 className="about-hero-title">Form Follows Purpose. Crafted for the Modern Journey.</h1>
          <p className="about-hero-subtitle">
            We believe everyday carry goods shouldn't force a compromise between clean architectural aesthetics, structural utility, and generational artisanal leathercraft.
          </p>
        </div>
      </section>

      {/* 2. Story Section 1: Generational Craft */}
      <section className="about-story-section">
        <div className="container about-story-grid">
          <div className="about-story-media">
            <img
              src={artisanCraftImg}
              alt="BOKYRA master leathercraft artisan at the workbench"
              className="about-story-img"
            />
          </div>
          <div className="about-story-content">
            <span className="about-section-label">FROM KATHMANDU WITH INTENT</span>
            <h2 className="about-heading">Generational Hands. Contemporary Discipline.</h2>
            <p className="about-body-text">
              BOKYRA was founded in Kathmandu out of a quiet frustration with bags that were either overly technical and sport-focused, or fragile luxury showpieces that couldn't withstand the demands of real daily life.
            </p>
            <p className="about-body-text">
              Every silhouette is sculpted from the ground up in our atelier. We merge heavy-gauge weather-resistant textiles with full-grain vegetable-tanned leathers that soften, patina, and grow more distinct with every journey you undertake.
            </p>
            <div className="about-stat-row">
              <div className="about-stat-box">
                <span className="about-stat-num">100%</span>
                <span className="about-stat-text">Full-Grain Leather</span>
              </div>
              <div className="about-stat-box">
                <span className="about-stat-num">48+</span>
                <span className="about-stat-text">Hand Assembly Steps</span>
              </div>
              <div className="about-stat-box">
                <span className="about-stat-num">10-Yr</span>
                <span className="about-stat-text">Atelier Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Story Section 2: Architectural Utility */}
      <section className="about-story-section about-story-reversed">
        <div className="container about-story-grid">
          <div className="about-story-media">
            <img
              src={advisoryWalkImg}
              alt="Commuter with BOKYRA architectural leather tote"
              className="about-story-img"
            />
          </div>
          <div className="about-story-content">
            <span className="about-section-label">ENGINEERED FOR MOTION</span>
            <h2 className="about-heading">Quiet Precision in Every Seam & Pocket.</h2>
            <p className="about-body-text">
              A luxury bag must perform effortlessly. Whether you are navigating Kathmandu’s bustling city transit, airport security gates, or creative studio presentations, our silhouettes are calibrated to distribute weight evenly and protect your essential devices.
            </p>
            <p className="about-body-text">
              From suspended micro-fleece laptop cradles and concealed passport pockets to custom German Fidlock clasps, every touchpoint has been refined to eliminate friction from your day.
            </p>
            <Link to="/shop" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '12px' }}>
              Explore The Silhouettes →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Craftsmanship Pillars */}
      <section className="about-pillars-section">
        <div className="container">
          <div className="about-section-header">
            <span className="about-section-label">MATERIAL INTEGRITY</span>
            <h2 className="about-heading">The Three Pillars of BOKYRA Craft</h2>
          </div>

          <div className="about-pillars-grid">
            <div className="about-pillar-card">
              <span className="about-pillar-num">01</span>
              <h3 className="about-pillar-title">Vegetable-Tanned Leather</h3>
              <p className="about-pillar-desc">
                Cured using organic tree barks and natural oils rather than harmful heavy metals. It develops a rich, golden patina over years of use, telling the unique story of your travels.
              </p>
            </div>

            <div className="about-pillar-card">
              <span className="about-pillar-num">02</span>
              <h3 className="about-pillar-title">Ballistic & Waxed Weave</h3>
              <p className="about-pillar-desc">
                Heavyweight 1680D ballistic nylon and rugged waxed canvas repel monsoon downpours and resist abrasions while keeping the bag lightweight on your shoulders.
              </p>
            </div>

            <div className="about-pillar-card">
              <span className="about-pillar-num">03</span>
              <h3 className="about-pillar-title">Custom Solid Brass & YKK</h3>
              <p className="about-pillar-desc">
                Custom-cast solid brass hardware, hand-peened copper rivets, and heavy-gauge YKK weather-sealed zippers guaranteed never to jam or fail when you need them most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Customization & Monogramming Feature */}
      <section className="about-customizer-banner">
        <div className="container about-customizer-inner">
          <div className="about-customizer-media">
            <img
              src={monogramTagImg}
              alt="BOKYRA personalized 24k gold hot-foil monogram luggage tag"
              className="about-customizer-img"
            />
          </div>
          <div className="about-customizer-content">
            <span className="about-section-label">BESPOKE PERSONALIZATION</span>
            <h2 className="about-heading">Make It Indisputably Yours.</h2>
            <p className="about-body-text">
              We celebrate individuality. Through our digital customizer studio, you can preview matching leather colorways and have your initials hand-stamped onto an artisan bridle leather luggage tag in 24k Gold, Blind Deboss, or Matte Silver.
            </p>
            <div className="about-cta-btns">
              <Link to="/customize" className="btn btn-primary">
                Open Customizer Atelier ✦
              </Link>
              <Link to="/find-my-bag" className="btn btn-secondary">
                Find My Bag Quiz
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Atelier Promises, Warranty & Delivery */}
      <section className="about-promises-section" id="warranty">
        <div className="container">
          <div className="about-promises-grid">
            <div className="about-promise-item" id="warranty-card">
              <span className="about-promise-icon">🛡️</span>
              <h4>Lifetime Craft Guarantee</h4>
              <p>We repair any structural stitch, rivet, or hardware failure free of charge at our Kathmandu atelier.</p>
            </div>
            <div className="about-promise-item" id="delivery">
              <span className="about-promise-icon">📦</span>
              <h4>Delivery Across Nepal</h4>
              <p>Complimentary 2–4 day insured courier delivery across Kathmandu Valley and major cities in rigid gift boxes.</p>
            </div>
            <div className="about-promise-item" id="care">
              <span className="about-promise-icon">✨</span>
              <h4>Leather Care & Restoration</h4>
              <p>Complimentary natural beeswax leather balm and lifelong conditioning advice for every BOKYRA piece.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Contact & Atelier Studio */}
      <section className="about-contact-section" id="contact">
        <div className="container about-contact-box">
          <div className="about-contact-info">
            <span className="about-section-label">VISIT OR INQUIRE</span>
            <h3 className="about-contact-title">The BOKYRA Studio & Client Care</h3>
            <p className="about-contact-text">
              Have questions regarding custom monogramming, bulk corporate orders, or bespoke leather treatments? Our atelier team is here to assist.
            </p>
            <div className="about-contact-details">
              <div>📍 <strong>Atelier:</strong> Jhamsikhel, Lalitpur, Kathmandu, Nepal</div>
              <div>✉️ <strong>Inquiries:</strong> atelier@bokyra.com</div>
              <div>📞 <strong>Concierge:</strong> +977 (01) 552-4890 / WhatsApp Available</div>
              <div>⏰ <strong>Hours:</strong> Sunday – Friday, 10:00 AM – 6:30 PM NPT</div>
            </div>
          </div>
          <div className="about-contact-actions">
            <Link to="/shop" className="btn btn-primary" style={{ width: '100%' }}>
              Explore Bag Collection
            </Link>
            <Link to="/customize" className="btn btn-secondary" style={{ width: '100%' }}>
              Launch Customizer Studio
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About