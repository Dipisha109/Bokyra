import { useEffect, useMemo, useState } from 'react'
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

// Common everyday and localized synonyms for user queries (e.g., office, clg, side bag, jhola)
const searchSynonyms = {
  office: ['work', 'executive', 'briefcase', 'formal'],
  school: ['college', 'backpack', 'study', 'student', 'lecture'],
  clg: ['college', 'campus', 'backpack', 'lecture'],
  college: ['college', 'campus', 'lecture', 'study'],
  uni: ['college', 'campus'],
  daily: ['everyday', 'commute', 'agile'],
  outing: ['everyday', 'casual', 'sling', 'crossbody'],
  casual: ['everyday', 'sling'],
  side: ['sling', 'crossbody'],
  gym: ['travel', 'duffel', 'weekender'],
  tour: ['travel', 'duffel', 'trip', 'voyage'],
  trek: ['travel', 'duffel', 'expedition'],
  trip: ['travel', 'weekender', 'transit'],
  flight: ['travel', 'cabin', 'tsa'],
  jhola: ['backpack', 'tote', 'bag'],
  bag: ['backpack', 'tote', 'sling', 'crossbody', 'briefcase', 'duffel', 'pack'],
  bags: ['backpack', 'tote', 'sling', 'crossbody', 'briefcase', 'duffel', 'pack'],
  laptop: ['laptop', 'sleeve', 'tech', 'macbook'],
  macbook: ['laptop', '14–16"', '16"'],
  rain: ['weatherproof', 'waterproof', 'water-resistant', 'storm'],
  waterproof: ['weatherproof', 'water-resistant', 'storm', 'ballistic'],
}

// Checks if a text contains a search term or its stem / common synonyms
function termMatchesText(text, term) {
  if (!text || !term) return false
  const lowerText = text.toLowerCase()

  // 1. Direct substring match (e.g. "apex" in "The Apex Modular")
  if (lowerText.includes(term)) return true

  // 2. Partial prefix / typo tolerance (e.g. "backpac" matches "backpack")
  if (term.length >= 4) {
    const stem = term.slice(0, -1) // e.g. "backpa" from "backpac"
    const words = lowerText.split(/[\s/–-]+/)
    if (words.some((w) => w.startsWith(stem) || (w.length >= 4 && stem.startsWith(w.slice(0, 4))))) {
      return true
    }
  }

  // 3. Synonym dictionary matching (e.g. "office" matches "work", "side" matches "sling")
  const synonyms = searchSynonyms[term] || []
  if (synonyms.some((syn) => lowerText.includes(syn))) {
    return true
  }

  return false
}

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

  // Keep state synchronized whenever URL search parameters change (e.g. from header search or nav dropdown)
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search') || ''
    setSearchQuery(q)
    const cat = searchParams.get('category') || ''
    if (cat) {
      const match = silhouetteCategories.find(
        (s) => s.toLowerCase() === cat.toLowerCase()
      )
      if (match) setActiveSilhouette(match)
    } else {
      setActiveSilhouette('All Silhouettes')
    }
  }, [searchParams])

  // Reset all filters
  function handleReset() {
    setSearchQuery('')
    setActiveSilhouette('All Silhouettes')
    setActivePurpose('all')
    setSortBy('featured')
    setSearchParams({})
  }

  // Filter and sort products with multi-word search, partial matching, and relevance ranking
  const filteredProducts = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase()
    const queryTerms = cleanQuery ? cleanQuery.split(/\s+/).filter(Boolean) : []

    // 1. Filter matching products and calculate relevance score
    const matching = products
      .map((p) => {
        // Silhouette filter
        const matchesSilhouette =
          activeSilhouette === 'All Silhouettes' ||
          p.category.toLowerCase() === activeSilhouette.toLowerCase() ||
          p.silhouette.toLowerCase() === activeSilhouette.toLowerCase()

        // Purpose filter
        const matchesPurpose =
          activePurpose === 'all' ||
          p.purpose.toLowerCase() === activePurpose.toLowerCase()

        if (!matchesSilhouette || !matchesPurpose) {
          return null
        }

        // If no search query, keep product
        if (queryTerms.length === 0) {
          return { product: p, relevanceScore: 0 }
        }

        const nameLower = p.name.toLowerCase()
        const categoryLower = (p.displayCategory || p.category).toLowerCase()
        const purposeLower = p.purpose.toLowerCase()
        const descLower = p.description.toLowerCase()
        const highlightsLower = (p.highlights || []).join(' ').toLowerCase()
        const fullContent = `${nameLower} ${categoryLower} ${purposeLower} ${descLower} ${highlightsLower}`

        // Multi-word: Every term (or its partial stem/synonym) must match at least one attribute
        const allTermsMatch = queryTerms.every((term) =>
          termMatchesText(fullContent, term)
        )

        if (!allTermsMatch) {
          return null
        }

        // Relevance Scoring: Direct name matches score highest, then category, then features
        let score = 0
        if (nameLower === cleanQuery) score += 100
        else if (nameLower.startsWith(cleanQuery)) score += 60

        queryTerms.forEach((term) => {
          if (nameLower.includes(term)) score += 35
          if (categoryLower.includes(term)) score += 25
          if (purposeLower.includes(term)) score += 20
          if (descLower.includes(term) || highlightsLower.includes(term)) score += 10
        })

        return { product: p, relevanceScore: score }
      })
      .filter(Boolean)

    // 2. Sort results (respects user sort, or ranks by relevance if searching)
    return matching
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.product.price - b.product.price
        if (sortBy === 'price-high') return b.product.price - a.product.price
        if (sortBy === 'rating') return b.product.rating - a.product.rating
        if (sortBy === 'name-az') return a.product.name.localeCompare(b.product.name)
        if (queryTerms.length > 0) return b.relevanceScore - a.relevanceScore // Relevance first when searching
        return a.product.id - b.product.id // Default / featured
      })
      .map((item) => item.product)
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
              placeholder="Search by name, purpose (e.g. office, college, side bag, travel)..."
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
              <option value="name-az">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Quick Search Suggestions for Nepali / Everyday Users */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', margin: '-16px 0 24px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span>Popular searches:</span>
          {['Office bag', 'College', 'Side bag', 'Laptop', 'Travel'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchQuery(tag)}
              style={{
                background: searchQuery.toLowerCase() === tag.toLowerCase() ? 'var(--text-primary)' : 'none',
                color: searchQuery.toLowerCase() === tag.toLowerCase() ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '3px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tag}
            </button>
          ))}
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