import React from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import OptimizedImage from '../UI/OptimizedImage'
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

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
  onToggleFavorite?: (productId: string) => void
  isFavorite?: boolean
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const discountPercentage = product.compare_price 
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="card group hover:shadow-lg transition-all duration-300"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <Link to={`/products/${product.slug}`}>
          <OptimizedImage
            src={product.image_url || product.images?.[0] || '/placeholder-product.svg'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            width={400}
            height={300}
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.featured && (
            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
              Vedette
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite?.(product.id)}
          className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
        >
          {isFavorite ? (
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {/* Add to Cart Button */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onAddToCart?.(product.id)}
            className="w-full bg-white text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            <span>Ajouter au panier</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand & Category */}
        <div className="flex items-center justify-between mb-1">
          {product.brands && (
            <Link
              to={`/brands/${product.brands.slug}`}
              className="text-primary-600 text-xs font-medium hover:text-primary-700 uppercase tracking-wide"
            >
              {product.brands.name}
            </Link>
          )}
          {product.categories && (
            <Link
              to={`/categories/${product.categories.slug}`}
              className="text-gray-500 text-xs hover:text-gray-700"
            >
              {product.categories.name}
            </Link>
          )}
        </div>

        {/* Product Name */}
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {(product.short_description || product.description) && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {product.short_description || product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center space-x-2 mt-3">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.compare_price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.track_quantity && (
          <div className="mt-2">
            {product.quantity && product.quantity > 0 ? (
              <span className="text-green-600 text-sm">
                En stock ({product.quantity} disponibles)
              </span>
            ) : (
              <span className="text-red-600 text-sm">
                {product.allow_backorder ? 'Rupture de stock' : 'Indisponible'}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ProductCard
