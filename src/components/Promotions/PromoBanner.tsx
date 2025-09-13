import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FireIcon,
  ClockIcon,
  TagIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { usePromotions } from '../../hooks/usePromotions'

interface PromoBannerProps {
  type?: 'hero' | 'sidebar' | 'floating' | 'header'
  className?: string
  maxItems?: number
}

const PromoBanner: React.FC<PromoBannerProps> = ({
  type = 'hero',
  className = '',
  maxItems = 3
}) => {
  const { getHotDeals, getFlashSales } = usePromotions()
  const [dismissed, setDismissed] = useState<string[]>([])
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)

  const hotDeals = getHotDeals().slice(0, maxItems)
  const flashSales = getFlashSales()

  // Auto-rotation pour les bannières hero
  useEffect(() => {
    if (type === 'hero' && hotDeals.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromoIndex((prev) => (prev + 1) % hotDeals.length)
      }, 5000) // 5 secondes

      return () => clearInterval(interval)
    }
  }, [hotDeals.length, type])

  const getTimeLeft = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return null

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}j ${hours % 24}h`
    }
    
    return `${hours}h ${minutes}m`
  }

  const handleDismiss = (promoId: string) => {
    setDismissed(prev => [...prev, promoId])
  }

  if (type === 'hero') {
    if (hotDeals.length === 0) return null

    const currentPromo = hotDeals[currentPromoIndex]

    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-purple-600 ${className}`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-8 py-12 text-center">
          <motion.div
            key={currentPromo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-4">
              <SparklesIcon className="h-8 w-8 text-yellow-300 mr-2" />
              <span className="text-yellow-300 font-semibold text-lg">OFFRE SPÉCIALE</span>
              <SparklesIcon className="h-8 w-8 text-yellow-300 ml-2" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {currentPromo.value}%{' '}
              <span className="text-yellow-300">DE RÉDUCTION</span>
            </h2>

            <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
              {currentPromo.description}
            </p>

            <div className="flex items-center justify-center space-x-6 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-white font-mono text-lg">
                  Code: {currentPromo.code}
                </span>
              </div>

              {getTimeLeft(currentPromo.endDate) && (
                <div className="flex items-center text-yellow-300">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">
                    Expire dans {getTimeLeft(currentPromo.endDate)}
                  </span>
                </div>
              )}
            </div>

            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-bold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
            >
              <TagIcon className="h-5 w-5 mr-2" />
              Profiter de l'offre
            </Link>
          </motion.div>

          {/* Dots Navigation */}
          {hotDeals.length > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              {hotDeals.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPromoIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentPromoIndex 
                      ? 'bg-yellow-300 scale-125' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (type === 'floating') {
    const visibleFlashSales = flashSales.filter(sale => !dismissed.includes(sale.id))
    
    if (visibleFlashSales.length === 0) return null

    return (
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {visibleFlashSales.slice(0, 2).map((sale, index) => (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ delay: index * 0.2 }}
              className="bg-red-500 text-white rounded-lg shadow-2xl p-4 max-w-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-red-400"></div>
              
              <button
                onClick={() => handleDismiss(sale.id)}
                className="absolute top-2 right-2 text-white/80 hover:text-white"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>

              <div className="flex items-center mb-2">
                <FireIcon className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="font-bold text-sm">VENTE FLASH</span>
                <div className="ml-auto flex items-center text-yellow-300">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs font-semibold">
                    {getTimeLeft(sale.endDate)}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-1">
                {sale.value}% de réduction
              </h3>
              <p className="text-sm text-white/90 mb-3">
                Code: {sale.code}
              </p>

              <Link
                to="/products"
                className="inline-flex items-center bg-white text-red-500 px-3 py-1 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                J'en profite !
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  if (type === 'sidebar') {
    if (hotDeals.length === 0) return null

    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="font-bold text-lg text-gray-900 flex items-center">
          <FireIcon className="h-5 w-5 text-red-500 mr-2" />
          Offres du moment
        </h3>

        {hotDeals.map((deal) => (
          <div key={deal.id} className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{deal.value}%
              </span>
              {getTimeLeft(deal.endDate) && (
                <div className="flex items-center text-red-600 text-xs">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {getTimeLeft(deal.endDate)}
                </div>
              )}
            </div>

            <h4 className="font-semibold text-gray-900 text-sm mb-1">
              {deal.name}
            </h4>
            <p className="text-gray-600 text-xs mb-3">
              {deal.description}
            </p>

            <div className="bg-white rounded border border-dashed border-red-300 p-2 text-center">
              <span className="font-mono text-sm font-bold text-red-600">
                {deal.code}
              </span>
            </div>
          </div>
        ))}

        <Link
          to="/products"
          className="block w-full text-center bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Voir tous les produits
        </Link>
      </div>
    )
  }

  if (type === 'header') {
    if (flashSales.length === 0) return null

    const currentFlash = flashSales[0]

    return (
      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 text-center relative overflow-hidden">
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <FireIcon className="h-4 w-4 mr-1 text-yellow-300" />
            <span className="font-bold">VENTE FLASH</span>
          </div>
          
          <span>{currentFlash.description}</span>
          
          <div className="flex items-center">
            <span className="font-bold">Code: {currentFlash.code}</span>
          </div>
          
          {getTimeLeft(currentFlash.endDate) && (
            <div className="flex items-center text-yellow-300">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span className="font-bold">{getTimeLeft(currentFlash.endDate)}</span>
            </div>
          )}
        </div>

        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse"></div>
      </div>
    )
  }

  return null
}

export default PromoBanner
