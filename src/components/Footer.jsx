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
              <li><Link to="/shop">All Bags</Link></li>
              <li><Link to="/shop">Backpacks</Link></li>
              <li><Link to="/shop">Totes</Link></li>
              <li><Link to="/shop">Slings</Link></li>
              <li><Link to="/shop">Accessories</Link></li>
            </ul>
          </div>

          {/* Links Column 2: Discover */}
          <div className="footer-links-col">
            <h4 className="footer-heading">DISCOVER</h4>
            <ul className="footer-list">
              <li><Link to="/find-my-bag">Find My Bag</Link></li>
              <li><Link to="/customize">Customization </Link></li>
              <li><Link to="/about">About BOKYRA</Link></li>
            </ul>
          </div>

          {/* Links Column 3: Customer Care */}
          <div className="footer-links-col">
            <h4 className="footer-heading">CUSTOMER CARE</h4>
            <ul className="footer-list">
              <li><Link to="/about">Delivery</Link></li>
              <li><Link to="/about">Care & Repair</Link></li>
              <li><Link to="/about">Warranty</Link></li>
              <li><Link to="/about">Contact Us</Link></li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; 2026 BOKYRA. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <Link to="/about">Privacy Policy</Link>
            <Link to="/about">Terms of Service</Link>
            <Link to="/about">Legal</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
