
import { useState } from 'react'

function WillItFit({ product }) {
  const [laptopSize, setLaptopSize] = useState('14')

  if (!product) return null

  const supportedSizes = product.laptopFit
    ?.match(/\d+/g)
    ?.map(Number) || []

  const maxSize = supportedSizes.length
    ? Math.max(...supportedSizes)
    : null

  const hasLaptopFit = maxSize !== null

  const fits = hasLaptopFit &&
    Number(laptopSize) <= maxSize

  return (
    <section className="will-it-fit">
      <h2>Will It Fit?</h2>

      {!hasLaptopFit ? (
        <p className="fit-result">
          Laptop fit information is not available for this bag.
        </p>
      ) : (
        <>
          <p>
            Check whether your laptop size is within this bag's
            listed maximum laptop size.
          </p>

          <label htmlFor="laptop-size">Your laptop size</label>

          <select
            id="laptop-size"
            value={laptopSize}
            onChange={(e) => setLaptopSize(e.target.value)}
          >
            <option value="13">13-inch</option>
            <option value="14">14-inch</option>
            <option value="15">15-inch</option>
            <option value="16">16-inch</option>
            <option value="17">17-inch</option>
          </select>

          <p className="fit-product-size">
            Listed laptop fit: Up to {maxSize} inches
          </p>

          <p className={`fit-result ${fits ? 'fit-yes' : 'fit-no'}`}>
            {fits
              ? 'This laptop size is within the listed maximum.'
              : 'This laptop size exceeds the listed maximum.'}
          </p>
        </>
      )}
    </section>
  )
}

export default WillItFit