import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { productsCache, generateCacheKey } from '../utils/cache'
import { debounce, requestBatcher, measurePerformance } from '../utils/performance'

interface ProductFilters {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  sortBy?: 'name' | 'price' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  status?: 'active' | 'draft' | 'archived'
  page?: number
  limit?: number
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_price: number | null
  image_url: string | null
  featured: boolean
  status: string
  created_at: string
  updated_at: string
  category_id: string | null
  categories?: {
    id: string
    name: string
    slug: string
  }
}

interface ProductsResponse {
  products: Product[]
  total: number
  hasMore: boolean
  page: number
}

export const useOptimizedProducts = (filters: ProductFilters = {}) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(filters.page || 1)

  // Paramètres par défaut
  const limit = filters.limit || 12
  const currentFilters = { ...filters, page, limit }

  // Fonction de fetch optimisée avec cache
  const fetchProducts = useCallback(async (forceRefresh = false): Promise<ProductsResponse> => {
    const perf = measurePerformance('fetchProducts')
    
    try {
      const cacheKey = generateCacheKey('products', currentFilters)
      
      // Vérifier le cache sauf si on force le refresh
      if (!forceRefresh) {
        const cached = productsCache.get<ProductsResponse>(cacheKey)
        if (cached) {
          perf.end()
          return cached
        }
      }

      // Construire la requête avec batch pour éviter les doublons
      const fetchFn = async () => {
        let query = supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            description,
            short_description,
            price,
            compare_price,
            image_url,
            featured,
            status,
            created_at,
            updated_at,
            category_id,
            categories (
              id,
              name,
              slug
            )
          `, { count: 'exact' })

        // Appliquer les filtres
        if (currentFilters.category) {
          query = query.eq('category_id', currentFilters.category)
        }

        if (currentFilters.search && currentFilters.search.trim()) {
          const searchTerm = currentFilters.search.trim()
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`)
        }

        if (currentFilters.minPrice !== undefined) {
          query = query.gte('price', currentFilters.minPrice)
        }

        if (currentFilters.maxPrice !== undefined) {
          query = query.lte('price', currentFilters.maxPrice)
        }

        if (currentFilters.featured !== undefined) {
          query = query.eq('featured', currentFilters.featured)
        }

        // Toujours filtrer par statut actif par défaut
        query = query.eq('status', currentFilters.status || 'active')

        // Tri optimisé
        const sortField = currentFilters.sortBy === 'created_at' ? 'created_at' : (currentFilters.sortBy || 'name')
        query = query.order(sortField, { ascending: currentFilters.sortOrder === 'asc' })

        // Pagination
        const offset = (page - 1) * limit
        query = query.range(offset, offset + limit - 1)

        return await query
      }

      // Utiliser le batcher pour éviter les requêtes multiples
      const { data, error: queryError, count } = await requestBatcher.batch(
        cacheKey,
        fetchFn,
        100 // délai de 100ms pour batching
      )

      if (queryError) throw queryError

      const result: ProductsResponse = {
        products: data || [],
        total: count || 0,
        hasMore: (count || 0) > page * limit,
        page
      }

      // Mettre en cache avec expiration plus courte pour les résultats de recherche
      const cacheExpiry = currentFilters.search ? 2 * 60 * 1000 : 10 * 60 * 1000 // 2min pour recherche, 10min pour navigation
      productsCache.set(cacheKey, result, cacheExpiry)

      perf.end()
      return result

    } catch (err) {
      perf.end()
      throw err
    }
  }, [currentFilters, page, limit])

  // Fonction de recherche avec debounce
  const debouncedSearch = useCallback(
    debounce(async (searchFilters: ProductFilters) => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await fetchProducts(true) // Force refresh pour les nouvelles recherches
        setProducts(result.products)
        setTotal(result.total)
        setHasMore(result.hasMore)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }, 300),
    [fetchProducts]
  )

  // Charger plus de produits (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return

    try {
      setLoading(true)
      const nextPage = page + 1
      const newFilters = { ...currentFilters, page: nextPage }
      
      const cacheKey = generateCacheKey('products', newFilters)
      const cached = productsCache.get<ProductsResponse>(cacheKey)
      
      let result: ProductsResponse
      if (cached) {
        result = cached
      } else {
        setPage(nextPage)
        result = await fetchProducts()
      }

      // Ajouter les nouveaux produits à la liste existante
      setProducts(prev => [...prev, ...result.products])
      setHasMore(result.hasMore)
      setPage(nextPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [hasMore, loading, page, currentFilters, fetchProducts])

  // Refresh des données
  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setPage(1)
      
      const result = await fetchProducts(true)
      setProducts(result.products)
      setTotal(result.total)
      setHasMore(result.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [fetchProducts])

  // Effet principal pour charger les données
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await fetchProducts()
        
        if (isMounted) {
          setProducts(result.products)
          setTotal(result.total)
          setHasMore(result.hasMore)
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
  }, [fetchProducts])

  // Préchargement intelligent
  const preloadNextPage = useCallback(() => {
    if (hasMore && !loading) {
      const nextFilters = { ...currentFilters, page: page + 1 }
      const cacheKey = generateCacheKey('products', nextFilters)
      
      if (!productsCache.has(cacheKey)) {
        // Précharger la page suivante en arrière-plan
        setTimeout(async () => {
          try {
            const tempPage = page + 1
            const query = supabase
              .from('products')
              .select(`
                id,
                name,
                slug,
                description,
                short_description,
                price,
                compare_price,
                image_url,
                featured,
                status,
                created_at,
                updated_at,
                category_id,
                categories (
                  id,
                  name,
                  slug
                )
              `)
              .eq('status', 'active')
              .range((tempPage - 1) * limit, tempPage * limit - 1)

            const { data } = await query
            if (data) {
              const result: ProductsResponse = {
                products: data,
                total,
                hasMore: true,
                page: tempPage
              }
              productsCache.set(cacheKey, result)
            }
          } catch (error) {
            // Erreur de préchargement ignorée
          }
        }, 1000)
      }
    }
  }, [hasMore, loading, currentFilters, page, limit, total])

  return {
    products,
    loading,
    error,
    total,
    hasMore,
    page,
    loadMore,
    refresh,
    search: debouncedSearch,
    preloadNextPage
  }
}
