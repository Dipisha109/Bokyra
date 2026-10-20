import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import products from '../data/product'

// Comprehensive quiz questions for the "Find My Bag" Fit Engine
const questions = [
  {
    id: 1,
    title: 'Primary Purpose',
    question: 'What will you primarily use this bag for?',
    options: [
      { label: 'Work / Business', icon: '💼', desc: 'Meetings, offices, and client presentations' },
      { label: 'College / University', icon: '🎓', desc: 'Lectures, libraries, and campus movement' },
      { label: 'Travel & Trips', icon: '✈️', desc: 'Weekenders, cabin luggage, and getaways' },
      { label: 'Daily Commute & Everyday', icon: '🚶', desc: 'Lightweight agility, cafes, and city transit' },
    ],
  },
  {
    id: 2,
    title: 'Capacity & Size',
    question: 'What size works best for your daily carry?',
    options: [
      { label: 'Compact (under 15L)', icon: '📐', desc: 'Keys, wallet, sunglasses, phone & small gear' },
      { label: 'Medium (15–22L)', icon: '🎒', desc: 'Laptop, charger, notebook, water bottle' },
      { label: 'Large (22L+)', icon: '🧳', desc: 'Extra clothes, gym gear, tech accessories' },
      { label: 'Flexible / Not Sure', icon: '✨', desc: 'Show me the most versatile balanced options' },
    ],
  },
  {
    id: 3,
    title: 'Device & Tech',
    question: 'Do you carry a laptop or tablet?',
    options: [
      { label: 'Large Laptop (14–16")', icon: '💻', desc: 'MacBook Pro 14/16" or standard PC laptop' },
      { label: 'Compact Device (13" or iPad)', icon: '📱', desc: 'MacBook Air, iPad Pro, or e-reader' },
      { label: 'No Laptop Needed', icon: '🚫', desc: 'Only notebooks, documents, or personal items' },
      { label: 'Only Sometimes', icon: '🔄', desc: 'Occasionally slip in an iPad or slim device' },
    ],
  },
  {
    id: 4,
    title: 'Carrying Style',
    question: 'Which silhouette feels most comfortable to you?',
    options: [
      { label: 'Backpack', icon: '🎒', desc: 'Even weight distribution on both shoulders' },
      { label: 'Structured Tote', icon: '👜', desc: 'Effortless grab-and-go vertical profile' },
      { label: 'Sling / Crossbody', icon: '🎽', desc: 'Hands-free freedom across the chest or back' },
      { label: 'Briefcase or Duffel', icon: '💼', desc: 'Executive hand-carry or travel weekender' },
    ],
  },
]

