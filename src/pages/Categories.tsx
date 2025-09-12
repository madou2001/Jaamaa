import React, { useRef, useState } from 'react'
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
  FunnelIcon
} from '@heroicons/react/24/outline'
import { useCategories } from '../hooks/useCategories'

const Categories: React.FC = () => {
  const { categories, loading } = useCategories()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'products'>('name')

  // Animation refs
  const headerRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)

  // InView animations
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })
  const isCategoriesInView = useInView(categoriesRef, { once: true, margin: "-100px" })

  // Filter and sort categories
  const filteredCategories = categories
    .filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      // Pour products, on simule un nombre (dans un vrai projet, on aurait cette donnée)
      return Math.random() - 0.5
    })

  // Icônes par catégorie (simulées)
  const categoryIcons = ['🛍️', '📱', '👕', '🏠', '⚽', '📚', '🎮', '💄', '🍳', '🎸', '🚗', '🌱', '🎭', '💎', '🎨', '🔧']

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-1/3 mx-auto mb-6 smooth-loading"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-2/3 mx-auto smooth-loading"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 12 }).map((_, index) => (
              <motion.div 
                key={index} 
                className="glass rounded-3xl overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 smooth-loading"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 smooth-loading"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full smooth-loading"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3 smooth-loading"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* HERO HEADER CINÉMATOGRAPHIQUE */}
      <section className="relative py-20 overflow-hidden">
        {/* Background with animated elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-blue-600/5 to-purple-600/10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)',
          }}></div>
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary-400 rounded-full opacity-30"
              animate={{
                y: [-20, -80],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div ref={headerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Nos Catégories
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Explorez notre univers organisé en catégories soigneusement définies 
              pour faciliter votre navigation et vos découvertes
            </motion.p>

            {/* Quick stats */}
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-8 mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              {[
                { icon: '📂', value: categories.length, label: 'Catégories' },
                { icon: '🛍️', value: '500+', label: 'Produits' },
                { icon: '🎯', value: '100%', label: 'Qualité' }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center glass p-6 rounded-2xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isHeaderInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* CONTROLS PREMIUM */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Search & Filter */}
            <div className="flex items-center space-x-4 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une catégorie..."
                  className="w-full px-5 py-4 pl-12 glass border-2 border-gray-200 rounded-2xl font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all duration-300"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-4 top-4" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'products')}
                  className="glass px-5 py-4 rounded-2xl font-semibold text-gray-700 border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all duration-300 cursor-pointer"
                >
                  <option value="name">🔤 Par nom</option>
                  <option value="products">📊 Par popularité</option>
                </select>
              </div>
            </div>

            {/* View Mode */}
            <div className="glass rounded-2xl p-1 flex">
              <motion.button
                onClick={() => setViewMode('grid')}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
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
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
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

          {/* Filter results info */}
          {searchTerm && (
            <motion.div 
              className="mt-6 glass px-6 py-3 rounded-2xl inline-flex items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <FunnelIcon className="h-5 w-5 text-primary-500 mr-2" />
              <span className="text-gray-700">
                {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''} trouvée{filteredCategories.length > 1 ? 's' : ''} 
                {searchTerm && (
                  <span className="font-semibold"> pour "{searchTerm}"</span>
                )}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* CATEGORIES GRID/LIST PREMIUM */}
        <motion.div 
          ref={categoriesRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isCategoriesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          {filteredCategories.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' 
                : 'space-y-6'
            }>
              {filteredCategories.map((category, index) => (
          <motion.div
            key={category.id}
                  initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
          >
            <Link
              to={`/products?category=${category.id}`}
                    className={`block glass rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Image/Icon */}
                    <div className={`relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden ${
                      viewMode === 'list' ? 'w-48 h-32' : 'h-48'
                    }`}>
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <motion.div
                            className="text-6xl"
                            whileHover={{ 
                              scale: 1.2,
                              rotate: [0, 10, -10, 0]
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            {categoryIcons[index % categoryIcons.length]}
                          </motion.div>
                        </div>
                      )}
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Category count badge */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur-sm text-gray-900 font-bold px-3 py-1 rounded-xl shadow-lg text-sm">
                          {Math.floor(Math.random() * 50) + 10} produits
                        </div>
                      </div>

                      {/* Featured badge (pour certaines catégories) */}
                      {index < 3 && (
                        <div className="absolute top-4 left-4">
                          <motion.div 
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                            animate={{ 
                              scale: [1, 1.05, 1],
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          >
                            ⭐ POPULAIRE
                          </motion.div>
                    </div>
                  )}
                </div>

                    {/* Content */}
                    <div className="p-8 flex-1">
                      <div className="flex items-center mb-3">
                        <TagIcon className="h-5 w-5 text-primary-500 mr-2" />
                        <span className="text-sm text-primary-600 font-semibold">Catégorie</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                      
                  {category.description && (
                        <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-primary-600 font-bold group-hover:text-primary-700 transition-colors">
                          <SparklesIcon className="h-5 w-5 mr-2" />
                          <span>Découvrir</span>
                  </div>
                        
                        <motion.div
                          className="bg-gradient-to-r from-primary-500 to-blue-500 p-3 rounded-full text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
                          whileHover={{ scale: 1.1, rotate: 45 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ArrowRightIcon className="h-5 w-5" />
                        </motion.div>
                </div>
              </div>
            </Link>
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
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Aucune catégorie trouvée</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {searchTerm 
                    ? `Aucune catégorie ne correspond à "${searchTerm}"`
                    : "Les catégories seront bientôt disponibles."
                  }
                </p>
                {searchTerm && (
                  <motion.button
                    onClick={() => setSearchTerm('')}
                    className="bg-gradient-to-r from-primary-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✨ Voir toutes les catégories
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* CTA Section */}
        {filteredCategories.length > 0 && (
          <motion.div 
            className="text-center mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="glass rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Vous ne trouvez pas ce que vous cherchez ?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Explorez tous nos produits ou contactez notre équipe pour des recommandations personnalisées
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/products" 
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-blue-600 text-white text-lg font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 hover-lift"
                  >
                    <FolderIcon className="h-6 w-6 mr-3" />
                    Voir tous les produits
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/contact" 
                    className="inline-flex items-center px-8 py-4 glass text-gray-700 text-lg font-semibold rounded-2xl hover:bg-white transition-all duration-300 border-2 border-gray-200 hover:border-gray-300"
                  >
                    💬 Nous contacter
                  </Link>
                </motion.div>
          </div>
        </div>
          </motion.div>
      )}
      </div>
    </div>
  )
}

export default Categories
