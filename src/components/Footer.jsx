import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">

          {/* Brand Col */}
          <div className="footer-brand-col">
            <h3 className="footer-brand-name">&bull; BOKYRA</h3>
            <p className="footer-brand-desc">
              Simple, thoughtful design. Handcrafted leather bags made for your everyday journeys and built to last.
            </p>
            <p className="footer-locations">
              &bull; KATHMANDU
            </p>
          </div>

          {/* Links Column 1: Shop */}
          <div className="footer-links-col">
            <h4 className="footer-heading">SHOP</h4>
            <ul className="footer-list">
              <li><Link to="/shop">All Silhouettes</Link></li>
              <li><Link to="/shop?category=Backpack">Backpacks</Link></li>
              <li><Link to="/shop?category=Tote">Totes</Link></li>
              <li><Link to="/shop?category=Sling%20%2F%20Crossbody">Slings & Crossbody</Link></li>
              <li><Link to="/shop?category=Briefcase">Briefcases & Duffels</Link></li>
            </ul>
          </div>

          {/* Links Column 2: Discover */}
          <div className="footer-links-col">
            <h4 className="footer-heading">DISCOVER</h4>
            <ul className="footer-list">
              <li><Link to="/find-my-bag">Find My Bag Quiz</Link></li>
              <li><Link to="/customize">Personalized Customizer</Link></li>
              <li><Link to="/about">About The Atelier</Link></li>
              <li><Link to="/wishlist">Your Wishlist</Link></li>
            </ul>
          </div>

          {/* Links Column 3: Customer Care */}
          <div className="footer-links-col">
            <h4 className="footer-heading">CUSTOMER CARE</h4>
            <ul className="footer-list">
              <li><Link to="/about#delivery">Delivery Across Nepal</Link></li>
              <li><Link to="/about#care">Leather Care Guide</Link></li>
              <li><Link to="/about#warranty">Lifetime Warranty</Link></li>
              <li><Link to="/about#contact">Contact Atelier</Link></li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; 2026 BOKYRA Atelier. All rights reserved. Kathmandu, Nepal.
          </p>
          <div className="footer-legal-links">
            <Link to="/about#privacy">Privacy Policy</Link>
            <Link to="/about#terms">Terms of Craft</Link>
            <Link to="/about#contact">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
