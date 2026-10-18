import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import products from '../data/product'

function FeaturedSilhouettes() {
  // Showcase top 6 curated silhouettes on the landing page
  const featured = products.slice(0, 6)

  return (
    <section className="silhouettes-section">
      <div className="container">

        {/* Section Header */}
        <div className="section-header">
          <div className="header-left">
            <p className="eyebrow">CORE RELEASES </p>
            <h2 className="section-title">Featured Silhouettes</h2>
          </div>

          <p className="section-subtitle">
            Engineered for durability, refined for everyday velocity and architectural permanence.
          </p>
        </div>

        {/* Dynamic Product Grid */}
        <div className="products-grid">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.displayCategory || product.category}
              price={product.price}
              image={product.image}
              stockStatus={product.stockStatus}
              customizable={product.customizable}
            />
          ))}
        </div>

        {/* Call to action linking to full catalog */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link to="/shop" className="btn btn-secondary" style={{ padding: '16px 36px', fontSize: '0.82rem', letterSpacing: '0.08em' }}>
            VIEW ALL {products.length} SILHOUETTES IN SHOP &rarr;
          </Link>
        </div>

      </div>
    </section>
  )
}

export default FeaturedSilhouettes
