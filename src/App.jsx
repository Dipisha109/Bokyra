import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Footer from './components/Footer'
import Navbar from './components/Navbar'

import RequireAuth from './components/RequireAuth'
import ScrollToTop from './components/ScrollToTop'
import { ShopProvider } from './context/ShopContext'
import About from './pages/About'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Customize from './pages/Customize'
import FindMyBag from './pages/FindMyBag'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import OrderConfirmation from './pages/OrderConfirmation'
import ProductDetails from './pages/ProductDetails'
import Register from './pages/Register'
import Shop from './pages/Shop'
import Wishlist from './pages/Wishlist'



function App() {
  return (
    <BrowserRouter>
      <ShopProvider>
        {/* Skip to main content — keyboard/screen reader accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        <Navbar />
        <ScrollToTop />

        <div id="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/about" element={<About />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/shop/:id" element={<ProductDetails />} />
            <Route path="/find-my-bag" element={<FindMyBag />} />
            <Route path="/customize" element={<Customize />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        <Footer />
      </ShopProvider>
    </BrowserRouter>
  )
}

export default App