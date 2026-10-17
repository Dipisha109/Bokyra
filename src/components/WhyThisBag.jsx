
function WhyThisBag({ product }) {
  if (!product) return null

  const reasons = []

  if (product.purpose) {
    const purpose = product.purpose.toLowerCase()

    if (purpose === 'college') {
      reasons.push('Suitable for college days and carrying your daily essentials.')
    } else if (purpose === 'work') {
      reasons.push('Designed with work and everyday commuting in mind.')
    } else if (purpose === 'travel') {
      reasons.push('A practical option to consider for travel.')
    } else {
      reasons.push(`Designed for ${purpose}-related use.`)
    }
  }

  if (product.capacityLiters) {
    reasons.push(
      `Its ${product.capacityLiters}L capacity helps you judge how much you may be able to carry.`
    )
  }

  if (product.laptopFit) {
    reasons.push(
      `The listed laptop fit is ${product.laptopFit}, useful if you carry a laptop.`
    )
  }

  if (product.highlights?.length > 0) {
    reasons.push(product.highlights[0] + '.')
  }

  if (reasons.length === 0) {
    reasons.push(
      'Explore the product description and features to decide whether this bag suits your needs.'
    )
  }

  return (
    <section className="why-this-bag">
      <h2>Why This Bag?</h2>
      <p className="why-this-bag-intro">
        Here are a few details that may make this bag a good fit for you.
      </p>

      <ul>
        {reasons.map((reason, index) => (
          <li key={index}>{reason}</li>
        ))}
      </ul>
    </section>
  )
}

export default WhyThisBag