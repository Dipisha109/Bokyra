
import { createContext, useContext, useEffect, useState } from 'react'

const ShopContext = createContext()

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() =>
    readStorage('bokyra_cart', [])
  )

  const [wishlist, setWishlist] = useState(() =>
    readStorage('bokyra_wishlist', [])
  )

  useEffect(() => {
    localStorage.setItem('bokyra_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('bokyra_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  
  function addToCart(product, quantity = 1) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) =>
          item.product.id === product.id &&
          !item.customization
      )

      if (existingItem) {
        return currentCart.map((item) =>
          item.product.id === product.id && !item.customization
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [
        ...currentCart,
        {
          cartItemId: `regular-${product.id}-${Date.now()}`,
          product,
          quantity,
        },
      ]
    })
  }



  function addCustomizedToCart(product, customization, totalPrice) {
    const customizedProduct = {
      ...product,
      price: totalPrice,
    }

    setCart((currentCart) => [
      ...currentCart,
      {
        cartItemId: `custom-${Date.now()}`,
        product: customizedProduct,
        customization,
        quantity: 1,
      },
    ])
  }


  function removeFromCart(cartItemId) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => (item.cartItemId ?? item.product.id) !== cartItemId
      )
    )
  }

  function updateQuantity(cartItemId, quantity) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        (item.cartItemId ?? item.product.id) === cartItemId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    )
  }


  function toggleWishlist(productId) {
    setWishlist((currentWishlist) =>
      currentWishlist.includes(productId)
        ? currentWishlist.filter((id) => id !== productId)
        : [...currentWishlist, productId]
    )
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const value = {
    cart,
    wishlist,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleWishlist,
    addCustomizedToCart,
  }

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) {
    throw new Error('useShop must be used inside <ShopProvider>')
  }
  return context
}