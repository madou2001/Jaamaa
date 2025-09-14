import React, { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  FunnelIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon 
} from '@heroicons/react/24/solid'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useOptimizedProducts } from '../hooks/useOptimizedProducts'
import { useOptimizedCategories } from '../hooks/useOptimizedCategories'
import { useLocalCart } from '../hooks/useLocalCart'
import { useWishlist } from '../hooks/useWishlist'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/UI/Toast'
import OptimizedImage from '../components/UI/OptimizedImage'
import { ProductsGridSkeleton, EmptyState } from '../components/UI/LoadingStates'
import { setSEO } from '../utils/seo'
import { optimizeImageUrl } from '../utils/performance'

interface ProductFilters {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [searchFocused, setSearchFocused] = useState(false)

  // Animation refs
  const headerRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)

  // InView animations
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })
  const isProductsInView = useInView(productsRef, { once: true, margin: "-100px" })

  const { toasts, removeToast, success, error: showError } = useToast()
  const { addToCart: addToLocalCart, isInCart } = useLocalCart()
  const { addToWishlist, isInWishlist } = useWishlist()

  // Récupérer les filtres depuis l'URL - TOUS LES PRODUITS
  const filters: ProductFilters = {
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    featured: searchParams.get('featured') === 'true' || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'name',
    sortOrder: (searchParams.get('sortOrder') as any) || 'asc',
    limit: 1000 // Charger tous les produits d'un coup
  }

  // Hooks optimisés
  const { 
    products, 
    loading: productsLoading, 
    error: productsError, 
    total
  } = useOptimizedProducts(filters)
  
  const { 
    categories, 
    loading: categoriesLoading 
  } = useOptimizedCategories()

  const sortOptions = [
    { value: 'name-asc', label: 'Nom A-Z', icon: ArrowUpIcon },
    { value: 'name-desc', label: 'Nom Z-A', icon: ArrowDownIcon },
    { value: 'price-asc', label: 'Prix croissant', icon: ArrowUpIcon },
    { value: 'price-desc', label: 'Prix décroissant', icon: ArrowDownIcon },
    { value: 'created_at-desc', label: 'Plus récents', icon: SparklesIcon },
    { value: 'featured-true', label: 'Vedettes d\'abord', icon: StarIcon }
  ]

  useEffect(() => {
    // SEO pour la page produits
    const categoryName = categories.find(c => c.id === filters.category)?.name
    const title = categoryName 
      ? `${categoryName} - Produits Premium | Jaayma`
      : 'Tous nos Produits Premium | Jaayma'
    
    setSEO({
      title,
      description: `Découvrez notre sélection de produits ${categoryName ? `dans la catégorie ${categoryName}` : 'premium'}. Livraison gratuite, garantie 2 ans et prix imbattables.`,
      keywords: `produits, ${categoryName || 'shopping'}, e-commerce, qualité premium, livraison gratuite`,
      type: 'website'
    })
  }, [categories, filters.category])



  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const params = new URLSearchParams(searchParams)
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString())
      } else {
        params.delete(key)
      }
    })
    
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  // États de chargement combinés
  const loading = productsLoading || categoriesLoading
  const error = productsError

  const addToCart = async (productId: string) => {
    try {
      setAddingToCart(productId)
      const product = products.find(p => p.id === productId)
      if (!product) return

      await addToLocalCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || undefined
      })

      success('Produit ajouté !', `${product.name} a été ajouté à votre panier`)
    } catch (err) {
      showError('Erreur', 'Impossible d\'ajouter le produit au panier')
    } finally {
      setAddingToCart(null)
    }
  }

  const addToFavorites = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

        await addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
        image_url: product.image_url || undefined
        })

        success('Ajouté aux favoris !', `${product.name} a été ajouté à vos favoris`)
    } catch (err) {
      showError('Erreur', 'Impossible d\'ajouter aux favoris')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category) count++
    if (filters.search) count++
    if (filters.minPrice || filters.maxPrice) count++
    if (filters.featured) count++
    return count
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      {/* Header avec recherche et filtres */}
      <section ref={headerRef} className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
            {/* Titre et breadcrumb */}
            <div className="mb-8">
              <nav className="text-sm text-gray-600 mb-4">
                <Link to="/" className="hover:text-indigo-600 transition-colors">Accueil</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">Produits</span>
                {filters.category && categories.find(c => c.id === filters.category) && (
                  <>
                    <span className="mx-2">/</span>
                    <span className="text-indigo-600 font-medium">
                      {categories.find(c => c.id === filters.category)?.name}
                    </span>
                  </>
                )}
              </nav>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {filters.category && categories.find(c => c.id === filters.category)
                      ? categories.find(c => c.id === filters.category)?.name
                      : 'Tous nos Produits'
                    }
                  </h1>
                  <p className="text-gray-600">
                    {loading ? 'Chargement...' : `${products.length} produit${products.length > 1 ? 's' : ''} trouvé${products.length > 1 ? 's' : ''}`}
                  </p>
                </div>

                {/* Badges de confiance */}
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <ShieldCheckIcon className="w-4 h-4 mr-1" />
                    Garantie 2 ans
                  </div>
                  <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <BoltIcon className="w-4 h-4 mr-1" />
                    Livraison express
                  </div>
                </div>
              </div>
            </div>

            {/* Barre de recherche et contrôles */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher des produits..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                  {filters.search && (
                    <button
                      onClick={() => updateFilters({ search: undefined })}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Contrôles */}
              <div className="flex items-center space-x-3">
                {/* Bouton filtres */}
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative inline-flex items-center px-4 py-3 border rounded-xl font-medium transition-all duration-300 ${
                    showFilters || getActiveFiltersCount() > 0
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Filtres
                  {getActiveFiltersCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </motion.button>

                {/* Sélecteur de tri */}
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-')
                    updateFilters({ sortBy: sortBy as any, sortOrder: sortOrder as any })
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Mode d'affichage */}
                <div className="flex border border-gray-300 rounded-xl overflow-hidden shadow-sm">
                  <button
                  onClick={() => setViewMode('grid')}
                    className={`p-3 transition-all duration-300 ${
                    viewMode === 'grid'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                  onClick={() => setViewMode('list')}
                    className={`p-3 transition-all duration-300 ${
                    viewMode === 'list'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
      </section>

      {/* Panel de filtres */}
          <AnimatePresence>
        {showFilters && (
          <motion.section
            ref={filtersRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b border-gray-200 shadow-sm"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Catégories */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Catégories</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map(category => (
                      <label key={category.id} className="flex items-center group cursor-pointer">
                <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={filters.category === category.id}
                          onChange={(e) => updateFilters({ category: e.target.value })}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-indigo-600 transition-colors">
                          {category.name}
                        </span>
                </label>
                    ))}
                  </div>
                </div>

                {/* Prix */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Prix</h3>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                  <input
                    type="number"
                        placeholder="Min"
                        value={filters.minPrice || ''}
                        onChange={(e) => updateFilters({ minPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                        placeholder="Max"
                        value={filters.maxPrice || ''}
                        onChange={(e) => updateFilters({ maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span>€</span>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Options</h3>
                  <div className="space-y-2">
                    <label className="flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                        checked={filters.featured || false}
                        onChange={(e) => updateFilters({ featured: e.target.checked || undefined })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-indigo-600 transition-colors">
                          Produits vedettes uniquement
                        </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-end">
                  <button
                    onClick={() => {
                      clearFilters()
                      setShowFilters(false)
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-2"
                  >
                    Effacer les filtres
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
            )}
          </AnimatePresence>

      {/* Contenu principal */}
      <section ref={productsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : loading ? (
          <ProductsGridSkeleton count={12} viewMode={viewMode} />
        ) : products.length === 0 ? (
          <EmptyState
            title="Aucun produit trouvé"
            description="Essayez de modifier vos critères de recherche ou parcourez toutes nos catégories."
            icon={<span className="text-4xl">🔍</span>}
            action={
              <div className="flex justify-center space-x-4">
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Effacer les filtres
                </button>
                <Link
                  to="/categories"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Voir les catégories
                </Link>
              </div>
            }
          />
        ) : (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={isProductsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}
          >
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 50 }}
                animate={isProductsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ${
                        viewMode === 'list' ? 'flex' : 'h-full flex flex-col'
                      }`}
                whileHover={{ y: -5, scale: 1.02 }}
                    >
                      {/* Image */}
                <div className={`relative bg-gray-100 overflow-hidden ${
                  viewMode === 'list' ? 'w-64 h-48' : 'h-64'
                      }`}>
                        {product.image_url ? (
                      <OptimizedImage
                        src={optimizeImageUrl(product.image_url, 400, 400)}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        fallbackSrc="/placeholder-product.svg"
                          />
                        ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                            📷
                          </div>
                        )}
                        
                  {/* Overlay avec actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-4 right-4 flex flex-col space-y-2">
                          <motion.button 
                            onClick={() => addToFavorites(product.id)}
                        className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                              isInWishlist(product.id) 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isInWishlist(product.id) ? (
                              <HeartSolidIcon className="h-5 w-5" />
                            ) : (
                              <HeartIcon className="h-5 w-5" />
                            )}
                          </motion.button>
                          
                          <motion.button 
                            onClick={() => addToCart(product.id)}
                            disabled={addingToCart === product.id}
                        className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                              isInCart(product.id)
                                ? 'bg-green-500 text-white'
                            : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-indigo-500 hover:text-white'
                            } disabled:opacity-50`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {addingToCart === product.id ? (
                              <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <ShoppingCartIcon className="h-5 w-5" />
                            )}
                          </motion.button>
                    </div>

                    {/* Vue rapide */}
                    <div className="absolute bottom-4 left-4 right-4">
                          <Link 
                            to={`/products/${product.slug}`}
                        className="w-full bg-white/90 backdrop-blur-sm text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-white transition-colors flex items-center justify-center"
                          >
                        <EyeIcon className="h-5 w-5 mr-2" />
                        Vue rapide
                          </Link>
                    </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col space-y-2">
                          {product.featured && (
                            <motion.div 
                        className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                              animate={{ 
                                scale: [1, 1.05, 1],
                                rotate: [0, 2, -2, 0]
                              }}
                              transition={{ 
                          duration: 3,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              ⭐ VEDETTE
                            </motion.div>
                          )}
                    
                    {product.compare_price && product.compare_price > product.price && (
                      <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                            </div>
                          )}
            </div>
          </div>

                {/* Contenu */}
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : 'flex flex-col flex-grow'}`}>
                  {/* Catégorie */}
                        {product.categories && (
                    <div className="text-sm text-indigo-600 font-medium mb-2">
                            {product.categories.name}
                          </div>
                        )}

                  {/* Nom */}
                        <Link to={`/products/${product.slug}`} className="block mb-3">
                    <h3 className="font-bold text-lg hover:text-indigo-600 transition-colors leading-tight min-h-[3.5rem] flex items-start">
                            <span className="line-clamp-2">{product.name}</span>
                          </h3>
                        </Link>

                  {/* Notes */}
                  <div className="flex items-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
                          ))}
                    <span className="text-sm text-gray-500 ml-2">(4.8)</span>
        </div>

                        {/* Description */}
                        {product.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                  {/* Section prix et bouton - auto-positionnée en bas */}
                  <div className={`${viewMode === 'grid' ? 'mt-auto space-y-4' : ''}`}>
                    {/* Prix */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                                {formatPrice(product.price)}
                              </span>
                              {product.compare_price && (
                          <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.compare_price)}
                    </span>
                  )}
                      </div>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                          -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                        </span>
                      )}
              </div>

                    {/* Bouton d'action */}
                            <motion.button 
                              onClick={() => addToCart(product.id)}
                              disabled={addingToCart === product.id}
                      className={`w-full py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 flex items-center justify-center ${
                                isInCart(product.id) 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {addingToCart === product.id ? (
                                <>
                                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Ajout en cours...
                                </>
                              ) : isInCart(product.id) ? (
                                <>
                          <CheckIcon className="h-5 w-5 mr-2" />
                          Dans le panier
                                </>
                              ) : (
                                <>
                                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                                  Ajouter au panier
                                </>
                              )}
                            </motion.button>
                  </div>
                      </div>
                    </motion.div>
                  ))}

            {/* Affichage du total de produits */}
            {products.length > 0 && (
              <div className="text-center mt-8 mb-4">
                <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
                  <span className="text-gray-600 text-sm">
                    <span className="font-bold text-indigo-600">{products.length}</span> produit{products.length > 1 ? 's' : ''} affiché{products.length > 1 ? 's' : ''} sur <span className="font-bold text-indigo-600">{total}</span>
                  </span>
                </div>
              </div>
            )}
                </motion.div>
              )}
      </section>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default Products
