import Hero from '../components/Hero'
import ShopByPurpose from '../components/ShopByPurpose'
import FeaturedSilhouettes from '../components/FeaturedSilhouettes'
import AdvisoryBanner from '../components/AdvisoryBanner'
import MakeItYours from '../components/MakeItYours'

function Home() {
  return (
    <main className="home-page">
      <Hero />
      <ShopByPurpose />
      <FeaturedSilhouettes />
      <AdvisoryBanner />
      <MakeItYours />
    </main>
  )
}

export default Home