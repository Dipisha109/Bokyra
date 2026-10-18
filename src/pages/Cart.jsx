// import { Link } from 'react-router-dom'

// function Cart() {
//   // For now: empty state — we'll connect real cart state later
//   return (
//     <main className="cart-page">
//       <div className="container">
//         <div className="page-header">
//           <h1 className="section-title">Your Bag</h1>
//           <p className="page-count">0 items in bag</p>
//         </div>

//         <div className="empty-state">
//           <h2>Your bag is empty</h2>
//           <p>
//             Browse our collection and add pieces that speak to you.
//           </p>
//           <Link to="/shop" className="btn btn-primary">
//             Start Shopping
//           </Link>
//         </div>
//       </div>
//     </main>
//   )
// }

// export default Cart



import { Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'

function Cart() {
  const { cart, removeFromCart, updateQuantity } = useShop()

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  )

  return (
    <main className="cart-page">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">Your Bag</h1>
          <p className="page-count">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in bag
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <h2>Your bag is empty</h2>
            <p>
              Browse our collection and add pieces that speak to you.
            </p>
            <Link to="/shop" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map((item) => {
                const product = item.product

                return (
                  <div className="cart-item" key={item.cartItemId ?? product.id}>
                    <Link to={`/shop/${product.id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="cart-item-image"
                      />
                    </Link>

                    <div className="cart-item-info">
                      <span className="product-category">
                        {product.category}
                      </span>

                      <Link to={`/shop/${product.id}`}>
                        <h3>{product.name}</h3>
                      </Link>

                      <p>
                        NPR {product.price.toLocaleString()}
                      </p>


                      {item.customization && (
                        <div className="cart-customization-details">
                          <p>
                            <strong>Customized</strong>
                          </p>

                          <p>Leather: {item.customization.leather}</p>

                          <p>
                            Strap: {item.customization.strap === 'wide'
                              ? 'Wide (+NPR 1,500)'
                              : 'Standard'}
                          </p>

                          <p>
                            Laptop sleeve: {item.customization.laptopSleeve
                              ? 'Yes (+NPR 1,200)'
                              : 'No'}
                          </p>

                          <p>
                            Secret pocket: {item.customization.secretPocket
                              ? 'Yes (+NPR 800)'
                              : 'No'}
                          </p>

                          <p>
                            Monogram: {item.customization.monogramEnabled
                              ? `${item.customization.initials} (+NPR 600)`
                              : 'No'}
                          </p>

                          {item.customization.monogramEnabled && (
                            <p>
                              Stamping finish: {item.customization.stampingFinish}
                            </p>
                          )}
                        </div>
                      )}


                      <div className="cart-item-actions">
                        <div className="pd-quantity">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() =>
                              updateQuantity(
                                item.cartItemId ?? product.id,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <span className="qty-value">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() =>
                              updateQuantity(
                                item.cartItemId ?? product.id,
                                item.quantity + 1
                              )
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(item.cartItemId ?? product.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <strong className="cart-item-total">
                      NPR {(product.price * item.quantity).toLocaleString()}
                    </strong>
                  </div>
                )
              })}
            </div>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>NPR {subtotal.toLocaleString()}</span>
              </div>

              <div className="cart-summary-total">
                <span>Total</span>
                <strong>NPR {subtotal.toLocaleString()}</strong>
              </div>

              <p className="cart-summary-note">
                Delivery charges, if applicable, will be confirmed at checkout.
              </p>

              <Link
                to="/checkout"
                className="btn btn-primary cart-checkout-btn"
              >
                Proceed to Checkout
              </Link>


              <Link to="/shop" className="cart-continue-link">
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}

export default Cart