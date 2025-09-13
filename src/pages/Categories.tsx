import React, { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { 
  ArrowRightIcon,
  TagIcon,
  SparklesIcon,
  FolderIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronRightIcon,
  XMarkIcon,
  FireIcon,
  ChartBarIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { setSEO } from '../utils/seo'
import OptimizedImage from '../components/UI/OptimizedImage'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  created_at: string
  updated_at: string
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'products' | 'recent'>('name')
  const [showFilters, setShowFilters] = useState(false)

  // Animation refs
  const headerRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  // InView animations
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })
  const isCategoriesInView = useInView(categoriesRef, { once: true, margin: "-100px" })
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" })

  // Icônes par catégorie (mapping par nom)
  const categoryIcons: { [key: string]: string } = {
    'électronique': '📱',
    'vêtements': '👕',
    'maison': '🏠',
    'sport': '⚽',
    'livres': '📚',
    'jeux': '🎮',
    'beauté': '💄',
    'cuisine': '🍳',
    'musique': '🎸',
    'auto': '🚗',
    'jardin': '🌱',
    'art': '🎭',
    'bijoux': '💎',
    'bricolage': '🔧'
  }

  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (name.includes(key)) {
        return icon
      }
    }
    return '🛍️' // Icône par défaut
  }

  const mockStats = {
    totalCategories: 0,
    totalProducts: 0,
    featuredCategories: 0,
    newThisMonth: 0
  }

  useEffect(() => {
    // SEO pour la page catégories
    setSEO({
      title: 'Toutes nos Catégories | Jaayma',
      description: 'Explorez toutes nos catégories de produits premium. Électronique, mode, maison, sport et bien plus encore.',
      keywords: 'catégories, produits, électronique, mode, maison, sport, shopping',
      type: 'website'
    })

    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (categoriesError) throw categoriesError
      
      setCategories(data || [])
      mockStats.totalCategories = data?.length || 0
      mockStats.featuredCategories = Math.floor((data?.length || 0) * 0.3)
      mockStats.newThisMonth = Math.floor((data?.length || 0) * 0.1)
      
    } catch (err) {
      console.error('Erreur chargement catégories:', err)
      setError('Impossible de charger les catégories')
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort categories
  const filteredCategories = categories
    .filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
        return a.name.localeCompare(b.name)
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'products':
          // Simulation - dans un vrai projet, on aurait le nombre de produits
          return Math.random() - 0.5
        default:
          return 0
      }
    })

  const clearSearch = () => {
    setSearchTerm('')
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchTerm) count++
    if (sortBy !== 'name') count++
    return count
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-2xl"></div>
              ))}
                </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchCategories}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      {/* Header */}
      <section ref={headerRef} className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-600 mb-6">
              <Link to="/" className="hover:text-indigo-600 transition-colors">Accueil</Link>
              <ChevronRightIcon className="inline h-4 w-4 mx-2" />
              <span className="text-gray-900 font-medium">Catégories</span>
            </nav>

            {/* Titre principal */}
            <div className="text-center mb-12">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isHeaderInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-full text-indigo-700 text-sm font-medium mb-6"
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                Explorez nos collections
                </motion.div>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Toutes nos <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Catégories</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez notre large sélection de produits organisés par catégories pour faciliter votre shopping
              </p>
        </div>

            {/* Barre de recherche et contrôles */}
            <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
              {/* Recherche */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Contrôles */}
              <div className="flex items-center space-x-3">
                {/* Bouton filtres */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative inline-flex items-center px-4 py-3 border rounded-xl font-medium transition-all duration-300 ${
                    showFilters || getActiveFiltersCount() > 0
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md'
                  }`}
                >
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Filtres
                  {getActiveFiltersCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>

                {/* Tri */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <option value="name">Nom A-Z</option>
                  <option value="products">Plus de produits</option>
                  <option value="recent">Plus récentes</option>
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

      {/* Statistiques */}
      <section ref={statsRef} className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { label: 'Catégories', value: mockStats.totalCategories, icon: FolderIcon, color: 'indigo' },
              { label: 'Produits', value: '1,200+', icon: TagIcon, color: 'green' },
              { label: 'Tendances', value: mockStats.featuredCategories, icon: ChartBarIcon, color: 'orange' },
              { label: 'Nouveautés', value: mockStats.newThisMonth, icon: FireIcon, color: 'red' }
            ].map((stat, index) => (
            <motion.div 
                key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
                animate={isStatsInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-xl mb-4`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contenu principal */}
      <section ref={categoriesRef} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucune catégorie trouvée</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? `Aucune catégorie ne correspond à "${searchTerm}"`
                  : 'Aucune catégorie disponible pour le moment'
                }
              </p>
                {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Effacer la recherche
                </button>
              )}
            </motion.div>
          ) : (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isCategoriesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' 
                  : 'grid-cols-1 max-w-4xl mx-auto'
              }`}
            >
              {filteredCategories.map((category, index) => (
          <motion.div
            key={category.id}
                  initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
                  animate={isCategoriesInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.8, rotateY: -20 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                  whileHover={{ y: -10, scale: 1.05 }}
          >
            <Link
              to={`/products?category=${category.id}`}
                    className={`block relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 ${
                      viewMode === 'list' ? 'flex items-center p-6' : 'aspect-square p-6'
                    }`}
                  >
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Contenu */}
                    <div className={`relative z-10 h-full flex ${viewMode === 'list' ? 'items-center' : 'flex-col items-center justify-center'} text-center`}>
                      {/* Image ou icône */}
                      <div className={`${viewMode === 'list' ? 'w-16 h-16 mr-6' : 'mb-4'} flex-shrink-0`}>
                  {category.image_url ? (
                          <OptimizedImage
                      src={category.image_url}
                      alt={category.name}
                            className={`w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-300`}
                            fallbackSrc="/placeholder-product.svg"
                    />
                  ) : (
                          <div className={`${viewMode === 'list' ? 'text-4xl' : 'text-6xl'} group-hover:scale-125 transition-transform duration-300 filter drop-shadow-sm`}>
                            {getIconForCategory(category.name)}
                    </div>
                  )}
                      </div>
                      
                      {/* Texte */}
                      <div className={`${viewMode === 'list' ? 'flex-1 text-left' : ''}`}>
                        <h3 className={`font-bold text-gray-900 group-hover:text-indigo-600 transition-colors ${
                          viewMode === 'list' ? 'text-xl mb-2' : 'text-sm md:text-base mb-2'
                        }`}>
                    {category.name}
                  </h3>
                      
                        {category.description && viewMode === 'list' && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {category.description}
                    </p>
                  )}
                      
                        {/* Badges */}
                        <div className={`flex ${viewMode === 'list' ? 'justify-start' : 'justify-center'} items-center space-x-2`}>
                          <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
                            {Math.floor(Math.random() * 50) + 10}+ produits
                          </span>
                          {Math.random() > 0.7 && (
                            <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                              <FireIcon className="inline w-3 h-3 mr-1" />
                              Tendance
                            </span>
                          )}
                  </div>
                        
                        {viewMode === 'list' && (
                          <div className="flex items-center text-indigo-600 text-sm font-medium mt-3 group-hover:translate-x-2 transition-transform duration-300">
                            Voir les produits
                            <ArrowRightIcon className="w-4 h-4 ml-1" />
                          </div>
                        )}
                </div>
              </div>

                    {/* Effet de brillance */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl"></div>
            </Link>
          </motion.div>
        ))}
            </motion.div>
          )}

          {/* CTA */}
        {filteredCategories.length > 0 && (
          <motion.div 
              className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
              animate={isCategoriesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 1, delay: 0.5 }}
                >
                  <Link 
                    to="/products" 
                className="group inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105"
                  >
                <StarIcon className="w-6 h-6 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Découvrir Tous les Produits
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Categories