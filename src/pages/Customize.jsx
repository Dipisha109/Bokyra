import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import products from '../data/product'
import { useShop } from '../context/ShopContext'
import apexTanImg from '../assets/products/apex-modular-tan.jpg'
import sveltoTanImg from '../assets/products/svelto-tote-tan.jpg'
import veloceTanImg from '../assets/products/veloce-backpack-tan.jpg'

// Map each customizable product to its leather color variants
const productVariantImages = {
  1: { tan: apexTanImg },
  2: { tan: sveltoTanImg },
  6: { tan: veloceTanImg },
}

// Leather colors configuration
const leatherColors = [
  { id: 'tan', label: 'Rich Tan', subtitle: 'Saddle Bridle', hex: '#8B4513', price: 0 },
  { id: 'black', label: 'Matte Black', subtitle: 'Obsidian Grain', hex: '#1C1C1C', price: 0 },
]

const customizableProducts = products.filter(
  (product) =>
    product.customizable === true &&
    product.stockStatus === 'In Stock'
)


function Customize() {
  // Read the product ID from the URL
  const { addCustomizedToCart } = useShop()
  const [searchParams] = useSearchParams()
  const productId = searchParams.get('productId')

  // Find the requested bag, or use the first customizable bag
  const initialProduct =
    customizableProducts.find(
      (product) => String(product.id) === productId
    ) || customizableProducts[0]

  // Store the selected bag
  const [selectedProduct, setSelectedProduct] =
    useState(initialProduct)

  // Update the selected bag when the URL product ID changes
  useEffect(() => {
    const matchingProduct = customizableProducts.find(
      (product) => String(product.id) === productId
    )

    if (matchingProduct) {
      setSelectedProduct(matchingProduct)
    }
  }, [productId])

  const basePrice = selectedProduct.price

  // State: selected options
  const [selectedLeather, setSelectedLeather] = useState(leatherColors[0])
  const [strapOption, setStrapOption] = useState('standard') // 'standard' (+0) or 'wide' (+1500)
  const [laptopSleeve, setLaptopSleeve] = useState(false) // (+1200)
  const [secretPocket, setSecretPocket] = useState(false) // (+800)
  const [monogramEnabled, setMonogramEnabled] = useState(true) // (+600)
  const [initials, setInitials] = useState('B . K . R')
  const [stampingFinish, setStampingFinish] = useState('gold') // 'gold' or 'blind'
  const [addedToCart, setAddedToCart] = useState(false)

  // Dynamic live total calculation
  const strapCost = strapOption === 'wide' ? 1500 : 0
  const sleeveCost = laptopSleeve ? 1200 : 0
  const pocketCost = secretPocket ? 800 : 0
  const monogramCost = monogramEnabled ? 600 : 0
  const totalPrice = basePrice + strapCost + sleeveCost + pocketCost + monogramCost

  
  // Determine active preview image based on model and selected leather tone
  const activeImage =
    selectedLeather.id === 'tan' && productVariantImages[selectedProduct.id]?.tan
      ? productVariantImages[selectedProduct.id].tan
      : selectedProduct.image

  function handleResetCustomization() {
    setSelectedLeather(leatherColors[0])
    setStrapOption('standard')
    setLaptopSleeve(false)
    setSecretPocket(false)
    setMonogramEnabled(true)
    setInitials('B . K . R')
    setStampingFinish('gold')
  }

  function handleOrder() {
    const customization = {
      leather: selectedLeather.label,
      strap: strapOption,
      laptopSleeve,
      secretPocket,
      monogramEnabled,
      initials: monogramEnabled ? initials.trim() : '',
      stampingFinish: monogramEnabled ? stampingFinish : '',
    }

    addCustomizedToCart(
      { ...selectedProduct, image: activeImage },
      customization,
      totalPrice
    )

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }


  return (
    <main className="customize-page">
      <div className="container">

        {/* Breadcrumb Header */}
        <div className="customize-header">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/shop">Atelier Custom</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Make It Yours</span>
          </nav>
          <div className="customize-title-row">
            <div>
              <p className="eyebrow">&bull; BOKYRA &bull; ARCHITECTURAL EDITION</p>
              <h1 className="section-title">Make It Yours</h1>
            </div>
            <p className="customize-subtitle">
              Customize your bag with details that feel like you. Each piece is individually
              numbered and finished by hand.
            </p>
          </div>
        </div>

        {/* 2-Column Customizer Layout */}
        <div className="customize-grid">

          {/* Left Column: Live Visual Canvas */}
          <div className="customize-visual-col">
            <div className="visual-canvas">
              <div className="canvas-badge-row">
                <span className="canvas-badge">BESPOKE ATELIER</span>
                <span className="canvas-edition">EDITION 08/25</span>
              </div>

              <div className="canvas-image-wrap" style={{ position: 'relative' }}>
                <img
                  src={activeImage}
                  alt={`${selectedProduct.name} in ${selectedLeather.label}`}
                  className="canvas-image"
                />

                {/* Live Monogram Atelier Tag Overlay */}
                {monogramEnabled && initials.trim() && (
                  <div
                    className="canvas-monogram-tag"
                    style={{
                      position: 'absolute',
                      bottom: '24px',
                      right: '24px',
                      padding: '8px 16px',
                      backgroundColor: selectedLeather.hex,
                      color: stampingFinish === 'gold' ? '#FFD700' : 'rgba(255, 255, 255, 0.75)',
                      border: stampingFinish === 'gold' ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '3px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textShadow: stampingFinish === 'gold' ? '0 1px 2px rgba(0,0,0,0.6)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🏷 {initials.toUpperCase()}
                  </div>
                )}
              </div>


              <div className="canvas-status-bar">
                <span className="status-dot"></span>
                <span>
                  PREVIEW: {selectedLeather.label.toUpperCase()} &bull; {strapOption.toUpperCase()} STRAP
                  {monogramEnabled && initials.trim() ? ` &bull; [ ${initials.toUpperCase()} ]` : ''}
                </span>
              </div>
            </div>

            {/* Atelier Assurance Badges */}
            <div className="atelier-badges-row">
              <div className="atelier-badge-card">
                <span className="badge-icon">⏱</span>
                <span className="badge-name">MADE TO ORDER</span>
                <span className="badge-sub">Crafted in 5–7 days</span>
              </div>
              <div className="atelier-badge-card">
                <span className="badge-icon">⚜</span>
                <span className="badge-name">HOT STAMPING</span>
                <span className="badge-sub">Complimentary </span>
              </div>
              <div className="atelier-badge-card">
                <span className="badge-icon">🛡</span>
                <span className="badge-name">LIFETIME CARE</span>
                <span className="badge-sub">Repair archive</span>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Controls & Specifications */}
          <div className="customize-controls-col">

            {/* Model Info Header */}
            <div>
              <div className="model-serial-row">
                <span className="model-serial">
                  SELECT MODEL · BOKYRA BESPOKE
                </span>
                <button
                  type="button"
                  className="customize-reset-btn"
                  onClick={handleResetCustomization}
                  title="Reset customization options to defaults"
                >
                  ↺ Reset Options
                </button>
              </div>

              <label htmlFor="customize-model" className="model-select-label">
                Choose your bag
              </label>

              <select
                id="customize-model"
                className="customize-model-select"
                value={selectedProduct.id}
                onChange={(e) => {
                  const product = customizableProducts.find(
                    (item) => item.id === Number(e.target.value)
                  )

                  if (product) {
                    setSelectedProduct(product)
                  }
                }}
              >
                {customizableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>

              <h2 className="model-name">{selectedProduct.name}</h2>

              <p className="model-desc">
                {selectedProduct.description}
              </p>
            </div>

            {/* 1. Leather Tone Selector */}
            <div className="control-section">
              <div className="control-section-header">
                <span className="control-step">1. SELECT LEATHER TONE</span>
                <span className="control-active-label">{selectedLeather.label} ({selectedLeather.subtitle})</span>
              </div>

              <div className="swatch-grid">
                {leatherColors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className={`swatch-btn ${selectedLeather.id === color.id ? 'active' : ''}`}
                    onClick={() => setSelectedLeather(color)}
                  >
                    <span className="swatch-circle" style={{ backgroundColor: color.hex }}></span>
                    <span className="swatch-title">{color.label}</span>
                    <span className="swatch-subtitle">{color.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Strap Ergonomics Selector */}
            <div className="control-section">
              <div className="control-section-header">
                <span className="control-step">2. CHOOSE STRAP ERGONOMICS</span>
                <span className="control-active-label">STANDARD OR WIDE</span>
              </div>

              <div className="strap-options-grid">
                <div
                  className={`option-tile ${strapOption === 'standard' ? 'selected' : ''}`}
                  onClick={() => setStrapOption('standard')}
                >
                  <div className="tile-title-row">
                    <span className="tile-title">STANDARD STRAP</span>
                    {strapOption === 'standard' && <span className="tile-check">✓</span>}
                  </div>
                  <p className="tile-desc">Reinforced leather &bull; 35mm width silhouette.</p>
                  <span className="tile-price">INCLUDED (DEFAULT)</span>
                </div>

                <div
                  className={`option-tile ${strapOption === 'wide' ? 'selected' : ''}`}
                  onClick={() => setStrapOption('wide')}
                >
                  <div className="tile-title-row">
                    <span className="tile-title">WIDE ERGONOMIC STRAP</span>
                    {strapOption === 'wide' && <span className="tile-check">✓</span>}
                  </div>
                  <p className="tile-desc">Padded contour memory foam &bull; 50mm distributed load.</p>
                  <span className="tile-price">+ NPR 1,500</span>
                </div>
              </div>
            </div>

            {/* 3. Bespoke Add-ons */}
            <div className="control-section">
              <div className="control-section-header">
                <span className="control-step">3.ADD-ONS</span>
                <span className="control-active-label">OPTIONAL ATELIER TOUCHES</span>
              </div>

              <div className="addons-list">
                {/* Neoprene sleeve */}
                <label className={`addon-item ${laptopSleeve ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={laptopSleeve}
                    onChange={(e) => setLaptopSleeve(e.target.checked)}
                  />
                  <div className="addon-text">
                    <span className="addon-title">Suspended Laptop Sleeve</span>
                    <span className="addon-sub">Custom-fitted for up to 16" device with fleece lining.</span>
                  </div>
                  <span className="addon-price">+ NPR 1,200</span>
                </label>

                {/* Passport pocket */}
                <label className={`addon-item ${secretPocket ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={secretPocket}
                    onChange={(e) => setSecretPocket(e.target.checked)}
                  />
                  <div className="addon-text">
                    <span className="addon-title">Passport & Transit Pocket</span>
                    <span className="addon-sub">Rear luminary slot with silent magnetic tab.</span>
                  </div>
                  <span className="addon-price">+ NPR 800</span>
                </label>

                {/* Monogram Hot Stamping */}
                <div className={`monogram-box ${monogramEnabled ? 'active' : ''}`}>
                  <label className="addon-item no-border">
                    <input
                      type="checkbox"
                      checked={monogramEnabled}
                      onChange={(e) => setMonogramEnabled(e.target.checked)}
                    />
                    <div className="addon-text">
                      <span className="addon-title">Initial Stamping</span>
                      <span className="addon-sub">Precision hand-stamped on brass plate or raw bridle leather tab.</span>
                    </div>
                    <span className="addon-price">+ NPR 600</span>
                  </label>

                  {monogramEnabled && (
                    <div className="monogram-inputs-row">
                      <div className="input-block">
                        <label className="input-caption">ENTER INITIALS (MAX 4)</label>
                        <input
                          type="text"
                          maxLength={6}
                          className="monogram-input"
                          value={initials}
                          onChange={(e) => setInitials(e.target.value.toUpperCase())}
                          placeholder="B . K . R"
                        />
                      </div>

                      <div className="input-block">
                        <label className="input-caption">STAMPING FINISH</label>
                        <div className="finish-buttons">
                          <button
                            type="button"
                            className={`finish-btn ${stampingFinish === 'blind' ? 'active' : ''}`}
                            onClick={() => setStampingFinish('blind')}
                          >
                            BLIND DEBOSS
                          </button>
                          <button
                            type="button"
                            className={`finish-btn ${stampingFinish === 'gold' ? 'active' : ''}`}
                            onClick={() => setStampingFinish('gold')}
                          >
                            GOLD FOIL
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price Summary & Order Action */}
            <div className="customize-summary-card">
              <div className="summary-row">
                <span>Base Model ({selectedProduct.name})</span>
                <span>NPR {basePrice.toLocaleString()}</span>
              </div>
              {strapCost > 0 && (
                <div className="summary-row">
                  <span>Wide Ergonomic Strap</span>
                  <span>+ NPR {strapCost.toLocaleString()}</span>
                </div>
              )}
              {sleeveCost > 0 && (
                <div className="summary-row">
                  <span>Neoprene Laptop Sleeve</span>
                  <span>+ NPR {sleeveCost.toLocaleString()}</span>
                </div>
              )}
              {pocketCost > 0 && (
                <div className="summary-row">
                  <span>Concealed Transit Pocket</span>
                  <span>+ NPR {pocketCost.toLocaleString()}</span>
                </div>
              )}
              {monogramCost > 0 && (
                <div className="summary-row">
                  <span>Custom Monogram [{initials}] ({stampingFinish})</span>
                  <span>+ NPR {monogramCost.toLocaleString()}</span>
                </div>
              )}

              <div className="summary-total-row">
                <div>
                  <span className="summary-total-label">TOTAL</span>
                  <span className="summary-total-val">NPR {totalPrice.toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary order-btn"
                  onClick={handleOrder}
                >
                  {addedToCart ? '✓ ATELIER ORDER QUEUED' : 'COMMISSION THIS PIECE →'}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  )
}

export default Customize
