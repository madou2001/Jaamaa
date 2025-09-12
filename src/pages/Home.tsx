import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { 
  ArrowRightIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  CurrencyEuroIcon,
  HeartIcon,
  ShoppingCartIcon,
  SparklesIcon,
  BoltIcon,
  GiftIcon,
  UsersIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolidIcon 
} from '@heroicons/react/24/solid'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/useToast'
import { useLocalCart } from '../hooks/useLocalCart'
import { useWishlist } from '../hooks/useWishlist'
import ToastContainer from '../components/UI/Toast'

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [stats, setStats] = useState({
    totalProducts: 1250,
    totalCategories: 15,
    featuredProducts: 25,
    happyCustomers: 12500,
    orderDelivered: 98500,
    averageRating: 4.8
  })
  
  const { toasts, removeToast, success, error } = useToast()
  const { addToCart: addToLocalCart, isInCart } = useLocalCart()
  const { addToWishlist, isInWishlist } = useWishlist()

  // Refs pour les animations
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)

  // Scroll parallax
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  // InView animations
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" })
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const isCategoriesInView = useInView(categoriesRef, { once: true, margin: "-100px" })
  const isProductsInView = useInView(productsRef, { once: true, margin: "-100px" })

  // Données statiques pour l'interface
  const features = [
    {
      icon: TruckIcon,
      title: 'Livraison Express',
      description: 'Livraison en 24h dans toute la France',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Garantie Premium',
      description: '2 ans de garantie sur tous nos produits',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: CurrencyEuroIcon,
      title: 'Meilleurs Prix',
      description: 'Prix compétitifs garantis toute l\'année',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: StarIcon,
      title: 'Service VIP',
      description: 'Support client premium 24h/24',
      color: 'from-purple-500 to-pink-500'
    }
  ]


  const categoryIcons = ['🛍️', '📱', '👕', '🏠', '⚽', '📚', '🎮', '💄', '🍳', '🎸', '🚗', '🌱']

  useEffect(() => {
    fetchHomeData()
  }, [])


  const fetchHomeData = async () => {
    try {
      console.log('🏠 Chargement des données d\'accueil...')
      setLoading(true)

      // Charger les produits vedettes
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('featured', true)
        .eq('status', 'active')
        .limit(8)

      if (productsError) {
        console.error('❌ Erreur produits vedettes:', productsError)
      } else {
        console.log('✅ Produits vedettes chargés:', productsData?.length)
        setFeaturedProducts(productsData || [])
      }

      // Charger les catégories principales
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name')
        .limit(12)

      if (categoriesError) {
        console.error('❌ Erreur catégories:', categoriesError)
      } else {
        console.log('✅ Catégories chargées:', categoriesData?.length)
        setCategories(categoriesData || [])
      }

      // Statistiques dynamiques
      const [
        { count: totalProducts },
        { count: totalCategories },
        { count: featuredCount }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('featured', true).eq('status', 'active')
      ])

      setStats(prev => ({
        ...prev,
        totalProducts: totalProducts || prev.totalProducts,
        totalCategories: totalCategories || prev.totalCategories,
        featuredProducts: featuredCount || prev.featuredProducts
      }))

    } catch (err) {
      console.error('💥 Erreur dans fetchHomeData:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const addToCart = async (productId: string) => {
    try {
      setAddingToCart(productId)
      console.log('🛒 Ajout au panier:', productId)

      const product = featuredProducts.find(p => p.id === productId)
      if (!product) {
        error('Erreur', 'Produit introuvable')
        return
      }

      await addToLocalCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url
      })

      success('Produit ajouté !', `${product.name} a été ajouté à votre panier`)
      console.log(`✅ ${product.name} ajouté au panier !`)

    } catch (err) {
      console.error('❌ Erreur ajout panier:', err)
      error('Erreur', 'Impossible d\'ajouter le produit au panier')
    } finally {
      setAddingToCart(null)
    }
  }

  const addToFavorites = async (productId: string) => {
    try {
      console.log('❤️ Ajout aux favoris:', productId)
      
      const product = featuredProducts.find(p => p.id === productId)
      if (product) {
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url
        })
        success('Ajouté aux favoris !', `${product.name} a été ajouté à vos favoris`)
        console.log(`❤️ ${product.name} ajouté aux favoris !`)
      }
    } catch (err) {
      console.error('❌ Erreur ajout favoris:', err)
      error('Erreur', 'Impossible d\'ajouter aux favoris')
    }
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* HERO SECTION CINÉMATOGRAPHIQUE */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with Parallax */}
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-purple-900"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255,255,255,0.05) 2px, transparent 2px)',
              backgroundSize: '50px 50px'
            }}></div>
          </div>
        </motion.div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              animate={{
                y: [-20, -100],
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

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                L'Excellence
              </span>
              <br />
              <span className="text-white">E-Commerce</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Découvrez une expérience d'achat révolutionnaire avec nos produits premium, 
              notre service client exceptionnel et notre technologie de pointe.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <Link
                to="/products"
                className="group relative inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-500 to-blue-600 rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover-lift"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  <SparklesIcon className="w-6 h-6 mr-2" />
                  Explorer la Collection
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <button 
                onClick={() => setIsVideoPlaying(true)}
                className="group inline-flex items-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover-lift"
              >
                <PlayIcon className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                Voir la Démo
              </button>
            </motion.div>

            {/* Stats en live */}
            <motion.div
              ref={statsRef}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              {[
                { value: stats.totalProducts, label: 'Produits', icon: '📦' },
                { value: stats.happyCustomers, label: 'Clients Satisfaits', icon: '😊' },
                { value: stats.orderDelivered, label: 'Commandes Livrées', icon: '🚀' },
                { value: stats.averageRating, label: 'Note Moyenne', icon: '⭐', decimal: true }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center glass p-6 rounded-2xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isStatsInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <motion.div 
                    className="text-2xl md:text-3xl font-bold text-white mb-1"
                    initial={{ opacity: 0 }}
                    animate={isStatsInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 2, delay: 1 + index * 0.1 }}
                  >
                    {stat.decimal ? stat.value : stat.value.toLocaleString()}
                    {stat.decimal && <span className="text-yellow-300">/5</span>}
                  </motion.div>
                  <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
            </motion.div>
          </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-3 bg-white rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
        </div>
        </motion.div>
      </section>


      {/* FEATURES SECTION PREMIUM */}
      <section ref={featuresRef} className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Pourquoi Nous Choisir ?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une expérience e-commerce révolutionnaire qui dépasse toutes vos attentes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group"
              >
                <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 overflow-hidden">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                  <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                  {/* Hover effect border */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-200 rounded-3xl transition-colors duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION INTERACTIVE 3D */}
      <section ref={categoriesRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={isCategoriesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Explorez Nos <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Catégories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des produits soigneusement sélectionnés dans chaque catégorie pour vous offrir le meilleur
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-2xl smooth-loading"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.8, rotateY: -45 }}
                  animate={isCategoriesInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.8, rotateY: -45 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group perspective-1000"
                >
                  <Link
                    to={`/products?category=${category.id}`}
                    className="block relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3 transform-gpu preserve-3d"
                  >
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl transform scale-110"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                      <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">
                        {categoryIcons[index % categoryIcons.length]}
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors text-sm md:text-base">
                        {category.name}
                      </h3>
          </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={isCategoriesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Link
              to="/categories"
              className="group inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover-lift"
            >
              <SparklesIcon className="w-6 h-6 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Découvrir Toutes les Catégories
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION PREMIUM */}
      <section ref={productsRef} className="py-20 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={isProductsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Produits <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Vedettes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre sélection exclusive des produits les plus populaires et les mieux notés par nos clients
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-lg">
                  <div className="h-64 bg-gray-200 smooth-loading"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 smooth-loading"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 smooth-loading"></div>
                    <div className="h-8 bg-gray-200 rounded w-full smooth-loading"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isProductsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Image avec overlay effects */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.svg'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
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
                    </div>

                    {/* Featured badge avec animation */}
                    <div className="absolute top-4 left-4">
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
                    </div>

                    {/* Price tag */}
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm text-gray-900 font-bold px-3 py-2 rounded-xl shadow-lg">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category */}
                    {product.categories && (
                      <div className="text-sm text-primary-600 font-medium mb-2">
                        {product.categories.name}
                      </div>
                    )}

                    {/* Name */}
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="font-bold text-lg mb-3 hover:text-primary-600 transition-colors line-clamp-2 group-hover:text-primary-600">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating stars */}
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">(4.8)</span>
                    </div>

                    {/* Description */}
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Price et CTA */}
                    <div className="flex items-center justify-between">
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
                    </div>

                    {/* Add to cart button */}
                    <motion.button 
                      onClick={() => addToCart(product.id)}
                      disabled={addingToCart === product.id}
                      className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                        isInCart(product.id) 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
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
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Produits à venir</h3>
              <p className="text-gray-600">Nos produits vedettes arrivent bientôt !</p>
            </div>
          )}

          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isProductsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Link
              to="/products"
              className="group inline-flex items-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-primary-600 to-blue-600 rounded-full hover:shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 hover-lift"
            >
              <BoltIcon className="w-6 h-6 mr-3 group-hover:animate-pulse" />
              Découvrir Tous les Produits
              <ArrowRightIcon className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>


      {/* NEWSLETTER SECTION PREMIUM */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-blue-600 to-purple-700 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-white/5 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-6xl mb-6">📧</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Newsletter
          </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Restez informé de nos dernières nouveautés et actualités
          </p>

            {/* Newsletter form */}
            <div className="max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
            <input
              type="email"
                  placeholder="Votre adresse email VIP"
                  className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border-0 rounded-xl text-white placeholder-white/70 focus:outline-none focus:bg-white/20 transition-all duration-300"
                />
                <motion.button 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300 hover-lift whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <GiftIcon className="w-5 h-5 inline mr-2" />
                  Recevoir mon bonus
                </motion.button>
              </div>
              
              <p className="text-blue-200 text-sm mt-4">
                ✨ Pas de spam, que du premium. Désabonnement en 1 clic.
              </p>
            </div>

            {/* Trust indicators */}
            <div className="flex justify-center items-center space-x-8 mt-12 text-blue-200">
              <div className="flex items-center">
                <UsersIcon className="w-5 h-5 mr-2" />
                <span className="text-sm">+50K abonnés</span>
              </div>
              <div className="flex items-center">
                <StarIcon className="w-5 h-5 mr-2 text-yellow-400" />
                <span className="text-sm">4.9/5 satisfaction</span>
          </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Video Modal (placeholder) */}
      {isVideoPlaying && (
        <motion.div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsVideoPlaying(false)}
        >
          <motion.div 
            className="bg-white rounded-2xl p-8 max-w-2xl w-full"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4">🎬 Démo de notre plateforme</h3>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <PlayIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Vidéo de démonstration à venir</p>
              </div>
            </div>
            <button 
              onClick={() => setIsVideoPlaying(false)}
              className="w-full py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Home
