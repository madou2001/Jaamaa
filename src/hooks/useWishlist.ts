import { useState, useEffect } from 'react'

interface WishlistItem {
  id: string
  productId: string
  productName: string
  productPrice: number
  productImage?: string
  addedAt: string
}

const WISHLIST_STORAGE_KEY = 'jaayma_wishlist'

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)

  // Charger la wishlist depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist)
        setWishlistItems(parsedWishlist)
      }
    } catch (error) {
    }
  }, [])

  // Sauvegarder la wishlist dans localStorage à chaque modification
  const saveWishlistToStorage = (items: WishlistItem[]) => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
    }
  }

  const addToWishlist = async (product: {
    id: string
    name: string
    price: number
    image_url?: string
  }) => {
    setLoading(true)
    
    try {
      // Simular un délai d'API
      await new Promise(resolve => setTimeout(resolve, 300))

      setWishlistItems(prevItems => {
        // Vérifier si le produit existe déjà
        const existingItemIndex = prevItems.findIndex(item => item.productId === product.id)
        
        if (existingItemIndex >= 0) {
          // Le produit existe déjà, on ne fait rien
          return prevItems
        }

        // Ajouter un nouveau produit
        const newItem: WishlistItem = {
          id: `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          productImage: product.image_url,
          addedAt: new Date().toISOString()
        }
        
        const newItems = [newItem, ...prevItems]
        saveWishlistToStorage(newItems)
        return newItems
      })
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prevItems => {
      const newItems = prevItems.filter(item => item.productId !== productId)
      saveWishlistToStorage(newItems)
      return newItems
    })
  }

  const clearWishlist = () => {
    setWishlistItems([])
    localStorage.removeItem(WISHLIST_STORAGE_KEY)
  }

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.productId === productId)
  }

  const getWishlistItem = (productId: string) => {
    return wishlistItems.find(item => item.productId === productId)
  }

  const getWishlistCount = () => {
    return wishlistItems.length
  }

  const toggleWishlist = async (product: {
    id: string
    name: string
    price: number
    image_url?: string
  }) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      return false // Removed
    } else {
      await addToWishlist(product)
      return true // Added
    }
  }

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistItem,
    getWishlistCount,
    toggleWishlist,
  }
}
