import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { 
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  PhoneIcon,
  HeartIcon,
  ShoppingCartIcon,
  SparklesIcon,
  GiftIcon,
  CheckBadgeIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  PlayIcon,
  ChevronRightIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  HomeIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
  ShieldCheckIcon as ShieldSolidIcon
} from '@heroicons/react/24/solid'
import { useToast } from '../hooks/useToast'
import { useLocalCart } from '../hooks/useLocalCart'
import { useWishlist } from '../hooks/useWishlist'
import { useOptimizedProducts } from '../hooks/useOptimizedProducts'
import { useOptimizedCategories } from '../hooks/useOptimizedCategories'
import OptimizedImage from '../components/UI/OptimizedImage'
import AnimatedCounter from '../components/UI/AnimatedCounter'
import { ProductsGridSkeleton } from '../components/UI/LoadingStates'

const HomeModern: React.FC = () => {
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [newsletterEmail, setNewsletterEmail] = useState('')

  // Hooks optimisés
  const { 
    products: featuredProducts, 
    loading: productsLoading 
  } = useOptimizedProducts({ featured: true, limit: 12 })
  
  const { 
    categories, 
    loading: categoriesLoading 
  } = useOptimizedCategories()

  const { success, error } = useToast()
  const { addToCart: addToLocalCart, isInCart } = useLocalCart()
  const { addToWishlist, isInWishlist } = useWishlist()

  // Animation refs
  const heroRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)

  // InView animations
  const isCategoriesInView = useInView(categoriesRef, { once: true })
  const isProductsInView = useInView(productsRef, { once: true })
  const isFeaturesInView = useInView(featuresRef, { once: true })
  const isTestimonialsInView = useInView(testimonialsRef, { once: true })

  // Hero slides data
  const heroSlides = [
    {
      id: 1,
      title: "Les Dernières Innovations Tech",
      subtitle: "Découvrez notre collection exclusive 2025",
      description: "MacBook Air M3, iPhone 15 Pro, AirPods Pro 2 et bien plus encore",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop",
      cta: "Découvrir",
      link: "/products?category=electronique",
      badge: "Nouveau"
    },
    {
      id: 2,
      title: "Mode & Style",
      subtitle: "Votre garde-robe idéale vous attend",
      description: "Des basiques intemporels aux pièces tendance, trouvez votre style unique",
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=800&fit=crop",
      cta: "Shop Mode",
      link: "/products?category=mode-vetements",
      badge: "Trending"
    },
    {
      id: 3,
      title: "Maison Design",
      subtitle: "Transformez votre espace",
      description: "Mobilier scandinave, électroménager premium et décoration moderne",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop",
      cta: "Aménager",
      link: "/products?category=maison-decoration",
      badge: "Design"
    }
  ]

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  const handleAddToCart = async (product: any) => {
    try {
      setAddingToCart(product.id)
      await addToLocalCart(product, 1)
      success('Produit ajouté au panier !')
    } catch (err) {
      error('Erreur lors de l\'ajout au panier')
    } finally {
      setAddingToCart(null)
    }
  }

  const handleWishlistToggle = async (product: any) => {
    try {
      await addToWishlist(product)
      success('Produit ajouté à la wishlist !')
    } catch (err) {
      error('Erreur lors de l\'ajout à la wishlist')
    }
  }

  const mainCategories = categories?.slice(0, 5) || []

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION - Ultra Premium */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <motion.img
            key={currentSlide}
            src={heroSlides[currentSlide].image}
            alt={heroSlides[currentSlide].title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>

        {/* Effet de particules premium */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              animate={{
                y: [0, -100],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 6 + 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <motion.div 
                  className="flex items-center space-x-4 mb-8"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {heroSlides[currentSlide].badge}
                  </div>
                  <div className="h-1 w-1 bg-white/60 rounded-full"></div>
                  <span className="text-white/90 text-sm font-medium tracking-wide">Collection 2025</span>
                </motion.div>

                <motion.h1 
                  className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {heroSlides[currentSlide].title}
                </motion.h1>

                <motion.h2 
                  className="text-2xl md:text-3xl text-white/95 font-light mb-6 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  {heroSlides[currentSlide].subtitle}
                </motion.h2>

                <motion.p 
                  className="text-lg md:text-xl text-white/85 max-w-xl leading-relaxed mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  {heroSlides[currentSlide].description}
                </motion.p>

                <motion.div 
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  <Link
                    to={heroSlides[currentSlide].link}
                    className="group relative bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 inline-flex items-center justify-center transform hover:scale-105 hover:shadow-2xl"
                  >
                    <span className="relative z-10">{heroSlides[currentSlide].cta}</span>
                    <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
                  </Link>
                  <Link
                    to="/products"
                    className="group relative bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300 inline-flex items-center justify-center transform hover:scale-105"
                  >
                    <span className="relative z-10">Voir tout</span>
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Slide indicators premium */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`group relative transition-all duration-300 ${
                index === currentSlide ? 'w-8 h-2' : 'w-2 h-2'
              }`}
            >
              <div className={`w-full h-full rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white shadow-lg shadow-white/30' 
                  : 'bg-white/40 group-hover:bg-white/60'
              }`}></div>
              {index === currentSlide && (
                <motion.div
                  className="absolute inset-0 bg-white rounded-full"
                  layoutId="activeSlide"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>
      </section>


      {/* CATÉGORIES - Grille moderne */}
      <section ref={categoriesRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isCategoriesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Shop par Catégorie
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez notre sélection organisée pour vous faire gagner du temps
            </p>
          </motion.div>

           <div className="flex justify-center">
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-6xl">
               {mainCategories.map((category, index) => (
                 <motion.div
                   key={category.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={isCategoriesInView ? { opacity: 1, y: 0 } : {}}
                   transition={{ duration: 0.6, delay: index * 0.1 }}
                   className="flex flex-col items-center"
                 >
                   <Link
                     to={`/products?category=${category.id}`}
                     className="group block w-full"
                   >
                     <div className="aspect-square rounded-3xl overflow-hidden mb-4 relative shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 bg-white border border-gray-100">
                       {/* Image de la catégorie */}
                       {category.image_url ? (
                         <OptimizedImage
                           src={category.image_url}
                           alt={category.name}
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                           {category.slug === 'electronique' && <DevicePhoneMobileIcon className="h-16 w-16 text-blue-600" />}
                           {category.slug === 'mode-vetements' && <UserGroupIcon className="h-16 w-16 text-pink-600" />}
                           {category.slug === 'sport-loisirs' && <StarIcon className="h-16 w-16 text-green-600" />}
                           {category.slug === 'maison-decoration' && <HomeIcon className="h-16 w-16 text-orange-600" />}
                           {category.slug === 'beaute-sante' && <SparklesIcon className="h-16 w-16 text-purple-600" />}
                           {!['electronique', 'mode-vetements', 'sport-loisirs', 'maison-decoration', 'beaute-sante'].includes(category.slug) && 
                             <Bars3Icon className="h-16 w-16 text-gray-600" />
                           }
                         </div>
                       )}
                       
                       {/* Overlay gradient */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                       
                       {/* Titre sur l'image au hover */}
                       <div className="absolute inset-0 flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <span className="text-white font-bold text-sm bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                           Découvrir
                         </span>
                       </div>
                     </div>
                     
                     <h3 className="font-bold text-lg text-gray-900 text-center group-hover:text-gray-700 transition-colors leading-tight">
                       {category.name}
                     </h3>
                   </Link>
                 </motion.div>
               ))}
             </div>
           </div>
        </div>
      </section>

      {/* PRODUITS VEDETTES - Style Apple Store */}
      <section ref={productsRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isProductsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-end mb-12"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Nos Coups de Cœur
              </h2>
              <p className="text-xl text-gray-600">
                Sélectionnés avec soin par notre équipe
              </p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center text-gray-900 font-semibold hover:text-gray-600 transition-colors group"
            >
              Voir tout
              <ChevronRightIcon className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {productsLoading ? (
            <ProductsGridSkeleton count={8} />
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {featuredProducts?.slice(0, 8).map((product, index) => (
                 <motion.div
                   key={product.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={isProductsInView ? { opacity: 1, y: 0 } : {}}
                   transition={{ duration: 0.6, delay: index * 0.1 }}
                   className="group h-full"
                 >
                   <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 border border-gray-100 hover:border-gray-200 h-full flex flex-col">
                     <div className="aspect-square overflow-hidden relative">
                       <OptimizedImage
                         src={product.image_url || '/placeholder-product.svg'}
                         alt={product.name}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                     </div>
                     
                     {/* Badge premium */}
                     {product.compare_price && product.compare_price > product.price && (
                       <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                         -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                       </div>
                     )}
                     
                     {/* Actions rapides */}
                     <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                       <button
                         onClick={() => handleWishlistToggle(product)}
                         className="bg-white/95 backdrop-blur-md p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-white/50"
                       >
                         {isInWishlist(product.id) ? (
                           <HeartSolidIcon className="h-5 w-5 text-red-500" />
                         ) : (
                           <HeartIcon className="h-5 w-5 text-gray-700 hover:text-red-500 transition-colors" />
                         )}
                       </button>
                     </div>

                     <div className="p-6 flex flex-col flex-grow">
                       <Link to={`/products/${product.slug}`} className="block mb-4">
                         <h3 className="font-bold text-lg text-gray-900 group-hover:text-gray-700 transition-colors leading-tight min-h-[3.5rem] flex items-start">
                           <span className="line-clamp-2">
                             {product.name}
                           </span>
                         </h3>
                       </Link>
                       
                       {/* Rating stars */}
                       <div className="flex items-center space-x-2 mb-4">
                         <div className="flex items-center space-x-1">
                           {[...Array(5)].map((_, i) => (
                             <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
                           ))}
                         </div>
                         <span className="text-sm text-gray-600">(4.8)</span>
                       </div>
                       
                       <div className="flex flex-col space-y-4 mt-auto">
                         <div className="flex items-center justify-between">
                           <div className="flex items-baseline space-x-2">
                             <span className="text-2xl font-black text-gray-900">
                               {product.price.toFixed(2)}€
                             </span>
                             {product.compare_price && product.compare_price > product.price && (
                               <span className="text-lg text-gray-400 line-through font-medium">
                                 {product.compare_price.toFixed(2)}€
                               </span>
                             )}
                           </div>
                           {product.compare_price && product.compare_price > product.price && (
                             <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                               -{(((product.compare_price - product.price) / product.compare_price) * 100).toFixed(0)}%
                             </span>
                           )}
                         </div>

                         <button
                           onClick={() => handleAddToCart(product)}
                           disabled={addingToCart === product.id}
                           className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-2xl font-bold hover:from-gray-800 hover:to-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group transform hover:scale-[1.02] hover:shadow-lg"
                         >
                           {addingToCart === product.id ? (
                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                           ) : (
                             <>
                               <ShoppingCartIcon className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                               <span>Ajouter au panier</span>
                             </>
                           )}
                         </button>
                       </div>
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors group"
            >
              Découvrir tous nos produits
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES - Garanties et services */}
      <section ref={featuresRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une expérience d'achat pensée pour votre satisfaction
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: TruckIcon,
                title: "Livraison rapide",
                description: "Livraison gratuite dès 50€ d'achat. Express en 24h disponible.",
                color: "bg-blue-100 text-blue-600"
              },
              {
                icon: ShieldCheckIcon,
                title: "Garantie premium",
                description: "2 ans de garantie sur tous nos produits. SAV réactif 7j/7.",
                color: "bg-green-100 text-green-600"
              },
              {
                icon: CreditCardIcon,
                title: "Paiement sécurisé",
                description: "Transactions 100% sécurisées. Plusieurs moyens de paiement.",
                color: "bg-purple-100 text-purple-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES - Social proof */}
      <section ref={testimonialsRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isTestimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <div className="flex items-center justify-center space-x-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <StarSolidIcon key={i} className="h-6 w-6 text-yellow-400" />
              ))}
              <span className="text-xl font-semibold text-gray-900 ml-2">4.8/5</span>
            </div>
            <p className="text-gray-600">
              Plus de 12,500 clients satisfaits
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Marie Dubois",
                role: "Cliente fidèle",
                content: "Service exceptionnel ! Livraison rapide et produits de qualité. Je recommande vivement Jaayma.",
                rating: 5,
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b567?w=100&h=100&fit=crop&crop=face"
              },
              {
                name: "Thomas Martin",
                role: "Acheteur tech",
                content: "Interface moderne, prix compétitifs. Mon go-to pour tous mes achats électroniques.",
                rating: 5,
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              },
              {
                name: "Sophie Laurent",
                role: "Passionnée mode",
                content: "Sélection de produits au top ! Équipe support très réactive. Parfait pour mes achats mode.",
                rating: 5,
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isTestimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-sm"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER - Ultra Premium */}
      <section className="relative py-24 overflow-hidden">
        {/* Background avec dégradé complexe */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.2),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05),transparent_70%)]"></div>
        
        {/* Particules flottantes subtiles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              animate={{
                y: [0, -50],
                opacity: [0, 0.4, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 8 + 5,
                repeat: Infinity,
                delay: Math.random() * 8,
                ease: "easeInOut"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>Exclusivité VIP</span>
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                Rejoignez l'élite du
                <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  Shopping Premium
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Accès prioritaire aux nouveautés, offres exclusives et événements privés réservés à nos membres VIP
              </p>
            </div>
            
            <motion.div 
              className="max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300"
                />
                <button className="group relative bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 overflow-hidden transform hover:scale-105">
                  <span className="relative z-10 flex items-center">
                    Rejoindre l'élite
                    <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckBadgeIcon className="h-5 w-5 text-green-400" />
                <span className="text-sm">Offres exclusives</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                <span className="text-sm">Données protégées</span>
              </div>
              <div className="flex items-center space-x-2">
                <GiftIcon className="h-5 w-5 text-purple-400" />
                <span className="text-sm">Cadeaux VIP</span>
              </div>
            </div>
            
            <p className="text-gray-500 text-sm">
              Désabonnement en un clic. Plus de 25,000 membres nous font déjà confiance.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomeModern
