import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface SearchFilters {
  query: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  inStock?: boolean
  featured?: boolean
  tags?: string[]
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular'
}

interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'query'
  value: string
  label: string
  count?: number
  image?: string
}

interface SearchResult {
  products: any[]
  suggestions: SearchSuggestion[]
  totalCount: number
  facets: {
    categories: Array<{ id: string; name: string; count: number }>
    brands: Array<{ id: string; name: string; count: number }>
    priceRanges: Array<{ min: number; max: number; count: number }>
    ratings: Array<{ rating: number; count: number }>
  }
}

export const useAdvancedSearch = () => {
  const [results, setResults] = useState<SearchResult>({
    products: [],
    suggestions: [],
    totalCount: 0,
    facets: {
      categories: [],
      brands: [],
      priceRanges: [],
      ratings: []
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  useEffect(() => {
    // Charger l'historique de recherche
    const history = localStorage.getItem('search_history')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  const generateSuggestions = async (query: string): Promise<SearchSuggestion[]> => {
    if (!query || query.length < 2) return []

    const suggestions: SearchSuggestion[] = []
    
    try {
      // Recherche de produits similaires
      const { data: products } = await supabase
        .from('products')
        .select('id, name, image_url')
        .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(3)

      if (products) {
        (products as any[]).forEach(product => {
          suggestions.push({
            type: 'product',
            value: product.id,
            label: product.name,
            image: product.image_url
          })
        })
      }

      // Recherche de catégories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(2)

      if (categories) {
        (categories as any[]).forEach(category => {
          suggestions.push({
            type: 'category',
            value: category.id,
            label: category.name
          })
        })
      }

      // Suggestions de requêtes populaires
      const popularQueries = [
        'smartphone', 'ordinateur', 'vêtements', 'chaussures', 'electroménager',
        'gaming', 'sport', 'maison', 'beauté', 'livre'
      ]

      popularQueries
        .filter(q => q.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 2)
        .forEach(q => {
          suggestions.push({
            type: 'query',
            value: q,
            label: `Rechercher "${q}"`
          })
        })

    } catch (error) {
      // console.error('Erreur lors de la génération de suggestions:', error)
    }

    return suggestions.slice(0, 8)
  }

  const search = async (filters: SearchFilters): Promise<void> => {
    setLoading(true)

    try {
      // Construire la requête de base
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
        .eq('status', 'active')

      // Appliquer les filtres
      if (filters.query) {
        // Recherche textuelle avec pondération
        const searchTerms = filters.query.toLowerCase().split(' ').filter(term => term.length > 0)
        if (searchTerms.length > 0) {
          const searchConditions = searchTerms.map(term => 
            `name.ilike.%${term}%, description.ilike.%${term}%`
          ).join(', ')
          query = query.or(searchConditions)
        }
      }

      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice)
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice)
      }

      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured)
      }

      if (filters.inStock) {
        query = query.gt('quantity', 0)
      }

      // Appliquer le tri
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price', { ascending: false })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'popular':
          query = query.order('featured', { ascending: false }).order('created_at', { ascending: false })
          break
        default:
          // Tri par pertinence (featured en premier, puis par date)
          query = query.order('featured', { ascending: false }).order('created_at', { ascending: false })
      }

      const { data: products, error } = await query.limit(50)

      if (error) throw error

      // Générer les suggestions si c'est une recherche textuelle
      const suggestions = filters.query ? await generateSuggestions(filters.query) : []

      // Calculer les facettes (simulation - en production, utiliser des requêtes dédiées)
      const facets = await calculateFacets(products || [])

      setResults({
        products: products || [],
        suggestions,
        totalCount: products?.length || 0,
        facets
      })

      // Sauvegarder dans l'historique
      if (filters.query && filters.query.trim().length > 0) {
        saveToHistory(filters.query.trim())
      }

    } catch (error) {
      // console.error('Erreur lors de la recherche:', error)
      setResults({
        products: [],
        suggestions: [],
        totalCount: 0,
        facets: {
          categories: [],
          brands: [],
          priceRanges: [],
          ratings: []
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateFacets = async (products: any[]) => {
    // Calculer les facettes à partir des résultats
    const categories = new Map()
    // const brands = new Map()
    const priceRanges = [
      { min: 0, max: 50, count: 0 },
      { min: 50, max: 100, count: 0 },
      { min: 100, max: 250, count: 0 },
      { min: 250, max: 500, count: 0 },
      { min: 500, max: Infinity, count: 0 }
    ]

    products.forEach(product => {
      // Catégories
      if (product.categories) {
        const cat = categories.get(product.categories.id) || { ...product.categories, count: 0 }
        cat.count++
        categories.set(product.categories.id, cat)
      }

      // Prix ranges
      const price = product.price
      priceRanges.forEach(range => {
        if (price >= range.min && price < range.max) {
          range.count++
        }
      })
    })

    return {
      categories: Array.from(categories.values()),
      brands: [], // À implémenter avec la vraie table brands
      priceRanges: priceRanges.filter(range => range.count > 0),
      ratings: [] // À implémenter avec les vraies notes
    }
  }

  const saveToHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('search_history', JSON.stringify(newHistory))
  }

  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('search_history')
  }

  const getPopularSearches = () => {
    return [
      'iPhone', 'MacBook', 'Nike', 'Samsung', 'Adidas',
      'Gaming', 'Sport', 'Mode', 'Tech', 'Maison'
    ]
  }

  const getRecentSearches = () => {
    return searchHistory.slice(0, 5)
  }

  return {
    results,
    loading,
    search,
    generateSuggestions,
    searchHistory,
    clearHistory,
    getPopularSearches,
    getRecentSearches
  }
}
