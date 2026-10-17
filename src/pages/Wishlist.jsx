// import { Link } from 'react-router-dom'

// function Wishlist() {
//   // For now: empty state — we'll connect real wishlist state later
//   return (
//     <main className="wishlist-page">
//       <div className="container">
//         <div className="page-header">
//           <h1 className="section-title">Your Wishlist</h1>
//           <p className="page-count">0 items saved</p>
//         </div>

//         <div className="empty-state">
//           <h2>Nothing saved yet</h2>
//           <p>
//             Tap the ♡ on any product to save it here for later.
//           </p>
//           <Link to="/shop" className="btn btn-primary">
//             Explore the Collection
//           </Link>
//         </div>
//       </div>
//     </main>
//   )
// }

// export default Wishlist



import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useShop } from '../context/ShopContext'
import products from '../data/product'

function Wishlist() {
  const { wishlist } = useShop()

  const savedProducts = products.filter((product) =>
    wishlist.includes(product.id)
  )

  return (
    <main className="wishlist-page">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">Your Wishlist</h1>
          <p className="page-count">
            {savedProducts.length}{' '}
            {savedProducts.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {savedProducts.length === 0 ? (
          <div className="empty-state">
            <h2>Nothing saved yet</h2>
            <p>
              Tap the ♡ on any product to save it here for later.
            </p>
            <Link to="/shop" className="btn btn-primary">
              Explore the Collection
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {savedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                category={product.category}
                price={product.price}
                image={product.image}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Wishlist