function FindMyBag() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  function handleSelect(optionLabel) {
    setAnswers({ ...answers, [step]: optionLabel })
  }

  function handleNext() {
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      setShowResults(true)
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1)
  }

  function handleRestart() {
    setStep(0)
    setAnswers({})
    setShowResults(false)
  }

  // Intelligent matching engine based on user quiz answers
  const scoredRecommendations = useMemo(() => {
    if (!showResults) return []

    const q1 = answers[0] // Purpose
    const q2 = answers[1] // Size
    const q3 = answers[2] // Laptop
    const q4 = answers[3] // Style

    return products
      .map((product) => {
        let score = 0
        const reasons = []

        // 1. Evaluate Purpose Match
        if (q1 === 'Work / Business') {
          if (product.purpose === 'work') {
            score += 35
            reasons.push('Engineered for professional & executive settings')
          } else if (product.purpose === 'college') {
            score += 15
          }
        } else if (q1 === 'College / University') {
          if (product.purpose === 'college') {
            score += 35
            reasons.push('Optimized for books, campus transit & lectures')
          } else if (product.purpose === 'everyday') {
            score += 20
          }
        } else if (q1 === 'Travel & Trips') {
          if (product.purpose === 'travel') {
            score += 35
            reasons.push('Designed for cabin luggage & long-distance transit')
          } else if (product.capacityLiters >= 22) {
            score += 20
          }
        } else if (q1 === 'Daily Commute & Everyday') {
          if (product.purpose === 'everyday') {
            score += 35
            reasons.push('Lightweight agility for city movement')
          } else if (product.purpose === 'college' || product.purpose === 'work') {
            score += 20
          }
        }

        // 2. Evaluate Size Match
        if (q2 === 'Compact (under 15L)') {
          if (product.capacityLiters <= 15) {
            score += 25
            reasons.push(`Compact ${product.capacityLiters}L footprint`)
          }
        } else if (q2 === 'Medium (15–22L)') {
          if (product.capacityLiters > 15 && product.capacityLiters <= 22) {
            score += 25
            reasons.push(`Balanced ${product.capacityLiters}L everyday volume`)
          }
        } else if (q2 === 'Large (22L+)') {
          if (product.capacityLiters > 22) {
            score += 25
            reasons.push(`Generous ${product.capacityLiters}L high-capacity storage`)
          }
        } else {
          // Flexible
          score += 20
          reasons.push(`Versatile ${product.capacityLiters}L capacity`)
        }

                // 3. Evaluate Laptop Match
        if (q3 === 'Large Laptop (14–16")') {
          if (product.laptopFit === '14–16"') {
            score += 35
            reasons.push('Dedicated compartment fits up to 16" laptops')
          } else if (product.laptopFit === '13" or smaller') {
            score += 5
          } else {
            // Disqualify bags with no laptop support when user explicitly requires a laptop
            score -= 60
          }
        } else if (q3 === 'Compact Device (13" or iPad)') {
          if (product.laptopFit === '14–16"' || product.laptopFit === '13" or smaller') {
            score += 30
            reasons.push('Safely accommodates 13" devices and tablets')
          } else {
            score -= 40
          }
        } else if (q3 === 'No Laptop Needed') {
          if (product.laptopFit === 'No laptop') {
            score += 35
            reasons.push('Lightweight profile without bulky laptop dividers')
          } else {
            score += 15
          }
        } else {
          // Flexible
          score += 20
        }

        // 4. Evaluate Silhouette Match
        if (q4 === 'Backpack' && product.silhouette === 'Backpack') {
          score += 30
          reasons.push('Ergonomic dual-shoulder backpack straps')
        } else if (q4 === 'Structured Tote' && product.silhouette === 'Tote') {
          score += 30
          reasons.push('Clean vertical tote architecture')
        } else if (q4 === 'Sling / Crossbody' && (product.silhouette === 'Sling / Crossbody' || product.silhouette === 'Sling')) {
          score += 30
          reasons.push('Agile hands-free crossbody sling profile')
        } else if (q4 === 'Briefcase or Duffel' && (product.silhouette === 'Briefcase' || product.silhouette === 'Duffel')) {
          score += 30
          reasons.push('Executive hand-carry & luggage silhouette')
        }

        // Honest percentage calculation based on actual positive criteria
        const percentage = Math.min(99, Math.max(25, Math.round((Math.max(0, score) / 125) * 100)))

        return {
          ...product,
          matchScore: percentage,
          matchReasons: reasons.slice(0, 3)
        }
      })
      .filter((product) => product.matchReasons.length > 0) // Only recommend bags that genuinely match criteria!
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [answers, showResults])

  // Results View
  if (showResults) {
    const topMatches = scoredRecommendations.slice(0, 3)
    const runnerUps = scoredRecommendations.slice(3, 6)

    return (
      <main className="findmybag-page">
        <div className="container" style={{ padding: '60px 32px 100px' }}>

          <div className="fmb-header">
            <p className="eyebrow">&bull; BOKYRA FIT ENGINE RESULTS &bull;</p>
            <h1 className="section-title">Your Tailored Matches</h1>
            <p className="section-subtitle">
              Based on your routine ({answers[0] || 'Everyday'}), device size ({answers[2] || 'Standard'}), and preferred carry ({answers[3] || 'All'}), here are your top atelier silhouettes.
            </p>
          </div>

          {/* Top Matches Showcase or Empty Fallback */}
          {topMatches.length > 0 ? (
            <div className="fmb-results-grid">
              {topMatches.map((product, idx) => (
                <div className="fmb-result-card" key={product.id}>
                  {/* Match Badge */}
                  <div className="fmb-badge-row">
                    <span className={`fmb-match-pill ${idx === 0 ? 'top-match' : ''}`}>
                      {idx === 0 ? '★ BEST MATCH' : `RUNNER UP #${idx + 1}`} &bull; {product.matchScore}% FIT
                    </span>
                    <span className="fmb-liters-pill">{product.displayCategory}</span>
                  </div>

                  <div className="fmb-card-media">
                    <Link to={`/shop/${product.id}`}>
                      <img src={product.image} alt={product.name} className="fmb-product-img" />
                    </Link>
                  </div>

                  <div className="fmb-card-body">
                    <h3 className="fmb-product-title">
                      <Link to={`/shop/${product.id}`}>{product.name}</Link>
                    </h3>

                    <p className="fmb-product-desc">{product.description}</p>

                    {/* Why it matches list */}
                    <div className="fmb-reasons">
                      <span className="fmb-reasons-label">Why it fits you:</span>
                      <ul>
                        {product.matchReasons.map((reason, rIdx) => (
                          <li key={rIdx}>✓ {reason}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="fmb-footer">
                      <span className="fmb-price">NPR {product.price.toLocaleString()}</span>
                      <div className="fmb-actions-row">
                        <Link to={`/shop/${product.id}`} className="btn btn-primary fmb-view-btn">
                          View Details &rarr;
                        </Link>
                        {product.customizable && product.stockStatus === 'In Stock' && (
                          <Link 
                            to={`/customize?productId=${product.id}`} 
                            className="btn btn-secondary fmb-custom-btn" 
                            title="Personalize this style"
                          >
                            Make It Yours
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="shop-empty-state" style={{ margin: '40px auto', textAlign: 'center', maxWidth: '500px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🎒</div>
              <h3>No Exact Matches Found</h3>
              <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
                We couldn't find a silhouette matching that exact combination. Try adjusting your answers or explore our full atelier catalog.
              </p>
              <button type="button" className="btn btn-primary" onClick={handleRestart}>
                Retake Quiz ↺
              </button>
            </div>
          )}

          {/* Other Alternative Silhouettes */}
          {runnerUps.length > 0 && (
            <div className="fmb-alternatives-section">
              <h3 className="fmb-alt-title">Alternative Silhouettes You Might Like</h3>
              <div className="products-grid" style={{ marginTop: '24px' }}>
                {runnerUps.map((product) => (
                  <div className="product-card" key={product.id}>
                    <div className="product-image-wrap">
                      <Link to={`/shop/${product.id}`}>
                        <img src={product.image} alt={product.name} className="product-image" />
                      </Link>
                      <span className="fmb-alt-badge">{product.matchScore}% Match</span>
                    </div>
                    <div className="product-info">
                      <span className="product-category">{product.displayCategory || product.category}</span>
                      <Link to={`/shop/${product.id}`}>
                        <h3 className="product-name">{product.name}</h3>
                      </Link>
                      <div className="product-footer">
                        <span className="product-price">NPR {product.price.toLocaleString()}</span>
                        <Link to={`/shop/${product.id}`} className="product-link">
                          VIEW DETAILS &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="fmb-bottom-nav">
            <button type="button" className="btn btn-secondary" onClick={handleRestart}>
              ↺ Retake Fit Quiz
            </button>
            <Link to="/shop" className="btn btn-outline" style={{ marginLeft: '16px' }}>
              Explore Full Catalog ({products.length} Bags)
            </Link>
          </div>

        </div>
      </main>
    )
  }

  // Quiz Stepper View
  const currentQ = questions[step]
  const progressPercent = ((step + 1) / questions.length) * 100

  return (
    <main className="findmybag-page">
      <div className="container" style={{ padding: '60px 32px 100px' }}>

        <div className="fmb-header">
          <p className="eyebrow">&bull; BOKYRA FIT ENGINE &bull; 4 STEPS</p>
          <h1 className="section-title">Find My Bag</h1>
          <p className="section-subtitle">
            Answer 4 simple questions about your daily routine and devices. Our atelier matching engine will calculate the exact silhouette made for you.
          </p>
        </div>

        <div className="fmb-question-card">
          {/* Progress bar */}
          <div className="fmb-progress">
            <div
              className="fmb-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="fmb-step-meta">
            <span className="fmb-step-label">Question {step + 1} of {questions.length}</span>
            <span className="fmb-step-category">{currentQ.title}</span>
          </div>

          <h2 className="fmb-question">{currentQ.question}</h2>

          {/* Interactive Option Cards */}
          <div className="fmb-options-grid">
            {currentQ.options.map((opt) => {
              const isSelected = answers[step] === opt.label
              return (
                <button
                  key={opt.label}
                  type="button"
                  className={`fmb-option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.label)}
                >
                  <div className="fmb-option-icon">{opt.icon}</div>
                  <div className="fmb-option-text">
                    <strong className="fmb-option-name">{opt.label}</strong>
                    <span className="fmb-option-desc">{opt.desc}</span>
                  </div>
                  <div className="fmb-radio-circle">
                    {isSelected && <span className="fmb-radio-dot" />}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="fmb-nav">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleBack}
              disabled={step === 0}
              style={{ opacity: step === 0 ? 0.4 : 1, cursor: step === 0 ? 'not-allowed' : 'pointer' }}
            >
              &larr; Back
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!answers[step]}
              style={{ opacity: !answers[step] ? 0.4 : 1, cursor: !answers[step] ? 'not-allowed' : 'pointer' }}
            >
              {step === questions.length - 1 ? 'Calculate My Matches ✨' : 'Continue '}
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}

export default FindMyBag