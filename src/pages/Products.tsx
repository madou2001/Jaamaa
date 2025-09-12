import React, { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  FunnelIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  FireIcon,
  TagIcon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon 
} from '@heroicons/react/24/solid'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useLocalCart } from '../hooks/useLocalCart'
import { useWishlist } from '../hooks/useWishlist'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/UI/Toast'

interface ProductFilters {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  sortBy?: 'name' | 'price' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
  const isFiltersInView = useInView(filtersRef, { once: true, margin: "-100px" })
  const isProductsInView = useInView(productsRef, { once: true, margin: "-100px" })

  const { toasts, removeToast, success, error: showError } = useToast()
  const { addToCart: addToLocalCart, isInCart } = useLocalCart()
  const { addToWishlist, isInWishlist } = useWishlist()

  // Get filters from URL
  const category = searchParams.get('category') || undefined
  const search = searchParams.get('search') || undefined
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  const featured = searchParams.get('featured') === 'true' ? true : undefined
  const sortBy = (searchParams.get('sortBy') as 'name' | 'price' | 'created_at') || 'created_at'
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'

  const filters: ProductFilters = {
    category,
    search,
    minPrice,
    maxPrice,
    featured,
    sortBy,
    sortOrder
  }

  useEffect(() => {
    fetchData()
  }, [searchParams])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('❌ Erreur catégories:', err)
    }
  }

  const fetchData = async () => {
    try {
      console.log('🔍 Chargement des produits avec filtres:', filters)
      setLoading(true)
      setError(null)

      // Build query with filters
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

      // Apply filters
      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice)
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }

      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured)
      }

      // Only show active products
      query = query.eq('status', 'active')

      // Apply sorting
      if (filters.sortBy === 'name') {
        query = query.order('name', { ascending: filters.sortOrder === 'asc' })
      } else if (filters.sortBy === 'price') {
        query = query.order('price', { ascending: filters.sortOrder === 'asc' })
      } else {
        query = query.order('created_at', { ascending: filters.sortOrder === 'asc' })
      }

      const { data: productsData, error: productsError } = await query

      if (productsError) {
        console.error('❌ Erreur produits:', productsError)
        throw new Error(`Erreur produits: ${productsError.message}`)
      }

      console.log('✅ Produits chargés:', productsData?.length)
      setProducts(productsData || [])

    } catch (err) {
      console.error('💥 Erreur dans fetchData:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string | number | boolean | null) => {
    const newParams = new URLSearchParams(searchParams)
    
    if (value === null || value === '' || value === false) {
      newParams.delete(key)
    } else {
      newParams.set(key, String(value))
    }
    
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const activeFiltersCount = [category, search, minPrice, maxPrice, featured].filter(Boolean).length

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const addToCart = async (productId: string) => {
    try {
      setAddingToCart(productId)
      
      const product = products.find(p => p.id === productId)
      if (!product) {
        showError('Erreur', 'Produit introuvable')
        return
      }

      await addToLocalCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url
      })

      success('Produit ajouté !', `${product.name} a été ajouté à votre panier`)

    } catch (err) {
      console.error('❌ Erreur ajout panier:', err)
      showError('Erreur', 'Impossible d\'ajouter le produit au panier')
    } finally {
      setAddingToCart(null)
    }
  }

  const addToFavorites = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId)
      if (product) {
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url
        })
        success('Ajouté aux favoris !', `${product.name} a été ajouté à vos favoris`)
      }
    } catch (err) {
      console.error('❌ Erreur ajout favoris:', err)
      showError('Erreur', 'Impossible d\'ajouter aux favoris')
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <motion.div 
          className="bg-white rounded-3xl p-12 shadow-2xl border border-red-200 max-w-lg mx-auto text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-6">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oups ! Une erreur est survenue</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <motion.button 
            onClick={fetchData}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Réessayer
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* CONTROLS SECTION PREMIUM */}
        <motion.div 
          ref={filtersRef}
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isFiltersInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            {/* Left controls */}
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden glass px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-white/80 transition-all duration-300 hover-lift"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 inline" />
                Filtres
                {activeFiltersCount > 0 && (
                  <motion.span 
                    className="ml-2 bg-gradient-to-r from-primary-500 to-blue-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {activeFiltersCount}
                  </motion.span>
                )}
              </motion.button>

              <div className="flex items-center text-gray-600 glass px-4 py-2 rounded-xl">
                <SparklesIcon className="h-5 w-5 mr-2 text-primary-500" />
                {loading ? (
                  <motion.span 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Chargement...
                  </motion.span>
                ) : (
                  <span className="font-semibold">
                    {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-')
                    handleFilterChange('sortBy', newSortBy)
                    handleFilterChange('sortOrder', newSortOrder)
                  }}
                  className="glass px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-white/80 transition-all duration-300 cursor-pointer border-0 focus:ring-2 focus:ring-primary-500 min-w-[200px]"
                >
                  <option value="created_at-desc">📅 Plus récents</option>
                  <option value="created_at-asc">📅 Plus anciens</option>
                  <option value="name-asc">🔤 Nom A-Z</option>
                  <option value="name-desc">🔤 Nom Z-A</option>
                  <option value="price-asc">💰 Prix croissant</option>
                  <option value="price-desc">💰 Prix décroissant</option>
                </select>
      </div>

              {/* View Mode */}
              <div className="glass rounded-xl p-1 flex">
                <motion.button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* SIDEBAR FILTERS PREMIUM */}
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 1024) && (
              <motion.div 
                className="lg:col-span-1 mb-8 lg:mb-0"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="glass rounded-3xl p-8 sticky top-24">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <FunnelIcon className="h-6 w-6 mr-3 text-primary-500" />
                      Filtres
                    </h2>
              {activeFiltersCount > 0 && (
                      <motion.button
                  onClick={clearFilters}
                        className="text-primary-600 hover:text-primary-700 font-semibold hover-lift"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                >
                        ✨ Effacer tout
                      </motion.button>
              )}
            </div>

                  <div className="space-y-8">
              {/* Search */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <MagnifyingGlassIcon className="h-4 w-4 mr-2 text-primary-500" />
                  Recherche
                </label>
                      <div className="relative">
                <input
                  type="text"
                  value={search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                          onFocus={() => setSearchFocused(true)}
                          onBlur={() => setSearchFocused(false)}
                          placeholder="Rechercher un produit..."
                          className={`w-full px-5 py-4 pl-12 bg-white/80 backdrop-blur-sm border-2 rounded-xl font-medium transition-all duration-300 focus:outline-none ${
                            searchFocused 
                              ? 'border-primary-500 ring-4 ring-primary-500/20 bg-white' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        />
                        <MagnifyingGlassIcon className={`h-5 w-5 absolute left-4 top-4 transition-colors duration-300 ${
                          searchFocused ? 'text-primary-500' : 'text-gray-400'
                        }`} />
                        {search && (
                          <motion.button
                            onClick={() => handleFilterChange('search', '')}
                            className="absolute right-3 top-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <XMarkIcon className="h-4 w-4 text-gray-400" />
                          </motion.button>
                        )}
              </div>
                    </motion.div>

              {/* Category */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <TagIcon className="h-4 w-4 mr-2 text-primary-500" />
                  Catégorie
                </label>
                <select
                  value={category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl font-medium hover:border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all duration-300"
                >
                        <option value="">✨ Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                            📂 {cat.name}
                    </option>
                  ))}
                </select>
                    </motion.div>

              {/* Price Range */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        💰 Fourchette de prix
                </label>
                      <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : null)}
                          placeholder="Prix min"
                          className="px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl font-medium hover:border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all duration-300"
                          min="0"
                  />
                  <input
                    type="number"
                    value={maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : null)}
                          placeholder="Prix max"
                          className="px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl font-medium hover:border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all duration-300"
                          min="0"
                  />
                </div>
                    </motion.div>

              {/* Featured */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <motion.label 
                        className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl cursor-pointer hover:from-yellow-100 hover:to-orange-100 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                  <input
                    type="checkbox"
                    checked={featured || false}
                          onChange={(e) => handleFilterChange('featured', e.target.checked || null)}
                          className="h-5 w-5 text-yellow-500 focus:ring-yellow-400 border-yellow-300 rounded transition-colors"
                        />
                        <span className="ml-3 font-semibold text-gray-800 flex items-center">
                          <FireIcon className="h-5 w-5 mr-2 text-orange-500" />
                          Produits vedettes uniquement
                        </span>
                      </motion.label>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PRODUCTS GRID/LIST PREMIUM */}
          <div className="lg:col-span-3">
            <motion.div 
              ref={productsRef}
              initial={{ opacity: 0, y: 30 }}
              animate={isProductsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
            >
              {loading ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
                  {Array.from({ length: 9 }).map((_, index) => (
                    <motion.div 
                      key={index} 
                      className="glass rounded-3xl p-6 overflow-hidden"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mb-6 smooth-loading"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 smooth-loading"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2 smooth-loading"></div>
                        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full smooth-loading"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`group glass rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      {/* Image */}
                      <div className={`relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden ${
                        viewMode === 'list' ? 'w-64 h-48' : 'h-72'
                      }`}>
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              console.log('❌ Erreur image:', product.image_url)
                              e.currentTarget.src = '/placeholder-product.svg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                            📷
                          </div>
                        )}
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Actions overlay */}
                        <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                          <motion.button 
                            onClick={() => addToFavorites(product.id)}
                            className={`p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                              isInWishlist(product.id) 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Ajouter aux favoris"
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
                            className={`p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                              isInCart(product.id)
                                ? 'bg-green-500 text-white'
                                : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-primary-500 hover:text-white'
                            } disabled:opacity-50`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Ajouter au panier"
                          >
                            {addingToCart === product.id ? (
                              <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <ShoppingCartIcon className="h-5 w-5" />
                            )}
                          </motion.button>

                          <Link 
                            to={`/products/${product.slug}`}
                            className="p-3 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-blue-500 hover:text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                            title="Voir les détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col space-y-2">
                          {product.featured && (
                            <motion.div 
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                              animate={{ 
                                scale: [1, 1.05, 1],
                                rotate: [0, 2, -2, 0]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              ⭐ VEDETTE
                            </motion.div>
                          )}
                          {product.compare_price && (
                            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                              🔥 PROMO
                            </div>
                          )}
                        </div>

                        {/* Price tag */}
                        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 backdrop-blur-sm text-gray-900 font-bold px-4 py-2 rounded-xl shadow-lg">
                            {formatPrice(product.price)}
              </div>
            </div>
          </div>

                      {/* Content */}
                      <div className="p-8 flex-1">
                        {/* Category */}
                        {product.categories && (
                          <div className="text-sm text-primary-600 font-semibold mb-2 flex items-center">
                            <TagIcon className="h-4 w-4 mr-1" />
                            {product.categories.name}
                          </div>
                        )}

                        {/* Name */}
                        <Link to={`/products/${product.slug}`}>
                          <h3 className="font-bold text-xl mb-3 hover:text-primary-600 transition-colors line-clamp-2 group-hover:text-primary-600">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Rating stars */}
                        <div className="flex items-center mb-4">
                          {[...Array(5)].map((_, i) => (
                            <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
                          ))}
                          <span className="text-sm text-gray-500 ml-2 font-medium">(4.8)</span>
        </div>

                        {/* Description */}
                        {product.description && (
                          <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                            {product.description}
                          </p>
                        )}

                        {/* Price & Actions */}
                        <div className={`flex items-center ${viewMode === 'list' ? 'justify-between' : 'flex-col space-y-4'}`}>
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                            {product.compare_price && (
                              <span className="text-lg text-gray-500 line-through">
                                {formatPrice(product.compare_price)}
                  </span>
                )}
            </div>

                          <motion.button 
                            onClick={() => addToCart(product.id)}
                            disabled={addingToCart === product.id}
                            className={`py-4 px-8 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                              isInCart(product.id) 
                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
                                : 'bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                            } ${viewMode === 'list' ? 'ml-4' : 'w-full'}`}
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
                                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                                Dans le panier ✓
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
                </div>
              ) : (
                <motion.div 
                  className="text-center py-20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="glass rounded-3xl p-16 max-w-md mx-auto">
                    <div className="text-8xl mb-8">🔍</div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Aucun produit trouvé</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      Essayez de modifier vos critères de recherche ou explorez nos catégories.
                    </p>
                    {activeFiltersCount > 0 && (
                      <motion.button
                        onClick={clearFilters}
                        className="bg-gradient-to-r from-primary-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ✨ Effacer tous les filtres
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
              </div>
            </div>
          </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default Products
