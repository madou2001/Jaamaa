import React from 'react'

// Système de cache intelligent pour optimiser les performances
interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

interface CacheOptions {
  expiry?: number // en millisecondes, défaut: 5 minutes
  maxSize?: number // nombre maximum d'éléments en cache
}

class Cache {
  private storage = new Map<string, CacheItem<any>>()
  private defaultExpiry = 5 * 60 * 1000 // 5 minutes
  private maxSize = 100

  constructor(options: CacheOptions = {}) {
    this.defaultExpiry = options.expiry || this.defaultExpiry
    this.maxSize = options.maxSize || this.maxSize
  }

  set<T>(key: string, data: T, expiry?: number): void {
    // Nettoyer le cache si trop plein
    if (this.storage.size >= this.maxSize) {
      this.cleanup()
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: expiry || this.defaultExpiry
    }

    this.storage.set(key, item)
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key)
    
    if (!item) {
      return null
    }

    // Vérifier si l'élément a expiré
    if (Date.now() - item.timestamp > item.expiry) {
      this.storage.delete(key)
      return null
    }

    return item.data as T
  }

  has(key: string): boolean {
    const item = this.storage.get(key)
    if (!item) return false

    // Vérifier l'expiration
    if (Date.now() - item.timestamp > item.expiry) {
      this.storage.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }

  // Nettoyer les éléments expirés
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.storage.entries()) {
      if (now - item.timestamp > item.expiry) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.storage.delete(key))

    // Si toujours trop plein, supprimer les plus anciens
    if (this.storage.size >= this.maxSize) {
      const entries = Array.from(this.storage.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toRemove = Math.ceil(this.maxSize * 0.2) // Supprimer 20% des plus anciens
      for (let i = 0; i < toRemove; i++) {
        this.storage.delete(entries[i][0])
      }
    }
  }

  // Obtenir des statistiques du cache
  getStats() {
    return {
      size: this.storage.size,
      maxSize: this.maxSize,
      usage: (this.storage.size / this.maxSize) * 100
    }
  }
}

// Instances de cache spécialisées
export const productsCache = new Cache({ expiry: 10 * 60 * 1000, maxSize: 200 }) // 10 minutes pour les produits
export const categoriesCache = new Cache({ expiry: 30 * 60 * 1000, maxSize: 50 }) // 30 minutes pour les catégories
export const searchCache = new Cache({ expiry: 5 * 60 * 1000, maxSize: 100 }) // 5 minutes pour les recherches

// Utilitaires de cache
export const generateCacheKey = (prefix: string, params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key]
      return result
    }, {} as Record<string, any>)

  return `${prefix}_${JSON.stringify(sortedParams)}`
}

// Hook pour utiliser le cache avec React
export const useCachedData = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  cache: Cache,
  dependencies: any[] = []
) => {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadData = async () => {
      // Vérifier le cache d'abord
      const cached = cache.get<T>(key)
      if (cached) {
        setData(cached)
        return
      }

      // Si pas en cache, charger depuis l'API
      try {
        setLoading(true)
        setError(null)
        const result = await fetchFn()
        cache.set(key, result)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [key, ...dependencies])

  return { data, loading, error }
}

export default Cache

