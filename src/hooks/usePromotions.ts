import { useState, useEffect } from 'react'

interface Promotion {
  id: string
  code: string
  name: string
  description: string
  type: 'percentage' | 'fixed' | 'shipping' | 'bogo'
  value: number
  minAmount?: number
  maxDiscount?: number
  startDate: string
  endDate: string
  usageLimit?: number
  usageCount: number
  isActive: boolean
  applicableCategories?: string[]
  applicableProducts?: string[]
  excludeProducts?: string[]
}

interface PromoCode {
  id: string
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  description: string
  isValid: boolean
  message: string
}

const PROMOTIONS_STORAGE_KEY = 'jaayma_promotions'
const USED_CODES_STORAGE_KEY = 'jaayma_used_codes'

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([])
  const [usedCodes, setUsedCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    initializePromotions()
    loadUsedCodes()
  }, [])

  const initializePromotions = () => {
    // Vérifier si des promotions existent déjà
    const savedPromotions = localStorage.getItem(PROMOTIONS_STORAGE_KEY)
    
    if (savedPromotions) {
      const parsed = JSON.parse(savedPromotions)
      setPromotions(parsed)
      setActivePromotions(getActivePromotions(parsed))
    } else {
      // Créer des promotions par défaut
      const defaultPromotions: Promotion[] = [
        {
          id: 'welcome10',
          code: 'WELCOME10',
          name: 'Bienvenue',
          description: '10% de réduction sur votre première commande',
          type: 'percentage',
          value: 10,
          minAmount: 50,
          maxDiscount: 50,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
          usageLimit: 1000,
          usageCount: 0,
          isActive: true
        },
        {
          id: 'freeship',
          code: 'FREESHIP',
          name: 'Livraison gratuite',
          description: 'Livraison gratuite sans minimum',
          type: 'shipping',
          value: 100, // 100% de réduction sur la livraison
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
          usageLimit: 500,
          usageCount: 0,
          isActive: true
        },
        {
          id: 'summer25',
          code: 'SUMMER25',
          name: 'Été 2024',
          description: '25% sur toute la collection été',
          type: 'percentage',
          value: 25,
          minAmount: 100,
          maxDiscount: 100,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 jours
          usageLimit: 200,
          usageCount: 0,
          isActive: true
        },
        {
          id: 'save20',
          code: 'SAVE20',
          name: 'Économisez 20€',
          description: '20€ de réduction dès 150€ d\'achat',
          type: 'fixed',
          value: 20,
          minAmount: 150,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 jours
          usageLimit: 100,
          usageCount: 0,
          isActive: true
        },
        {
          id: 'blackfriday',
          code: 'BLACKFRIDAY',
          name: 'Black Friday',
          description: '40% de réduction - Offre limitée !',
          type: 'percentage',
          value: 40,
          minAmount: 75,
          maxDiscount: 200,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 jours
          usageLimit: 50,
          usageCount: 0,
          isActive: true
        }
      ]

      localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(defaultPromotions))
      setPromotions(defaultPromotions)
      setActivePromotions(getActivePromotions(defaultPromotions))
    }
  }

  const loadUsedCodes = () => {
    const saved = localStorage.getItem(USED_CODES_STORAGE_KEY)
    if (saved) {
      setUsedCodes(JSON.parse(saved))
    }
  }

  const getActivePromotions = (promos: Promotion[]) => {
    const now = new Date()
    return promos.filter(promo => 
      promo.isActive && 
      new Date(promo.startDate) <= now && 
      new Date(promo.endDate) >= now &&
      (!promo.usageLimit || promo.usageCount < promo.usageLimit)
    )
  }

  const validatePromoCode = async (code: string, _cartItems: any[], cartTotal: number): Promise<PromoCode> => {
    setLoading(true)

    try {
      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 800))

      const upperCode = code.toUpperCase().trim()
      
      // Vérifier si le code a déjà été utilisé
      if (usedCodes.includes(upperCode)) {
        return {
          id: '',
          code: upperCode,
          discount: 0,
          type: 'percentage',
          description: '',
          isValid: false,
          message: 'Ce code promo a déjà été utilisé'
        }
      }

      // Trouver la promotion correspondante
      const promotion = activePromotions.find(p => p.code === upperCode)

      if (!promotion) {
        return {
          id: '',
          code: upperCode,
          discount: 0,
          type: 'percentage',
          description: '',
          isValid: false,
          message: 'Code promo invalide ou expiré'
        }
      }

      // Vérifier le montant minimum
      if (promotion.minAmount && cartTotal < promotion.minAmount) {
        return {
          id: promotion.id,
          code: upperCode,
          discount: 0,
          type: promotion.type === 'shipping' || promotion.type === 'bogo' ? 'fixed' : promotion.type,
          description: promotion.description,
          isValid: false,
          message: `Montant minimum de ${promotion.minAmount}€ requis`
        }
      }

      // Calculer la réduction
      let discount = 0
      
      switch (promotion.type) {
        case 'percentage':
          discount = (cartTotal * promotion.value) / 100
          if (promotion.maxDiscount) {
            discount = Math.min(discount, promotion.maxDiscount)
          }
          break
        case 'fixed':
          discount = Math.min(promotion.value, cartTotal)
          break
        case 'shipping':
          // Pour la livraison gratuite, on retourne une réduction symbolique
          // La logique réelle sera gérée dans le composant checkout
          discount = 0
          break
      }

      return {
        id: promotion.id,
        code: upperCode,
        discount: Math.round(discount * 100) / 100,
        type: promotion.type === 'shipping' || promotion.type === 'bogo' ? 'fixed' : promotion.type,
        description: promotion.description,
        isValid: true,
        message: promotion.type === 'shipping' 
          ? 'Livraison gratuite appliquée !' 
          : `Réduction de ${discount.toFixed(2)}€ appliquée !`
      }

    } catch (error) {
      // console.error('Erreur validation code promo:', error)
      return {
        id: '',
        code,
        discount: 0,
        type: 'percentage',
        description: '',
        isValid: false,
        message: 'Erreur lors de la validation'
      }
    } finally {
      setLoading(false)
    }
  }

  const applyPromoCode = (code: string) => {
    const upperCode = code.toUpperCase().trim()
    
    // Marquer le code comme utilisé
    const newUsedCodes = [...usedCodes, upperCode]
    setUsedCodes(newUsedCodes)
    localStorage.setItem(USED_CODES_STORAGE_KEY, JSON.stringify(newUsedCodes))

    // Incrémenter le compteur d'utilisation
    const updatedPromotions = promotions.map(promo => 
      promo.code === upperCode 
        ? { ...promo, usageCount: promo.usageCount + 1 }
        : promo
    )
    setPromotions(updatedPromotions)
    localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(updatedPromotions))
    setActivePromotions(getActivePromotions(updatedPromotions))
  }

  const removePromoCode = (code: string) => {
    const upperCode = code.toUpperCase().trim()
    
    // Retirer le code des codes utilisés
    const newUsedCodes = usedCodes.filter(usedCode => usedCode !== upperCode)
    setUsedCodes(newUsedCodes)
    localStorage.setItem(USED_CODES_STORAGE_KEY, JSON.stringify(newUsedCodes))
  }

  const getPromotionsByCategory = (categoryId: string) => {
    return activePromotions.filter(promo => 
      !promo.applicableCategories || promo.applicableCategories.includes(categoryId)
    )
  }

  const getPromotionsForProduct = (productId: string, categoryId?: string) => {
    return activePromotions.filter(promo => {
      // Si le produit est exclu
      if (promo.excludeProducts?.includes(productId)) {
        return false
      }
      
      // Si spécifique à certains produits
      if (promo.applicableProducts && !promo.applicableProducts.includes(productId)) {
        return false
      }
      
      // Si spécifique à certaines catégories
      if (promo.applicableCategories && categoryId && !promo.applicableCategories.includes(categoryId)) {
        return false
      }
      
      return true
    })
  }

  const getBestPromotionForCart = (_cartItems: any[], cartTotal: number) => {
    let bestPromo = null
    let maxDiscount = 0

    for (const promo of activePromotions) {
      if (usedCodes.includes(promo.code)) continue
      if (promo.minAmount && cartTotal < promo.minAmount) continue

      let discount = 0
      
      switch (promo.type) {
        case 'percentage':
          discount = (cartTotal * promo.value) / 100
          if (promo.maxDiscount) {
            discount = Math.min(discount, promo.maxDiscount)
          }
          break
        case 'fixed':
          discount = Math.min(promo.value, cartTotal)
          break
        case 'shipping':
          discount = 10 // Valeur symbolique pour le tri
          break
      }

      if (discount > maxDiscount) {
        maxDiscount = discount
        bestPromo = promo
      }
    }

    return bestPromo
  }

  const getHotDeals = () => {
    return activePromotions
      .filter(promo => promo.type === 'percentage' && promo.value >= 20)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
  }

  const getFlashSales = () => {
    const now = new Date()
    return activePromotions.filter(promo => {
      const endDate = new Date(promo.endDate)
      const hoursLeft = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      return hoursLeft <= 24 && hoursLeft > 0 // Expire dans moins de 24h
    })
  }

  return {
    promotions,
    activePromotions,
    loading,
    validatePromoCode,
    applyPromoCode,
    removePromoCode,
    getPromotionsByCategory,
    getPromotionsForProduct,
    getBestPromotionForCart,
    getHotDeals,
    getFlashSales,
    usedCodes
  }
}
