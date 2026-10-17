import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import products from '../data/product'

const silhouetteCategories = [
  'All Silhouettes',
  'Backpack',
  'Tote',
  'Sling / Crossbody',
  'Briefcase',
  'Duffel'
]

const purposeCategories = [
  { id: 'all', label: 'All Purposes' },
  { id: 'college', label: 'College / Study' },
  { id: 'work', label: 'Work ' },
  { id: 'travel', label: 'Travel' },
  { id: 'everyday', label: 'Everyday / Comfort' }
]

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive initial values from URL query parameters
  const initialCategory = searchParams.get('category') || ''
  const initialPurpose = searchParams.get('purpose') || ''
  const initialQuery = searchParams.get('q') || searchParams.get('search') || ''

  // State: Search query & filters
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeSilhouette, setActiveSilhouette] = useState(() => {
    if (initialCategory) {
      const match = silhouetteCategories.find(
        (s) => s.toLowerCase() === initialCategory.toLowerCase()
      )
      if (match) return match
    }
    return 'All Silhouettes'
  })
  const [activePurpose, setActivePurpose] = useState(() => {
    if (initialPurpose) return initialPurpose.toLowerCase()
    if (initialCategory) {
      const match = purposeCategories.find(
        (p) => p.id === initialCategory.toLowerCase()
      )
      if (match) return match.id
    }
    return 'all'
  })
  const [sortBy, setSortBy] = useState('featured')

  // Reset all filters
  function handleReset() {
    setSearchQuery('')
    setActiveSilhouette('All Silhouettes')
    setActivePurpose('all')
    setSortBy('featured')
    setSearchParams({})
  }

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // 1. Silhouette filter
        const matchesSilhouette =
          activeSilhouette === 'All Silhouettes' ||
          p.category.toLowerCase() === activeSilhouette.toLowerCase() ||
          p.silhouette.toLowerCase() === activeSilhouette.toLowerCase()

        // 2. Purpose filter
        const matchesPurpose =
          activePurpose === 'all' ||
          p.purpose.toLowerCase() === activePurpose.toLowerCase()

        // 3. Search query filter
        const cleanQuery = searchQuery.trim().toLowerCase()
        const matchesSearch =
          !cleanQuery ||
          p.name.toLowerCase().includes(cleanQuery) ||
          p.category.toLowerCase().includes(cleanQuery) ||
          p.displayCategory.toLowerCase().includes(cleanQuery) ||
          p.purpose.toLowerCase().includes(cleanQuery) ||
          p.description.toLowerCase().includes(cleanQuery) ||
          (p.highlights &&
            p.highlights.some((h) => h.toLowerCase().includes(cleanQuery)))

        return matchesSilhouette && matchesPurpose && matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        if (sortBy === 'rating') return b.rating - a.rating
        return a.id - b.id // featured / default
      })
  }, [searchQuery, activeSilhouette, activePurpose, sortBy])

  return (
    <main className="shop-page">
      <div className="container" style={{ padding: '60px 32px 100px' }}>

        {/* Page Header */}
        <div className="shop-header">
          <p className="eyebrow">ATELIER CATALOG &bull; ALL SILHOUETTES</p>
          <h1 className="section-title">The Collection</h1>
          <p className="section-subtitle">
            Explore handcrafted architectural vessels designed for study, executive transit, long voyages, and everyday movement.
          </p>
        </div>

        {/* Search Bar & Sort Row */}
        <div className="shop-controls-bar">
          <div className="shop-search-wrapper">
            <span className="shop-search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="shop-search-input"
              placeholder="Search by bag name, material, laptop size, or purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search collection"
            />
            {searchQuery && (
              <button
                type="button"
                className="shop-search-clear"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="shop-sort-wrapper">
            <label htmlFor="shop-sort" className="shop-sort-label">Sort by:</label>
            <select
              id="shop-sort"
              className="shop-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured Editions</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Filter Categories: Silhouette Types */}
        <div className="filter-group">
          <span className="filter-group-title">Silhouette:</span>
          <div className="shop-filters">
            {silhouetteCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-tab ${activeSilhouette === cat ? 'active' : ''}`}
                onClick={() => setActiveSilhouette(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Categories: Purpose */}
        <div className="filter-group" style={{ marginTop: '16px' }}>
          <span className="filter-group-title">Purpose:</span>
          <div className="shop-filters">
            {purposeCategories.map((purpose) => (
              <button
                key={purpose.id}
                type="button"
                className={`filter-tab filter-tab-sub ${activePurpose === purpose.id ? 'active' : ''}`}
                onClick={() => setActivePurpose(purpose.id)}
              >
                {purpose.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Meta / Active Filters status */}
        <div className="shop-meta">
          <span className="shop-count">
            Showing <strong>{filteredProducts.length}</strong> of {products.length} Silhouettes
            {searchQuery && ` matching "${searchQuery}"`}
            {activeSilhouette !== 'All Silhouettes' && ` in ${activeSilhouette}`}
            {activePurpose !== 'all' && ` for ${purposeCategories.find(p => p.id === activePurpose)?.label}`}
          </span>

          {(searchQuery || activeSilhouette !== 'All Silhouettes' || activePurpose !== 'all' || sortBy !== 'featured') && (
            <button
              type="button"
              className="shop-reset-btn"
              onClick={handleReset}
            >
              Reset All Filters ✕
            </button>
          )}
        </div>

        {/* Product Grid or Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
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
        ) : (
          <div className="shop-empty-state">
            <div className="shop-empty-icon">🎒</div>
            <h3>No Silhouettes Match Your Criteria</h3>
            <p>
              We couldn't find any bags matching your current filters or search term. Try adjusting your search query or reset the filters.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleReset}
              style={{ marginTop: '16px' }}
            >
              Show All Bags ({products.length})
            </button>
          </div>
        )}

      </div>
    </main>
  )
}

export default Shop