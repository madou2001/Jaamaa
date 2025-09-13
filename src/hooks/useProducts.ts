import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

// Type flexible qui fonctionne avec l'ancienne et nouvelle structure
type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row']
}
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export interface ProductFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  featured?: boolean
  status?: 'active' | 'draft' | 'archived' | 'out_of_stock'
}

export const useProducts = (filters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)

      // Apply filters
      if (filters?.category) {
        query = query.eq('category_id', filters.category)
      }

      // Filtre de marque temporairement désactivé (sera réactivé avec la nouvelle DB)
      // if (filters?.brand) {
      //   query = query.eq('brand_id', filters.brand)
      // }

      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice)
      }

      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      } else {
        // By default, only show active products
        query = query.eq('status', 'active')
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getProduct = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to fetch product')
    }
  }

  const getProductBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to fetch product')
    }
  }

  const createProduct = async (product: ProductInsert) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create product')
    }
  }

  const updateProduct = async (id: string, updates: ProductUpdate) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update product')
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete product')
    }
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProduct,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
  }
}
