import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
  EyeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import OptimizedImage from '../UI/OptimizedImage'

interface ModernProductCardProps {
  product: {
    id: string
    name: string
    price: number
    compare_price?: number
    image_url?: string
    description?: string
    featured?: boolean
    slug?: string
    categories?: {
      name: string
    }
  }
  onAddToCart: (productId: string) => void
  onToggleWishlist: (productId: string) => void
  isInCart: boolean
  isInWishlist: boolean
  isLoading?: boolean
  index?: number
}

const ModernProductCard: React.FC<ModernProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isInCart,
  isInWishlist,
  isLoading = false,
  index = 0
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const discountPercentage = product.compare_price 
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  const hoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: { 
      scale: 1.02, 
      y: -8,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        variants={hoverVariants}
        className="card-elegant relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {product.featured && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center"
            >
              <SparklesIcon className="h-3 w-3 mr-1" />
              Vedette
            </motion.div>
          )}
          
          {discountPercentage > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full"
            >
              -{discountPercentage}%
            </motion.div>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-20">
          <motion.button
            onClick={() => onToggleWishlist(product.id)}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isInWishlist 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {isInWishlist ? (
              <HeartSolidIcon className="h-5 w-5" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
          </motion.button>
        </div>

        {/* Product Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 shimmer" />
          )}
          
          <OptimizedImage
            src={product.image_url || '/placeholder-product.svg'}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            fallbackSrc="/placeholder-product.svg"
            onLoad={() => {
              setImageLoaded(true)
              console.log('✅ ModernProductCard image loaded:', product.image_url)
            }}
            onError={() => {
              setImageLoaded(true)
              console.warn('❌ ModernProductCard image error:', product.image_url)
            }}
          />

          {/* Overlay Actions */}
          <motion.div
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-3">
              <Link to={`/products/${product.slug || product.id}`}>
                <motion.button
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <EyeIcon className="h-5 w-5" />
                </motion.button>
              </Link>
              
              <motion.button
                onClick={() => onAddToCart(product.id)}
                disabled={isLoading}
                className={`p-3 backdrop-blur-sm rounded-full text-white transition-all ${
                  isInCart
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-primary-500 hover:bg-primary-600'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCartIcon className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          {/* Category */}
          {product.categories && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-2"
            >
              {product.categories.name}
            </motion.div>
          )}

          {/* Product Name */}
          <Link to={`/products/${product.slug || product.id}`}>
            <motion.h3
              className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 hover:text-primary-600 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {product.name}
            </motion.h3>
          </Link>

          {/* Description */}
          {product.description && (
            <motion.p
              className="text-gray-600 text-sm line-clamp-2 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {product.description}
            </motion.p>
          )}

          {/* Rating (Placeholder) */}
          <motion.div
            className="flex items-center mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarSolidIcon
                  key={star}
                  className={`h-4 w-4 ${
                    star <= 4 ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-2">(4.0)</span>
          </motion.div>

          {/* Price */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </div>
            
            {discountPercentage > 0 && (
              <div className="text-green-600 font-semibold text-sm">
                Économisez {formatPrice(product.compare_price! - product.price)}
              </div>
            )}
          </motion.div>

          {/* Add to Cart Button - Mobile */}
          <motion.button
            onClick={() => onAddToCart(product.id)}
            disabled={isLoading}
            className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all md:hidden ${
              isInCart
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover-lift'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Ajout...
              </div>
            ) : isInCart ? (
              'Déjà dans le panier'
            ) : (
              'Ajouter au panier'
            )}
          </motion.button>
        </div>

        {/* Animated border on hover */}
        <motion.div
          className="absolute inset-0 border-2 border-transparent"
          animate={{
            borderColor: isHovered ? 'rgba(59, 130, 246, 0.3)' : 'transparent'
          }}
          transition={{ duration: 0.3 }}
          style={{ borderRadius: 'inherit' }}
        />
      </motion.div>
    </motion.div>
  )
}

export default ModernProductCard
