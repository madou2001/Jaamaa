import { useState, useEffect } from 'react'

interface CartItem {
  id: string
  productId: string
  productName: string
  productPrice: number
  productImage?: string
  quantity: number
  addedAt: string
}

const CART_STORAGE_KEY = 'jaayma_cart'

export const useLocalCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        setCartItems(parsedCart)
        console.log('🛒 Panier chargé:', parsedCart)
      } else {
        console.log('🛒 Panier vide ou inexistant')
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error)
    } finally {
      setInitialized(true)
    }
  }, [])

  // Écouter les changements du localStorage (pour synchroniser entre composants)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        try {
          const newCart = e.newValue ? JSON.parse(e.newValue) : []
          // Utiliser setTimeout pour éviter les mises à jour pendant le rendu
          setTimeout(() => {
            setCartItems(newCart)
            console.log('🛒 Panier synchronisé depuis storage:', newCart)
          }, 0)
        } catch (error) {
          console.error('Erreur sync storage:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Aussi écouter un événement custom pour les changements dans la même fenêtre
    const handleCartUpdate = (e: CustomEvent) => {
      // Utiliser setTimeout pour éviter les mises à jour pendant le rendu
      setTimeout(() => {
        setCartItems(e.detail)
        console.log('🛒 Panier synchronisé depuis event:', e.detail)
      }, 0)
    }

    window.addEventListener('cart-updated', handleCartUpdate as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cart-updated', handleCartUpdate as EventListener)
    }
  }, [])

  // Sauvegarder le panier dans localStorage à chaque modification
  const saveCartToStorage = (items: CartItem[]) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      // Déclencher un événement custom pour synchroniser les autres composants
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: items }))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error)
    }
  }

  const addToCart = async (product: {
    id: string
    name: string
    price: number
    image_url?: string
  }, quantity: number = 1) => {
    setLoading(true)
    
    try {
      // Simular un délai d'API
      await new Promise(resolve => setTimeout(resolve, 500))

      setCartItems(prevItems => {
        // Vérifier si le produit existe déjà
        const existingItemIndex = prevItems.findIndex(item => item.productId === product.id)
        
        let newItems: CartItem[]
        
        if (existingItemIndex >= 0) {
          // Mettre à jour la quantité
          newItems = prevItems.map((item, index) => 
            index === existingItemIndex 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        } else {
          // Ajouter un nouveau produit
          const newItem: CartItem = {
            id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId: product.id,
            productName: product.name,
            productPrice: product.price,
            productImage: product.image_url,
            quantity,
            addedAt: new Date().toISOString()
          }
          newItems = [newItem, ...prevItems]
        }
        
        saveCartToStorage(newItems)
        return newItems
      })
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateCartItem = (cartItemId: string, quantity: number) => {
    setCartItems(prevItems => {
      const newItems = quantity <= 0 
        ? prevItems.filter(item => item.id !== cartItemId)
        : prevItems.map(item => 
            item.id === cartItemId 
              ? { ...item, quantity }
              : item
          )
      
      saveCartToStorage(newItems)
      return newItems
    })
  }

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== cartItemId)
      saveCartToStorage(newItems)
      return newItems
    })
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem(CART_STORAGE_KEY)
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.productPrice * item.quantity)
    }, 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const isInCart = (productId: string) => {
    return cartItems.some(item => item.productId === productId)
  }

  const getCartItem = (productId: string) => {
    return cartItems.find(item => item.productId === productId)
  }

  return {
    cartItems,
    loading,
    initialized,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getCartItem,
  }
}
