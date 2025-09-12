import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Brand = Database['public']['Tables']['brands']['Row']
type BrandInsert = Database['public']['Tables']['brands']['Insert']
type BrandUpdate = Database['public']['Tables']['brands']['Update']

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name')

      if (error) throw error
      setBrands(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getFeaturedBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_featured', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to fetch featured brands')
    }
  }

  const getBrand = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to fetch brand')
    }
  }

  const getBrandBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to fetch brand')
    }
  }

  const createBrand = async (brand: BrandInsert) => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert(brand)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create brand')
    }
  }

  const updateBrand = async (id: string, updates: BrandUpdate) => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update brand')
    }
  }

  const deleteBrand = async (id: string) => {
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete brand')
    }
  }

  return {
    brands,
    loading,
    error,
    fetchBrands,
    getFeaturedBrands,
    getBrand,
    getBrandBySlug,
    createBrand,
    updateBrand,
    deleteBrand,
  }
}
