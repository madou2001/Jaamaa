import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdvancedSearch } from '../hooks/useAdvancedSearch'
import { useLocalCart } from '../hooks/useLocalCart'
import { useWishlist } from '../hooks/useWishlist'
import { useToast } from '../hooks/useToast'
import AdvancedSearchBar from '../components/Search/AdvancedSearchBar'
import ToastContainer from '../components/UI/Toast'

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { results, loading, search } = useAdvancedSearch()
  const { addToCart, isInCart } = useLocalCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { toasts, removeToast, success, error } = useToast()

  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [] as string[],
    priceRange: null as { min: number; max: number } | null,
    rating: null as number | null,
    inStock: false,
    featured: false
  })

  const query = searchParams.get('q') || ''
  const categoryFilter = searchParams.get('category') || ''
  const sortBy = searchParams.get('sort') || 'relevance'

  useEffect(() => {
    performSearch()
  }, [searchParams])

  const performSearch = async () => {
    const searchFilters = {
      query,
      category: categoryFilter || undefined,
      minPrice: selectedFilters.priceRange?.min,
      maxPrice: selectedFilters.priceRange?.max,
      rating: selectedFilters.rating || undefined,
      inStock: selectedFilters.inStock || undefined,
      featured: selectedFilters.featured || undefined,
      sortBy: sortBy as any
    }

    await search(searchFilters)
  }

  const handleFilterChange = (key: string, value: any) => {
    const newParams = new URLSearchParams(searchParams)
    
    if (value === null || value === '' || value === false) {
      newParams.delete(key)
    } else {
      newParams.set(key, String(value))
    }
    
    setSearchParams(newParams)
  }

  const handleCategoryFilter = (categoryId: string) => {
    const newCategories = selectedFilters.categories.includes(categoryId)
      ? selectedFilters.categories.filter(id => id !== categoryId)
      : [...selectedFilters.categories, categoryId]
    
    setSelectedFilters(prev => ({ ...prev, categories: newCategories }))
    performSearch()
  }

  const handlePriceRangeFilter = (min: number, max: number) => {
    setSelectedFilters(prev => ({ 
      ...prev, 
      priceRange: prev.priceRange?.min === min && prev.priceRange?.max === max 
        ? null 
        : { min, max } 
    }))
    performSearch()
  }

  const clearAllFilters = () => {
    setSelectedFilters({
      categories: [],
      priceRange: null,
      rating: null,
      inStock: false,
      featured: false
    })
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('category')
    newParams.delete('sort')
    setSearchParams(newParams)
  }

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url
      })
      success('Produit ajouté !', `${product.name} ajouté au panier`)
    } catch (err) {
      error('Erreur', 'Impossible d\'ajouter le produit au panier')
    }
  }

  const handleToggleWishlist = async (product: any) => {
    try {
      const added = await toggleWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url
      })
      
      if (added) {
        success('Ajouté aux favoris !', `${product.name} ajouté à vos favoris`)
      } else {
        success('Retiré des favoris', `${product.name} retiré de vos favoris`)
      }
    } catch (err) {
      error('Erreur', 'Impossible de modifier la liste de souhaits')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const activeFiltersCount = selectedFilters.categories.length + 
    (selectedFilters.priceRange ? 1 : 0) + 
    (selectedFilters.rating ? 1 : 0) + 
    (selectedFilters.inStock ? 1 : 0) + 
    (selectedFilters.featured ? 1 : 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {query ? `Résultats pour "${query}"` : 'Recherche'}
          </h1>
          {!loading && (
            <span className="text-gray-600">
              ({results.totalCount} résultat{results.totalCount !== 1 ? 's' : ''})
            </span>
          )}
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mb-6">
          <AdvancedSearchBar 
            placeholder="Affiner votre recherche..."
            className="w-full"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Effacer tous les filtres
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="input-field min-w-0"
          >
            <option value="relevance">Pertinence</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="rating">Mieux notés</option>
            <option value="newest">Plus récents</option>
            <option value="popular">Populaires</option>
          </select>

          {/* View Mode */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'grid'
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === 'list'
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden p-1"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Categories */}
              {results.facets.categories.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Catégories</h3>
                  <div className="space-y-2">
                    {results.facets.categories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.categories.includes(category.id)}
                          onChange={() => handleCategoryFilter(category.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {category.name}
                          <span className="text-gray-500 ml-1">({category.count})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Ranges */}
              {results.facets.priceRanges.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Prix</h3>
                  <div className="space-y-2">
                    {results.facets.priceRanges.map((range) => (
                      <button
                        key={`${range.min}-${range.max}`}
                        onClick={() => handlePriceRangeFilter(range.min, range.max)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md border transition-colors ${
                          selectedFilters.priceRange?.min === range.min && selectedFilters.priceRange?.max === range.max
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {range.max === Infinity 
                          ? `${formatPrice(range.min)} et plus`
                          : `${formatPrice(range.min)} - ${formatPrice(range.max)}`
                        }
                        <span className="text-gray-500 ml-1">({range.count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Filters */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFilters.inStock}
                      onChange={(e) => {
                        setSelectedFilters(prev => ({ ...prev, inStock: e.target.checked }))
                        performSearch()
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">En stock uniquement</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFilters.featured}
                      onChange={(e) => {
                        setSelectedFilters(prev => ({ ...prev, featured: e.target.checked }))
                        performSearch()
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Produits vedettes</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4 smooth-loading"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 smooth-loading"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 smooth-loading"></div>
                </div>
              ))}
            </div>
          ) : results.products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                🔍 Aucun résultat trouvé
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun produit ne correspond à votre recherche
              </h3>
              <p className="text-gray-600 mb-6">
                Essayez avec d'autres mots-clés ou modifiez vos filtres.
              </p>
              <div className="space-y-3">
                <button
                  onClick={clearAllFilters}
                  className="btn-primary"
                >
                  Effacer tous les filtres
                </button>
                <Link to="/products" className="btn-secondary block">
                  Voir tous les produits
                </Link>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {results.products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Product Image */}
                  <div className={`bg-gray-100 relative ${
                    viewMode === 'list' ? 'w-48 h-32' : 'h-48'
                  }`}>
                    <Link to={`/products/${product.slug}`}>
                      <img
                        src={product.image_url || '/placeholder-product.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.svg'
                        }}
                      />
                    </Link>

                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className={`p-2 rounded-full shadow-md transition-colors ${
                          isInWishlist(product.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
                        }`}
                      >
                        <StarIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 space-y-1">
                      {product.featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                          ⭐ Vedette
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1">
                    {/* Category */}
                    {product.categories && (
                      <Link
                        to={`/products?category=${product.categories.id}`}
                        className="text-xs text-primary-600 hover:text-primary-700 mb-1 block"
                      >
                        {product.categories.name}
                      </Link>
                    )}

                    {/* Name */}
                    <Link to={`/products/${product.slug}`}>
                      <h3 className={`font-semibold text-gray-900 hover:text-primary-600 transition-colors ${
                        viewMode === 'list' ? 'text-lg' : 'text-base'
                      } line-clamp-2`}>
                        {product.name}
                      </h3>
                    </Link>

                    {/* Description */}
                    {viewMode === 'list' && product.description && (
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.compare_price)}
                        </span>
                      )}
                    </div>

                    {/* Rating Placeholder */}
                    <div className="mt-2">
                      {renderStars(4)} {/* Placeholder rating */}
                      <span className="text-xs text-gray-500 ml-1">(24 avis)</span>
                    </div>

                    {/* Add to Cart */}
                    <div className="mt-4">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                          isInCart(product.id)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                        }`}
                      >
                        {isInCart(product.id) ? 'Déjà dans le panier' : 'Ajouter au panier'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default SearchResults
