import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { 
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  CurrencyEuroIcon,
  HeartIcon,
  ShoppingCartIcon,
  SparklesIcon,
  BoltIcon,
  GiftIcon,
  PlayIcon,
  CheckBadgeIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  FireIcon,
  ChevronRightIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid'
import { supabase } from '../lib/supabase'
import { useLocalCart } from '../hooks/useLocalCart'
import { useWishlist } from '../hooks/useWishlist'
import { useOptimizedProducts } from '../hooks/useOptimizedProducts'
import { useOptimizedCategories } from '../hooks/useOptimizedCategories'
import OptimizedImage from '../components/UI/OptimizedImage'
import AnimatedCounter from '../components/UI/AnimatedCounter'
import { ProductsGridSkeleton } from '../components/UI/LoadingStates'
import { setSEO } from '../utils/seo'
import { optimizeImageUrl, preloadData } from '../utils/performance'
import { productsCache } from '../utils/cache'

const Home: React.FC = () => {
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [stats, setStats] = useState({
    totalProducts: 1250,
    totalCategories: 15,
    featuredProducts: 25,
    happyCustomers: 12500,
    orderDelivered: 98500,
    averageRating: 4.8
  })

  // Hooks optimisés
  const { 
    products: featuredProducts, 
    loading: productsLoading 
  } = useOptimizedProducts({ featured: true, limit: 8 })
  
  const { 
    categories, 
    loading: categoriesLoading 
  } = useOptimizedCategories()

  const loading = productsLoading || categoriesLoading
  
  const { addToCart: addToLocalCart, isInCart } = useLocalCart()
  const { addToWishlist, isInWishlist } = useWishlist()

  // Refs pour les animations
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const newsletterRef = useRef<HTMLDivElement>(null)

  // Scroll parallax
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  // InView animations
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" })
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const isCategoriesInView = useInView(categoriesRef, { once: true, margin: "-100px" })
  const isProductsInView = useInView(productsRef, { once: true, margin: "-100px" })
  const isTestimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" })
  const isNewsletterInView = useInView(newsletterRef, { once: true, margin: "-100px" })

  // Données pour l'interface
  const features = [
    {
      icon: TruckIcon,
      title: 'Livraison Express',
      description: 'Livraison gratuite en 24h partout en France',
      color: 'from-blue-500 to-cyan-500',
      highlight: 'Gratuite dès 50€'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Garantie Premium',
      description: '2 ans de garantie sur tous nos produits',
      color: 'from-green-500 to-emerald-500',
      highlight: 'Service après-vente'
    },
    {
      icon: CurrencyEuroIcon,
      title: 'Prix Imbattables',
      description: 'Meilleur rapport qualité-prix garanti',
      color: 'from-yellow-500 to-orange-500',
      highlight: 'Prix compétitifs'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Support 24/7',
      description: 'Une équipe dédiée à votre service',
      color: 'from-purple-500 to-pink-500',
      highlight: 'Réponse rapide'
    }
  ]

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Cliente fidèle',
      avatar: '👩‍💼',
      rating: 5,
      comment: 'Service exceptionnel ! Livraison ultra-rapide et produits de qualité. Je recommande vivement.',
      product: 'iPhone 15 Pro'
    },
    {
      name: 'Thomas Martin',
      role: 'Acheteur régulier',
      avatar: '👨‍💻',
      rating: 5,
      comment: 'Interface intuitive et prix compétitifs. Mon site e-commerce préféré depuis 2 ans.',
      product: 'MacBook Pro M3'
    },
    {
      name: 'Sophie Laurent',
      role: 'Nouvelle cliente',
      avatar: '👩‍🎨',
      rating: 5,
      comment: 'Première commande parfaite ! Support client réactif et produits conformes aux attentes.',
      product: 'iPad Air'
    }
  ]

  const categoryIcons = ['🛍️', '📱', '👕', '🏠', '⚽', '📚', '🎮', '💄', '🍳', '🎸', '🚗', '🌱']

  useEffect(() => {
    // Optimisation SEO pour la page d'accueil
    setSEO({
      title: 'Jaayma - E-commerce Premium | Shopping Moderne',
      description: 'Découvrez notre sélection exclusive de produits premium avec livraison express gratuite. Plus de 50 000 clients satisfaits nous font confiance.',
      keywords: 'e-commerce, shopping en ligne, produits premium, livraison gratuite, qualité, prix compétitifs',
      type: 'website'
    })

    // Préchargement intelligent des données
    preloadData(async () => {
      // Précharger les données des pages populaires
      const popularCategories = categories.slice(0, 3)
      for (const category of popularCategories) {
        const cacheKey = `products_category_${category.id}`
        if (!productsCache.has(cacheKey)) {
          supabase
        .from('products')
            .select('id, name, price, image_url')
            .eq('category_id', category.id)
        .eq('status', 'active')
            .limit(6)
            .then(({ data }) => {
              if (data) {
                productsCache.set(cacheKey, data)
              }
            }, () => {})
        }
      }
    }, () => categories.length > 0)
  }, [categories])

  // Charger les statistiques en arrière-plan
  useEffect(() => {
    const loadStats = async () => {
      try {
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
      }
    }

    // Charger les statistiques après un délai pour ne pas bloquer l'interface
    setTimeout(loadStats, 2000)
  }, [])

  // Mise à jour des statistiques avec les données réelles
  useEffect(() => {
    if (featuredProducts.length > 0 || categories.length > 0) {
      setStats(prev => ({
        ...prev,
        totalProducts: prev.totalProducts,
        totalCategories: categories.length || prev.totalCategories,
        featuredProducts: featuredProducts.length || prev.featuredProducts
      }))
    }
  }, [featuredProducts, categories])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const addToCart = async (productId: string) => {
    try {
      setAddingToCart(productId)
      const product = featuredProducts.find(p => p.id === productId)
      if (!product) {
        return
      }

      await addToLocalCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || undefined
      })

    } catch (err) {
    } finally {
      setAddingToCart(null)
    }
  }

  const addToFavorites = async (productId: string) => {
    try {
      const product = featuredProducts.find(p => p.id === productId)
      if (product) {
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url || undefined
        })
      }
    } catch (err) {
    }
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      setNewsletterEmail('')
    }
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* HERO SECTION MODERNE */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background avec dégradé animé */}
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.3),transparent_70%)]"></div>
        </motion.div>

        {/* Particules flottantes */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Contenu principal */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Badge tendance */}
            <motion.div 
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500/20 to-violet-500/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <FireIcon className="w-4 h-4 mr-2 text-orange-400" />
              ✨ Nouvelle collection automne disponible
            </motion.div>

            {/* Titre principal */}
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Shopping
              </span>
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Révolutionnaire
              </span>
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              className="text-xl md:text-2xl text-purple-100 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Découvrez une expérience d'achat unique avec nos produits premium, 
              notre service client exceptionnel et des prix imbattables.
            </motion.p>

            {/* Boutons d'action */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              <Link
                to="/products"
                className="group relative inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-pink-500 to-violet-600 rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/25 hover:scale-105"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  <SparklesIcon className="w-6 h-6 mr-2" />
                  Découvrir la Collection
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <button 
                onClick={() => setIsVideoPlaying(true)}
                className="group inline-flex items-center px-8 py-4 text-lg font-bold text-white border-2 border-white/30 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <PlayIcon className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                Voir la Démo
              </button>
            </motion.div>

            {/* Statistiques en temps réel */}
            <motion.div
              ref={statsRef}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              {[
                { value: stats.totalProducts, label: 'Produits', icon: '📦', suffix: '+' },
                { value: stats.happyCustomers, label: 'Clients Satisfaits', icon: '😊', suffix: '+' },
                { value: stats.orderDelivered, label: 'Commandes Livrées', icon: '🚀', suffix: '+' },
                { value: stats.averageRating, label: 'Note Moyenne', icon: '⭐', decimal: true, suffix: '/5' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl hover:bg-white/15 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isStatsInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                    <AnimatedCounter
                      end={stat.value}
                      decimals={stat.decimal}
                      suffix={stat.suffix}
                      startAnimation={isStatsInView}
                      duration={2.5}
                    />
                  </div>
                  <div className="text-purple-200 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
            </motion.div>
          </div>

        {/* Indicateur de scroll */}
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

      {/* SECTION AVANTAGES */}
      <section ref={featuresRef} className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
                className="group relative"
                whileHover={{ y: -10 }}
              >
                <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
                  {/* Gradient de fond */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  {/* Icône */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                </div>
                  
                  {/* Badge */}
                  <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs font-semibold rounded-full mb-4">
                    <CheckBadgeIcon className="w-3 h-3 mr-1" />
                    {feature.highlight}
                  </div>
                  
                  {/* Contenu */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>
                  <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION CATÉGORIES */}
      <section ref={categoriesRef} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={isCategoriesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Explorez Nos <span className="bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">Catégories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des produits soigneusement sélectionnés dans chaque catégorie pour vous offrir le meilleur
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-3xl animate-pulse"></div>
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
                  className="group"
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                >
                  <Link
                    to={`/products?category=${category.id}`}
                    className="block relative aspect-square bg-gradient-to-br from-gray-50 to-indigo-50/50 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
                  >
                    {/* Effet de fond */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Contenu */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                      <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300 filter drop-shadow-sm">
                        {categoryIcons[index % categoryIcons.length]}
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-sm md:text-base">
                        {category.name}
                      </h3>
          </div>

                    {/* Effet de brillance */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl"></div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isCategoriesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Link
              to="/categories"
              className="group inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-full hover:shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105"
            >
              <SparklesIcon className="w-6 h-6 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Découvrir Toutes les Catégories
              <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION PRODUITS VEDETTES */}
      <section ref={productsRef} className="py-24 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={isProductsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Produits <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Vedettes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre sélection exclusive des produits les plus populaires et les mieux notés
            </p>
          </motion.div>

          {loading ? (
            <ProductsGridSkeleton count={8} viewMode="grid" />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isProductsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  {/* Image avec overlay */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    {product.image_url ? (
                        <OptimizedImage
                          src={optimizeImageUrl(product.image_url, 300, 300)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          fallbackSrc="/placeholder-product.svg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        📷
                      </div>
                    )}
                    
                    {/* Overlay sombre */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Actions overlay */}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                      <motion.button 
                        onClick={() => addToFavorites(product.id)}
                        className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
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
                        className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                          isInCart(product.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-indigo-500 hover:text-white'
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

                    {/* Badge vedette */}
                    <div className="absolute top-4 left-4">
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
                    </div>

                    {/* Prix en overlay */}
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm text-gray-900 font-bold px-3 py-2 rounded-xl shadow-lg">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    {/* Catégorie */}
                    {product.categories && (
                      <div className="text-sm text-indigo-600 font-medium mb-2">
                        {product.categories.name}
                      </div>
                    )}

                    {/* Nom */}
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="font-bold text-lg mb-3 hover:text-indigo-600 transition-colors line-clamp-2 group-hover:text-indigo-600">
                        {product.name}
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

                    {/* Prix et action */}
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
                    </div>

                    {/* Bouton d'ajout au panier */}
                    <motion.button 
                      onClick={() => addToCart(product.id)}
                      disabled={addingToCart === product.id}
                      className={`w-full py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
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
              className="group inline-flex items-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105"
            >
              <BoltIcon className="w-6 h-6 mr-3 group-hover:animate-pulse" />
              Découvrir Tous les Produits
              <ArrowRightIcon className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION TÉMOIGNAGES */}
      <section ref={testimonialsRef} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={isTestimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Ce Que Disent Nos <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Clients</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Plus de 50 000 clients satisfaits nous font confiance chaque jour
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50 }}
                animate={isTestimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Étoiles */}
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>

                {/* Commentaire */}
                <p className="text-gray-700 mb-6 leading-relaxed font-medium">
                  "{testimonial.comment}"
                </p>

                {/* Produit acheté */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 mb-6">
                  <div className="flex items-center">
                    <ShoppingCartIcon className="w-5 h-5 text-indigo-600 mr-2" />
                    <span className="text-sm text-indigo-700 font-medium">
                      Produit acheté: {testimonial.product}
                    </span>
                  </div>
                </div>

                {/* Profil client */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION NEWSLETTER */}
      <section ref={newsletterRef} className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 relative overflow-hidden">
        {/* Éléments de fond animés */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-white/5 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 15 + 10,
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
            animate={isNewsletterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            <div className="text-6xl mb-8">📧</div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Restez Connecté
          </h2>
            <p className="text-xl text-purple-100 mb-12 max-w-3xl mx-auto">
              Recevez en avant-première nos nouveautés, offres exclusives et conseils personnalisés
          </p>

            {/* Formulaire newsletter */}
            <form onSubmit={handleNewsletterSubmit} className="max-w-lg mx-auto mb-12">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
            <input
              type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border-0 rounded-xl text-white placeholder-white/70 focus:outline-none focus:bg-white/20 transition-all duration-300"
                  required
                />
                <motion.button 
                  type="submit"
                  className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300 whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <GiftIcon className="w-5 h-5 inline mr-2" />
                  S'abonner
                </motion.button>
              </div>
            </form>

            {/* Avantages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center">
                <NewspaperIcon className="w-6 h-6 text-purple-200 mr-3" />
                <span className="text-purple-200">Actualités exclusives</span>
            </div>
              <div className="flex items-center justify-center">
                <GiftIcon className="w-6 h-6 text-purple-200 mr-3" />
                <span className="text-purple-200">Offres privilégiées</span>
              </div>
              <div className="flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-purple-200 mr-3" />
                <span className="text-purple-200">Accès anticipé</span>
          </div>
            </div>

            {/* Garantie */}
            <p className="text-purple-200 text-sm mt-8">
              ✨ Aucun spam, désinscription en un clic. Vos données sont protégées.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Toast Notifications */}

      {/* Modal Vidéo */}
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
            <h3 className="text-2xl font-bold mb-4">🎬 Découvrez Notre Plateforme</h3>
            <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <PlayIcon className="w-16 h-16 text-indigo-400 mx-auto mb-2" />
                <p className="text-indigo-600 font-medium">Vidéo de démonstration à venir</p>
              </div>
            </div>
            <button 
              onClick={() => setIsVideoPlaying(false)}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-600 hover:to-purple-700 transition-colors"
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
