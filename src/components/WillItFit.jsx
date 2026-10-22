import { useState } from 'react'
import { Link } from 'react-router-dom'

function WillItFit({ product }) {
  const [laptopSize, setLaptopSize] = useState('14')

  if (!product) return null

  // Extract supported numerical sizes from product data (e.g. "14–16"" -> [14, 16])
  const supportedSizes = product.laptopFit
    ?.match(/\d+/g)
    ?.map(Number) || []

  const maxSize = supportedSizes.length
    ? Math.max(...supportedSizes)
    : null

  const hasLaptopFit = maxSize !== null && !product.laptopFit?.toLowerCase().includes('no laptop')
  const fits = hasLaptopFit && Number(laptopSize) <= maxSize

  return (
    <section className="will-it-fit">
      <div className="will-it-fit-header">
        <span className="will-it-fit-badge-tag">DEVICE COMPATIBILITY</span>
        <h3 className="will-it-fit-title">Will It Fit Your Gear?</h3>
      </div>

      {!hasLaptopFit ? (
        <div className="fit-compact-card">
          <div className="fit-compact-icon">👜</div>
          <div className="fit-compact-body">
            <h4 className="fit-compact-heading">Sculpted for Compact Daily Carry</h4>
            <p className="fit-compact-desc">
              This silhouette is purposefully engineered for everyday essentials (phone, wallet, sunglasses, keys, and passport) and is not designed to house a laptop.
            </p>
            <Link to="/shop?category=Backpack" className="fit-compact-link">
              Explore our Laptop-Friendly Backpacks & Totes →
            </Link>
          </div>
        </div>
      ) : (
        <div className="fit-interactive-body">
          <p className="fit-intro-text">
            Compare your device screen size with this silhouette’s dedicated padded sleeve (rated up to <strong>{maxSize}"</strong>).
          </p>

          <div className="fit-selector-row">
            <label htmlFor="laptop-size-select" className="fit-label">
              Select your laptop:
            </label>
            <select
              id="laptop-size-select"
              className="fit-select"
              value={laptopSize}
              onChange={(e) => setLaptopSize(e.target.value)}
            >
              <option value="13">13" (MacBook Air / Ultrabook)</option>
              <option value="14">14" (MacBook Pro / Slim Laptop)</option>
              <option value="15">15.6" (Standard Office Laptop)</option>
              <option value="16">16" (MacBook Pro 16" / Studio Laptop)</option>
              <option value="17">17" (Large Workstation / Gaming)</option>
            </select>
          </div>

          <div className={`fit-result-badge-card ${fits ? 'fit-yes' : 'fit-no'}`}>
            <span className="fit-badge-pill">
              {fits ? '✓ Fits Comfortably' : '✕ Exceeds Recommended Max'}
            </span>
            <p className="fit-status-explanation">
              {fits
                ? `Your ${laptopSize}" device fits easily inside the reinforced, shock-absorbing sleeve with space for your charger and accessories.`
                : `A ${laptopSize}" device exceeds this silhouette's maximum rated capacity of ${maxSize}". Consider The Apex Modular 22L or Veloce Transit 24L for larger hardware.`}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

export default WillItFit