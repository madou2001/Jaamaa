import React, { useState } from 'react'
import { 
  TagIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { usePromotions } from '../../hooks/usePromotions'

interface PromoCodeInputProps {
  cartItems: any[]
  cartTotal: number
  onPromoApplied: (promoCode: any) => void
  onPromoRemoved: () => void
  appliedPromo?: any
  className?: string
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  cartItems,
  cartTotal,
  onPromoApplied,
  onPromoRemoved,
  appliedPromo,
  className = ''
}) => {
  const { validatePromoCode, applyPromoCode, removePromoCode, loading, getBestPromotionForCart } = usePromotions()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setError('')
    
    try {
      const result = await validatePromoCode(code, cartItems, cartTotal)
      
      if (result.isValid) {
        applyPromoCode(result.code)
        onPromoApplied(result)
        setCode('')
        setShowSuggestion(false)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Erreur lors de la validation du code')
    }
  }

  const handleRemovePromo = () => {
    if (appliedPromo) {
      removePromoCode(appliedPromo.code)
      onPromoRemoved()
      setShowSuggestion(true)
    }
  }

  const bestPromo = getBestPromotionForCart(cartItems, cartTotal)

  return (
    <div className={className}>
      {/* Applied Promo */}
      <AnimatePresence>
        {appliedPromo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Code "{appliedPromo.code}" appliqué
                  </p>
                  <p className="text-xs text-green-600">
                    {appliedPromo.message}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemovePromo}
                className="text-green-600 hover:text-green-800"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promo Code Input */}
      {!appliedPromo && (
        <div>
          <form onSubmit={handleSubmit} className="flex space-x-2 mb-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Code promo"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={loading}
              />
              <TagIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Appliquer'
              )}
            </button>
          </form>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center">
                  <ExclamationCircleIcon className="h-4 w-4 text-red-600 mr-2" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Best Promotion Suggestion */}
          <AnimatePresence>
            {showSuggestion && bestPromo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TagIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        💡 Code recommandé : {bestPromo.code}
                      </p>
                      <p className="text-xs text-blue-600">
                        {bestPromo.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCode(bestPromo.code)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Utiliser
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default PromoCodeInput
