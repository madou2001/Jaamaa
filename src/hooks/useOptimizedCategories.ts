import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { categoriesCache, generateCacheKey } from '../utils/cache'
import { measurePerformance } from '../utils/performance'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

interface CategoriesResponse {
  categories: Category[]
  total: number
}

export const useOptimizedCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchCategories = useCallback(async (forceRefresh = false): Promise<CategoriesResponse> => {
    const perf = measurePerformance('fetchCategories')
    
    try {
      const cacheKey = generateCacheKey('categories', { all: true })
      
      // Vérifier le cache
      if (!forceRefresh) {
        const cached = categoriesCache.get<CategoriesResponse>(cacheKey)
        if (cached) {
          perf.end()
          return cached
        }
      }

      // Charger depuis l'API
      const { data, error: queryError, count } = await supabase
        .from('categories')
        .select('*', { count: 'exact' })
        .order('name')

      if (queryError) throw queryError

      const result: CategoriesResponse = {
        categories: data || [],
        total: count || 0
      }

      // Mettre en cache pour 30 minutes (les catégories changent rarement)
      categoriesCache.set(cacheKey, result, 30 * 60 * 1000)

      perf.end()
      return result

    } catch (err) {
      perf.end()
      throw err
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await fetchCategories(true)
      setCategories(result.categories)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [fetchCategories])

  // Obtenir une catégorie spécifique
  const getCategory = useCallback((id: string): Category | undefined => {
    return categories.find(cat => cat.id === id)
  }, [categories])

  // Obtenir les catégories populaires (simulé - pourrait être basé sur le nombre de produits)
  const getPopularCategories = useCallback((limit = 6): Category[] => {
    return categories.slice(0, limit)
  }, [categories])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await fetchCategories()
        
        if (isMounted) {
          setCategories(result.categories)
          setTotal(result.total)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erreur de chargement')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    total,
    refresh,
    getCategory,
    getPopularCategories
  }
}
