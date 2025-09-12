import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CreditCardIcon,
  TruckIcon,
  MapPinIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useLocalCart } from '../hooks/useLocalCart'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import PromoCodeInput from '../components/Promotions/PromoCodeInput'
import ToastContainer from '../components/UI/Toast'

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
}

interface PaymentInfo {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
}

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { cartItems, getCartTotal, clearCart } = useLocalCart()
  const { toasts, removeToast, success, error } = useToast()
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Form states
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France'
  })

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })

  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [appliedPromo, setAppliedPromo] = useState<any>(null)

  // Charger les informations du profil utilisateur au démarrage
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setLoadingProfile(false)
        return
      }

      try {
        // Récupérer les informations du profil utilisateur
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        // Récupérer l'adresse par défaut de l'utilisateur
        const { data: addresses, error: addressError } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .eq('type', 'shipping')
          .single()

        // Fallback vers les métadonnées de l'utilisateur
        const userMeta = user.user_metadata || {}
        const email = user.email || ''
        const fullName = userMeta.full_name || userMeta.name || ''
        const [firstName, ...lastNameParts] = fullName.split(' ')

        // Remplir les informations de base depuis le profil ou les métadonnées
        let baseInfo = {
          firstName: firstName || '',
          lastName: lastNameParts.join(' ') || '',
          email: email,
          phone: '',
          address: '',
          city: '',
          postalCode: '',
          country: 'France'
        }

        if (profile && !profileError) {
          const profileData = profile as any
          baseInfo = {
            ...baseInfo,
            firstName: profileData.first_name || baseInfo.firstName,
            lastName: profileData.last_name || baseInfo.lastName,
            email: profileData.email || baseInfo.email,
            phone: profileData.phone || baseInfo.phone
          }

          // Remplir aussi le nom sur la carte de paiement
          const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()
          if (fullName) {
            setPaymentInfo(prev => ({
              ...prev,
              cardholderName: fullName
            }))
          }
        }

        // Remplir les informations d'adresse depuis la table addresses
        if (addresses && !addressError) {
          const addressData = addresses as any
          baseInfo = {
            ...baseInfo,
            firstName: addressData.first_name || baseInfo.firstName,
            lastName: addressData.last_name || baseInfo.lastName,
            phone: addressData.phone || baseInfo.phone,
            address: addressData.address_line_1,
            city: addressData.city,
            postalCode: addressData.postal_code,
            country: addressData.country
          }
        }

        setShippingInfo(prev => ({
          ...prev,
          ...baseInfo
        }))
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err)
      } finally {
        setLoadingProfile(false)
      }
    }

    loadUserProfile()
  }, [user])

  // Pricing
  const subtotal = getCartTotal()
  const promoDiscount = appliedPromo?.discount || 0
  const subtotalAfterPromo = Math.max(0, subtotal - promoDiscount)
  const shippingCost = appliedPromo?.type === 'shipping' ? 0 : (shippingMethod === 'express' ? 9.99 : subtotal >= 50 ? 0 : 4.99)
  const tax = subtotalAfterPromo * 0.20 // 20% TVA
  const total = subtotalAfterPromo + shippingCost + tax

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || 
        !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode) {
      error('Erreur', 'Veuillez remplir tous les champs obligatoires')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      error('Erreur', 'Veuillez entrer une adresse email valide')
      return
    }

    // Proposer de sauvegarder dans le profil si l'utilisateur est connecté
    if (user && window.confirm('Voulez-vous sauvegarder ces informations dans votre profil pour vos prochaines commandes ?')) {
      try {
        // Mettre à jour le profil de base
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: shippingInfo.email,
            first_name: shippingInfo.firstName,
            last_name: shippingInfo.lastName,
            phone: shippingInfo.phone,
            updated_at: new Date().toISOString()
          } as any)

        if (profileError) {
          console.error('Erreur lors de la mise à jour du profil:', profileError)
        }

        // Sauvegarder l'adresse comme adresse par défaut
        const { error: addressError } = await supabase
          .from('addresses')
          .upsert({
            user_id: user.id,
            type: 'shipping' as any,
            first_name: shippingInfo.firstName,
            last_name: shippingInfo.lastName,
            address_line_1: shippingInfo.address,
            city: shippingInfo.city,
            postal_code: shippingInfo.postalCode,
            country: shippingInfo.country,
            phone: shippingInfo.phone,
            is_default: true,
            updated_at: new Date().toISOString()
          } as any)

        if (addressError) {
          console.error('Erreur lors de la sauvegarde de l\'adresse:', addressError)
        } else {
          success('Profil mis à jour', 'Vos informations ont été sauvegardées dans votre profil')
        }
      } catch (err) {
        console.error('Erreur lors de la sauvegarde:', err)
      }
    }

    setCurrentStep(2)
    success('Étape validée', 'Informations de livraison enregistrées')
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv || !paymentInfo.cardholderName) {
      error('Erreur', 'Veuillez remplir toutes les informations de paiement')
      return
    }

    if (paymentInfo.cardNumber.replace(/\s/g, '').length !== 16) {
      error('Erreur', 'Numéro de carte invalide')
      return
    }

    if (paymentInfo.cvv.length !== 3) {
      error('Erreur', 'CVV invalide')
      return
    }

    setLoading(true)

    try {
      // Simulation du traitement de paiement
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Générer un numéro de commande unique
      const orderNumber = `ORD-${Date.now()}`
      const orderId = crypto.randomUUID()

      // Créer l'adresse de livraison
      const shippingAddress = {
        first_name: shippingInfo.firstName,
        last_name: shippingInfo.lastName,
        address_line_1: shippingInfo.address,
        city: shippingInfo.city,
        postal_code: shippingInfo.postalCode,
        country: shippingInfo.country,
        phone: shippingInfo.phone
      }

      // Calculer les montants
      const promoDiscount = appliedPromo?.discount || 0

      // Sauvegarder la commande principale dans Supabase
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          order_number: orderNumber,
          user_id: user?.id || null,
          email: shippingInfo.email,
          status: 'confirmed' as any,
          payment_status: 'paid' as any,
          currency: 'EUR',
          subtotal: subtotal,
          tax_amount: tax,
          shipping_amount: shippingCost,
          discount_amount: promoDiscount,
          total_amount: total,
          shipping_method: shippingMethod as any,
          shipping_address: shippingAddress,
          billing_address: shippingAddress, // Même adresse pour la facturation
          coupon_code: appliedPromo?.code || null,
          notes: null
        } as any)

      if (orderError) {
        console.error('Erreur lors de la création de la commande:', orderError)
        throw new Error('Erreur lors de la création de la commande')
      }

      // Sauvegarder les articles de la commande
      const orderItems = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.productPrice,
        total_price: item.productPrice * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems as any)

      if (itemsError) {
        console.error('Erreur lors de la sauvegarde des articles:', itemsError)
        // Continuer malgré l'erreur des articles
      }

      // Vider le panier
      clearCart()

      // Rediriger vers la confirmation
      navigate(`/order-confirmation/${orderId}`)

      success('Commande confirmée', 'Votre commande a été enregistrée avec succès !')

    } catch (err) {
      error('Erreur', 'Erreur lors du traitement du paiement')
    } finally {
      setLoading(false)
    }
  }

  const handleCashOnDeliverySubmit = async () => {
    setLoading(true)

    try {
      // Simuler le traitement de la commande
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Générer un ID de commande unique
      const orderId = crypto.randomUUID()
      const orderNumber = `ORD-${Date.now()}`

      console.log('💰 Finalisation de la commande avec paiement à la livraison')
      console.log('🆔 ID commande:', orderId)
      console.log('📦 Articles:', cartItems)
      console.log('🚚 Informations de livraison:', shippingInfo)

      // Sauvegarder la commande dans Supabase
      if (user) {
        // Sauvegarder la commande principale
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            id: orderId,
            user_id: user.id,
            order_number: orderNumber,
            email: shippingInfo.email,
            subtotal: subtotal,
            shipping_amount: shippingCost,
            tax_amount: tax,
            total_amount: total,
            shipping_method: shippingMethod,
            payment_method: 'cash_on_delivery',
            payment_status: 'pending',
            status: 'confirmed',
            shipping_address: {
              first_name: shippingInfo.firstName,
              last_name: shippingInfo.lastName,
              address_line_1: shippingInfo.address,
              city: shippingInfo.city,
              postal_code: shippingInfo.postalCode,
              country: shippingInfo.country,
              phone: shippingInfo.phone
            },
            billing_address: {
              first_name: shippingInfo.firstName,
              last_name: shippingInfo.lastName,
              address_line_1: shippingInfo.address,
              city: shippingInfo.city,
              postal_code: shippingInfo.postalCode,
              country: shippingInfo.country,
              phone: shippingInfo.phone
            },
            created_at: new Date().toISOString()
          } as any)
          .select()

        if (orderError) {
          console.error('❌ Erreur lors de la sauvegarde de la commande:', orderError)
          throw new Error('Erreur lors de la sauvegarde de la commande')
        }

        console.log('✅ Commande principale sauvegardée:', orderData)

        // Sauvegarder les articles de la commande
        const orderItems = cartItems.map(item => ({
          order_id: orderId,
          product_id: item.productId,
          product_name: item.productName,
          unit_price: item.productPrice,
          quantity: item.quantity,
          total_price: item.productPrice * item.quantity
        }))

        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems as any)
          .select()

        if (itemsError) {
          console.error('❌ Erreur lors de la sauvegarde des articles:', itemsError)
          throw new Error('Erreur lors de la sauvegarde des articles')
        }

        console.log('✅ Articles de commande sauvegardés:', itemsData)

        // Demander si l'utilisateur veut sauvegarder les informations de livraison
        if (window.confirm('Voulez-vous sauvegarder ces informations de livraison pour vos prochaines commandes ?')) {
          try {
            // Sauvegarder/mettre à jour le profil
            await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                email: user.email,
                first_name: shippingInfo.firstName,
                last_name: shippingInfo.lastName,
                phone: shippingInfo.phone,
                updated_at: new Date().toISOString()
              } as any)

            // Sauvegarder l'adresse de livraison comme adresse par défaut
            await supabase
              .from('addresses')
              .upsert({
                user_id: user.id,
                type: 'shipping',
                first_name: shippingInfo.firstName,
                last_name: shippingInfo.lastName,
                address_line_1: shippingInfo.address,
                city: shippingInfo.city,
                postal_code: shippingInfo.postalCode,
                country: shippingInfo.country,
                is_default: true,
                updated_at: new Date().toISOString()
              } as any)

            console.log('✅ Informations utilisateur sauvegardées')
          } catch (err) {
            console.warn('⚠️ Erreur lors de la sauvegarde des informations utilisateur:', err)
          }
        }
      }

      // Vider le panier
      clearCart()

      success('Commande confirmée', 'Votre commande a été enregistrée ! Préparez le montant exact pour la livraison.')
      
      // Rediriger vers la page de confirmation
      navigate(`/order-confirmation/${orderId}`)
    } catch (err) {
      console.error('❌ Erreur lors de la finalisation:', err)
      error('Erreur', 'Une erreur est survenue lors du traitement de votre commande')
    } finally {
      setLoading(false)
    }
  }

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            🛒 Votre panier est vide
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Impossible de passer commande
          </h2>
          <p className="text-gray-600 mb-6">
            Ajoutez des produits à votre panier pour continuer.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Découvrir nos produits
          </button>
        </div>
      </div>
    )
  }

  const steps = [
    { id: 1, name: 'Livraison', icon: TruckIcon, completed: currentStep > 1 },
    { id: 2, name: 'Paiement', icon: CreditCardIcon, completed: false },
    { id: 3, name: 'Confirmation', icon: CheckCircleIcon, completed: false }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour au panier
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Finaliser ma commande</h1>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <nav className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep === step.id 
                  ? 'border-primary-600 bg-primary-600 text-white' 
                  : step.completed
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}>
                {step.completed ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  <step.icon className="h-6 w-6" />
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === step.id ? 'text-primary-600' : step.completed ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  step.completed ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPinIcon className="h-6 w-6 mr-2 text-primary-600" />
                Informations de livraison
              </h2>

              {/* Message d'information pour le remplissage automatique */}
              {user && !loadingProfile && (shippingInfo.firstName || shippingInfo.email) && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Informations pré-remplies !</span> Nous avons automatiquement rempli vos informations à partir de votre profil. Vous pouvez les modifier si nécessaire.
                    </p>
                  </div>
                </div>
              )}

              {/* Indicateur de chargement */}
              {loadingProfile && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2"></div>
                    <p className="text-sm text-gray-600">Chargement de vos informations...</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.postalCode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pays
                    </label>
                    <select
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                      className="input-field"
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                    </select>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mode de livraison
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="text-primary-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Livraison standard</span>
                          <span className="text-green-600 font-medium">
                            {subtotal >= 50 ? 'Gratuit' : '4,99€'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">3-5 jours ouvrés</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="text-primary-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Livraison express</span>
                          <span className="font-medium">9,99€</span>
                        </div>
                        <p className="text-sm text-gray-600">24-48h</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="btn-primary w-full">
                    Continuer vers le paiement
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <LockClosedIcon className="h-6 w-6 mr-2 text-primary-600" />
                Informations de paiement
              </h2>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mode de paiement
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600"
                    />
                    <CreditCardIcon className="h-5 w-5 ml-3 mr-2 text-gray-600" />
                    <div className="flex-1">
                      <span className="font-medium">Carte bancaire</span>
                      <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600"
                    />
                    <BanknotesIcon className="h-5 w-5 ml-3 mr-2 text-gray-600" />
                    <div className="flex-1">
                      <span className="font-medium">Paiement à la livraison</span>
                      <p className="text-sm text-gray-500">Payez en espèces lors de la réception</p>
                    </div>
                    <div className="ml-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Populaire
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de carte *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
                        if (value.length <= 19) {
                          setPaymentInfo({ ...paymentInfo, cardNumber: value })
                        }
                      }}
                      placeholder="1234 5678 9012 3456"
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'expiration *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/')
                          if (value.length <= 5) {
                            setPaymentInfo({ ...paymentInfo, expiryDate: value })
                          }
                        }}
                        placeholder="MM/AA"
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          if (value.length <= 3) {
                            setPaymentInfo({ ...paymentInfo, cvv: value })
                          }
                        }}
                        placeholder="123"
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du titulaire *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cardholderName}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardholderName: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="pt-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="btn-secondary w-full"
                    >
                      Retour aux informations de livraison
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Traitement en cours...
                        </div>
                      ) : (
                        `Payer ${formatPrice(total)}`
                      )}
                    </button>
                  </div>
                </form>
              )}

              {paymentMethod === 'cash_on_delivery' && (
                <div className="space-y-6">
                  {/* Information sur le paiement à la livraison */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex">
                      <BanknotesIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">
                          Paiement à la livraison
                        </h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <ul className="list-disc list-inside space-y-1">
                            <li>Payez en espèces lors de la réception de votre commande</li>
                            <li>Préparez l'appoint exact si possible</li>
                            <li>Des frais de service de 2€ peuvent s'appliquer</li>
                            <li>Disponible uniquement pour les livraisons en France métropolitaine</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Montant à payer */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Montant à payer à la livraison :</span>
                      <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      * Frais de service inclus
                    </p>
                  </div>

                  <div className="pt-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="btn-secondary w-full"
                    >
                      Retour aux informations de livraison
                    </button>
                    <button
                      type="button"
                      onClick={handleCashOnDeliverySubmit}
                      disabled={loading}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Finalisation en cours...
                        </div>
                      ) : (
                        `Confirmer la commande ${formatPrice(total)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h3>
          
          {/* Items */}
          <div className="space-y-3 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <img
                  src={item.productImage || '/placeholder-product.svg'}
                  alt={item.productName}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {item.productName}
                  </p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(item.productPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Promo Code */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <PromoCodeInput
              cartItems={cartItems}
              cartTotal={subtotal}
              onPromoApplied={setAppliedPromo}
              onPromoRemoved={() => setAppliedPromo(null)}
              appliedPromo={appliedPromo}
            />
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Réduction ({appliedPromo.code})</span>
                <span>-{formatPrice(promoDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Livraison</span>
              <span className={appliedPromo?.type === 'shipping' ? 'text-green-600' : ''}>
                {appliedPromo?.type === 'shipping' ? (
                  <>
                    <span className="line-through text-gray-400 mr-2">
                      {formatPrice(shippingMethod === 'express' ? 9.99 : subtotal >= 50 ? 0 : 4.99)}
                    </span>
                    Gratuit
                  </>
                ) : (
                  formatPrice(shippingCost)
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>TVA (20%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className={appliedPromo ? 'text-green-600' : ''}>
                  {formatPrice(total)}
                  {appliedPromo && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {formatPrice(subtotal + (shippingMethod === 'express' ? 9.99 : subtotal >= 50 ? 0 : 4.99) + (subtotal * 0.20))}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <LockClosedIcon className="h-4 w-4 mr-1" />
              Paiement 100% sécurisé
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default Checkout
