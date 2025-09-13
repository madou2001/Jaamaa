import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Category {
  id: string
  name: string
  description?: string
  slug: string
  image_url?: string
  created_at: string
  updated_at: string
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (fetchError) throw fetchError

      setCategories(data || [])
    } catch (err) {
      // console.error('Erreur lors du chargement des catégories:', err)
      setError('Impossible de charger les catégories')
      
      // Fournir des catégories par défaut en cas d'erreur
      setCategories([
        { id: 'default-1', name: 'Électronique', slug: 'electronique', description: 'Appareils électroniques', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'default-2', name: 'Mode', slug: 'mode', description: 'Vêtements et accessoires', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'default-3', name: 'Maison', slug: 'maison', description: 'Articles pour la maison', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'default-4', name: 'Sport', slug: 'sport', description: 'Équipements sportifs', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ])
    } finally {
      setLoading(false)
    }
  }

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  }
}
