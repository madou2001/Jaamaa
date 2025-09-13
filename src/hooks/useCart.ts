import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'
import { useAuth } from './useAuth'

type CartItem = Database['public']['Tables']['cart_items']['Row'] & {
  products: Database['public']['Tables']['products']['Row']
}

export const useCart = () => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchCartItems()
    } else {
      setCartItems([])
      setLoading(false)
    }
  }, [user])

  const fetchCartItems = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCartItems(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      throw new Error('You must be logged in to add items to cart')
    }

    try {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single()

      if (existingItem) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          // @ts-ignore
          .update({ quantity: (existingItem as any).quantity + quantity })
          .eq('id', (existingItem as any).id)
          .select(`
            *,
            products (*)
          `)
          .single()

        if (error) throw error
        setCartItems(prev => 
          prev.map(item => 
            item.id === (existingItem as any).id ? data : item
          )
        )
      } else {
        // Add new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          } as any)
          .select(`
            *,
            products (*)
          `)
          .single()

        if (error) throw error
        setCartItems(prev => [data, ...prev])
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add item to cart')
    }
  }

  const updateCartItem = async (cartItemId: string, quantity: number) => {
    if (!user) return

    try {
      if (quantity <= 0) {
        await removeFromCart(cartItemId)
        return
      }

      const { data, error } = await supabase
        .from('cart_items')
        // @ts-ignore
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('user_id', user.id)
        .select(`
          *,
          products (*)
        `)
        .single()

      if (error) throw error
      setCartItems(prev => 
        prev.map(item => 
          item.id === cartItemId ? data : item
        )
      )
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update cart item')
    }
  }

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id)

      if (error) throw error
      setCartItems(prev => prev.filter(item => item.id !== cartItemId))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to remove item from cart')
    }
  }

  const clearCart = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      setCartItems([])
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to clear cart')
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity)
    }, 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return {
    cartItems,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    fetchCartItems,
  }
}
