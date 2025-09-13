import React from 'react'

// Utilitaires d'optimisation des performances

// Debounce pour limiter les appels d'API
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Throttle pour limiter la fréquence d'exécution
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Batch des requêtes pour éviter les appels multiples
class RequestBatcher {
  private batches = new Map<string, {
    requests: Array<{
      resolve: (value: any) => void
      reject: (error: any) => void
    }>
    timer: NodeJS.Timeout
  }>()

  batch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    delay: number = 50
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(key)) {
        this.batches.set(key, {
          requests: [],
          timer: setTimeout(async () => {
            const batch = this.batches.get(key)
            if (batch) {
              try {
                const result = await fetchFn()
                batch.requests.forEach(req => req.resolve(result))
              } catch (error) {
                batch.requests.forEach(req => req.reject(error))
              }
              this.batches.delete(key)
            }
          }, delay)
        })
      }

      const batch = this.batches.get(key)!
      batch.requests.push({ resolve, reject })
    })
  }
}

export const requestBatcher = new RequestBatcher()

// Préchargement intelligent des données
export const preloadData = async (
  preloadFn: () => Promise<any>,
  condition: () => boolean = () => true
) => {
  if (!condition()) return

  // Utiliser requestIdleCallback si disponible
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      preloadFn().catch(() => {})
    })
  } else {
    // Fallback avec setTimeout
    setTimeout(() => {
      preloadFn().catch(() => {})
    }, 100)
  }
}

// Intersection Observer pour le lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }

  return new IntersectionObserver(callback, defaultOptions)
}

// Gestionnaire de mémoire pour éviter les fuites
export class MemoryManager {
  private static instance: MemoryManager
  private subscriptions = new Set<() => void>()

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager()
    }
    return MemoryManager.instance
  }

  addCleanup(cleanup: () => void): void {
    this.subscriptions.add(cleanup)
  }

  removeCleanup(cleanup: () => void): void {
    this.subscriptions.delete(cleanup)
  }

  cleanup(): void {
    this.subscriptions.forEach(cleanup => {
      try {
        cleanup()
      } catch (error) {
        // Erreur de nettoyage ignorée
      }
    })
    this.subscriptions.clear()
  }
}

// Hook pour gérer automatiquement le nettoyage
export const useCleanup = (cleanupFn: () => void) => {
  React.useEffect(() => {
    const manager = MemoryManager.getInstance()
    manager.addCleanup(cleanupFn)

    return () => {
      manager.removeCleanup(cleanupFn)
    }
  }, [cleanupFn])
}

// Mesure des performances
export const measurePerformance = (name: string) => {
  const start = performance.now()

  return {
    end: () => {
      const duration = performance.now() - start
      return duration
    }
  }
}

// Optimisation des images
export const optimizeImageUrl = (
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string => {
  if (!url) return '/placeholder-product.svg'

  // Si c'est déjà une URL optimisée, la retourner
  if (url.includes('placeholder') || url.includes('data:')) {
    return url
  }

  // Pour les URLs Supabase Storage, ajouter des paramètres d'optimisation
  if (url.includes('supabase')) {
    const params = new URLSearchParams()
    if (width) params.set('width', width.toString())
    if (height) params.set('height', height.toString())
    params.set('quality', quality.toString())
    params.set('format', 'webp')

    return `${url}?${params.toString()}`
  }

  return url
}

// Hook pour le chargement progressif
export const useProgressiveLoading = (totalItems: number, batchSize: number = 10) => {
  const [loadedCount, setLoadedCount] = React.useState(batchSize)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)

  const loadMore = React.useCallback(() => {
    if (loadedCount >= totalItems || isLoadingMore) return

    setIsLoadingMore(true)
    
    // Simuler un délai de chargement
    setTimeout(() => {
      setLoadedCount(prev => Math.min(prev + batchSize, totalItems))
      setIsLoadingMore(false)
    }, 300)
  }, [loadedCount, totalItems, batchSize, isLoadingMore])

  const hasMore = loadedCount < totalItems

  return {
    loadedCount,
    loadMore,
    hasMore,
    isLoadingMore
  }
}
