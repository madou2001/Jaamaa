/**
 * Utilitaires pour la gestion des images et éviter les erreurs CORS
 */

/**
 * Convertit une URL d'image externe en URL optimisée
 */
export const getProxyImageUrl = (imageUrl: string): string => {
  if (!imageUrl || typeof imageUrl !== 'string') return '/placeholder-product.svg'
  
  // Si c'est déjà une URL locale, la retourner telle quelle
  if (imageUrl.startsWith('/') || imageUrl.startsWith('./')) {
    return imageUrl
  }
  
  // Pour les URLs Unsplash, utiliser directement l'URL avec les paramètres d'optimisation
  if (imageUrl.includes('images.unsplash.com')) {
    return imageUrl
  }
  
  // Pour d'autres URLs externes, les retourner telles quelles
  return imageUrl
}

/**
 * Gère les erreurs de chargement d'image en fournissant une image de fallback
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget
  if (img.src !== '/placeholder-product.svg') {
    img.src = '/placeholder-product.svg'
  }
}

/**
 * Précharge une image pour améliorer les performances
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = getProxyImageUrl(src)
  })
}

/**
 * Optimise l'URL d'une image Unsplash avec des paramètres de qualité
 */
export const optimizeImageUrl = (imageUrl: string, width?: number, height?: number, quality = 80): string => {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes('unsplash.com')) {
    return imageUrl || ''
  }
  
  const url = new URL(imageUrl)
  
  if (width) url.searchParams.set('w', width.toString())
  if (height) url.searchParams.set('h', height.toString())
  url.searchParams.set('q', quality.toString())
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', 'crop')
  
  return url.toString()
}
