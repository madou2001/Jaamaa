import React from 'react'
import { motion } from 'framer-motion'

// Skeleton pour les cartes produits
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-6">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  </div>
)

// Skeleton pour la grille de produits
export const ProductsGridSkeleton: React.FC<{ count?: number; viewMode?: 'grid' | 'list' }> = ({ 
  count = 12, 
  viewMode = 'grid' 
}) => (
  <div className={`grid gap-6 ${
    viewMode === 'grid' 
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
      : 'grid-cols-1'
  }`}>
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
)

// Skeleton pour les catégories
export const CategorySkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="aspect-square p-6 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
)

// Skeleton pour la grille de catégories
export const CategoriesGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <CategorySkeleton key={index} />
    ))}
  </div>
)

// Chargement avec animation de points
export const LoadingDots: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizeClasses[size]} bg-indigo-600 rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}

// Spinner moderne
export const ModernSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }> = ({ 
  size = 'md', 
  color = 'indigo-600' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-gray-200 border-t-${color} rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  )
}

// Chargement de page avec message
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Chargement...' }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 flex items-center justify-center">
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4"
      >
        <ModernSpinner size="lg" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 font-medium"
      >
        {message}
      </motion.p>
    </div>
  </div>
)

// Bouton de chargement plus
export const LoadMoreButton: React.FC<{
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  loadedCount?: number
  totalCount?: number
}> = ({ loading, hasMore, onLoadMore, loadedCount, totalCount }) => {
  if (!hasMore) return null

  return (
    <div className="text-center mt-12">
      <motion.button
        onClick={onLoadMore}
        disabled={loading}
        className="inline-flex items-center px-8 py-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
      >
        {loading ? (
          <>
            <ModernSpinner size="sm" />
            <span className="ml-3">Chargement...</span>
          </>
        ) : (
          <>
            <span>Charger plus</span>
            {loadedCount && totalCount && (
              <span className="ml-2 text-sm text-gray-500">
                ({loadedCount}/{totalCount})
              </span>
            )}
          </>
        )}
      </motion.button>
    </div>
  )
}

// Chargement progressif avec barre
export const ProgressiveLoader: React.FC<{
  current: number
  total: number
  message?: string
}> = ({ current, total, message = 'Chargement' }) => {
  const progress = Math.min((current / total) * 100, 100)

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{message}</span>
        <span className="text-sm text-gray-600">{current}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}

// État vide avec illustration
export const EmptyState: React.FC<{
  title: string
  description: string
  icon?: React.ReactNode
  action?: React.ReactNode
}> = ({ title, description, icon, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-center py-20"
  >
    {icon && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6"
      >
        {icon}
      </motion.div>
    )}
    <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
    {action && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {action}
      </motion.div>
    )}
  </motion.div>
)

// Chargement par sections
export const SectionLoader: React.FC<{
  title?: string
  lines?: number
}> = ({ lines = 3 }) => (
  <div className="animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  </div>
)
