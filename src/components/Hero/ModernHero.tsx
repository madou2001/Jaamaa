import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useAnimation, useInView } from 'framer-motion'
import { 
  SparklesIcon, 
  ShoppingBagIcon, 
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface HeroProps {
  stats: {
    totalProducts: number
    totalCategories: number
    featuredProducts: number
  }
}

const ModernHero: React.FC<HeroProps> = ({ stats }) => {
  const [currentText, setCurrentText] = useState(0)
  const controls = useAnimation()
  const ref = React.useRef(null)
  const isInView = useInView(ref)

  const heroTexts = [
    'Découvrez l\'Excellence',
    'Style & Qualité',
    'Innovation Premium'
  ]

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    }
  }, [controls, isInView])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % heroTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [heroTexts.length])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  } as const

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  } as const

  const floatingElements = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 10 + 5,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
    x: Math.random() * 100,
    y: Math.random() * 100
  }))

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at top, #667eea 0%, #764ba2 100%)'
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div 
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" 
          style={{ animationDelay: '2s' } as React.CSSProperties}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" 
          style={{ animationDelay: '4s' } as React.CSSProperties}
        ></div>

        {/* Floating Particles */}
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute bg-white rounded-full opacity-10"
            style={{
              width: element.size,
              height: element.size,
              left: `${element.x}%`,
              top: `${element.y}%`
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: element.delay
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="inline-flex items-center px-4 py-2 glass rounded-full text-white/90 text-sm font-medium">
            <SparklesIcon className="h-4 w-4 mr-2 text-yellow-300" />
            Boutique Premium #1 en France
            <StarIcon className="h-4 w-4 ml-2 text-yellow-300 fill-yellow-300" />
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4">
            <span className="block">Bienvenue chez</span>
            <motion.span 
              className="block text-gradient-sunset text-shadow-lg"
              key={currentText}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {heroTexts[currentText]}
            </motion.span>
          </h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed"
          >
            Découvrez une expérience shopping révolutionnaire avec des produits d'exception, 
            une qualité irréprochable et un service client premium.
          </motion.p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-8 mb-12"
        >
          {[
            { label: 'Produits Premium', value: `${stats.totalProducts}+`, icon: '🏆' },
            { label: 'Catégories', value: `${stats.totalCategories}+`, icon: '📦' },
            { label: 'Produits Vedettes', value: stats.featuredProducts, icon: '⭐' }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="text-center glass rounded-2xl p-6 min-w-[140px]"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-white/70 text-sm font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/products">
            <motion.button
              className="group relative overflow-hidden bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center">
                <ShoppingBagIcon className="h-6 w-6 mr-3" />
                Découvrir la Collection
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="relative z-10 flex items-center text-white px-8 py-4">
                  <ShoppingBagIcon className="h-6 w-6 mr-3" />
                  Découvrir la Collection
                  <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.button>
          </Link>

          <Link to="/about">
            <motion.button
              className="glass text-white px-8 py-4 rounded-2xl font-semibold text-lg hover-lift"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              En savoir plus
            </motion.button>
          </Link>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          variants={itemVariants}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white/70 rounded-full mt-2"
            />
          </motion.div>
          <p className="text-white/70 text-sm mt-2">Défiler vers le bas</p>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 text-white/20">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="2" fill="currentColor">
            <animate attributeName="r" values="2;10;2" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <div className="absolute bottom-10 right-10 text-white/20">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="currentColor">
            <animateTransform 
              attributeName="transform" 
              attributeType="XML" 
              type="rotate" 
              from="0 50 50" 
              to="360 50 50" 
              dur="10s" 
              repeatCount="indefinite"
            />
          </polygon>
        </svg>
      </div>
    </section>
  )
}

export default ModernHero
