import React from 'react'
import ProductCard from './ProductCard'
import type { Database } from '../../lib/supabase'

// Type flexible qui fonctionne avec l'ancienne et nouvelle structure
type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row']
  brands?: {
    id: string
    name: string
    slug: string
    logo_url?: string | null
  } | null
  short_description?: string | null
}

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  onAddToCart?: (productId: string) => void
  onToggleFavorite?: (productId: string) => void
  favorites?: string[]
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  onAddToCart,
  onToggleFavorite,
  favorites = []
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="card bg-gray-50">
            <div className="h-48 rounded-t-xl smooth-loading"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 rounded w-1/4 smooth-loading"></div>
              <div className="h-5 rounded w-3/4 smooth-loading"></div>
              <div className="h-4 rounded w-full smooth-loading"></div>
              <div className="h-4 rounded w-2/3 smooth-loading"></div>
              <div className="h-6 rounded w-1/3 smooth-loading"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
        <p className="text-gray-500">Essayez de modifier vos critères de recherche.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favorites.includes(product.id)}
        />
      ))}
    </div>
  )
}

export default ProductGrid
