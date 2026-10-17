import { Link } from 'react-router-dom'

// Import category images
import collegeImg from '../assets/categories/college.jpg'
import everydayImg from '../assets/categories/everyday.jpg'
import travelImg from '../assets/categories/travel.jpg'
import workImg from '../assets/categories/work.jpg'

// Array of Category Data (React Best Practice: Data Separation)
const categories = [
  {
    id: 'college',
    number: '01 / ACADEMIA & TRANSIT',
    title: 'College',
    image: collegeImg,
    link: '/shop?category=college'
  },
  {
    id: 'work',
    number: '02 / EXECUTIVE & STUDIO',
    title: 'Work',
    image: workImg,
    link: '/shop?category=work'
  },
  {
    id: 'travel',
    number: '03 / LONG-HAUL & VOYAGE',
    title: 'Travel',
    image: travelImg,
    link: '/shop?category=travel'
  },
  {
    id: 'everyday',
    number: '04 / AGILE & ESSENTIAL',
    title: 'Everyday',
    image: everydayImg,
    link: '/shop?category=everyday'
  }
]

function ShopByPurpose() {
  return (
    <section className="purpose-section" id="categories">
      <div className="container">

        {/* Section Header */}
        <div className="section-header">
          <div className="header-left">
            <p className="eyebrow">CURATED CATEGORIES</p>
            <h2 className="section-title">Shop by Purpose</h2>
          </div>

          <p className="section-subtitle">
            Structured vessels intentionally balanced for the shifting postures of
            study, craft, velocity, and everyday rhythm.
          </p>
        </div>

        {/* Category Cards Grid (Rendered dynamically using .map) */}
        <div className="purpose-grid">
          {categories.map((category) => (
            <Link
              to={category.link}
              key={category.id}
              className="purpose-card"
            >
              <div className="purpose-image-wrap">
                <img src={category.image} alt={category.title} />
              </div>

              <div className="purpose-card-content">
                <span className="purpose-number">{category.number}</span>
                <h3 className="purpose-name">{category.title}</h3>
                <span className="purpose-cta">
                  EXPLORE SILHOUETTES &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}

export default ShopByPurpose
