import React, { useState, useEffect } from 'react'
import {
  CogIcon,
  CreditCardIcon,
  TruckIcon,
  BellIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useToast } from '../../hooks/useToast'
import ToastContainer from '../../components/UI/Toast'

interface GeneralSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  contactEmail: string
  supportPhone: string
  timezone: string
  currency: string
  language: string
}

interface PaymentSettings {
  stripeEnabled: boolean
  stripePublicKey: string
  stripeSecretKey: string
  paypalEnabled: boolean
  paypalClientId: string
  cashOnDeliveryEnabled: boolean
}

interface ShippingSettings {
  freeShippingThreshold: number
  standardShippingCost: number
  expressShippingCost: number
  shippingZones: string[]
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  orderNotifications: boolean
  stockAlerts: boolean
  marketingEmails: boolean
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: 'Jaayma E-commerce',
    siteDescription: 'Votre boutique en ligne de confiance',
    siteUrl: 'https://jaayma-ecommerce.com',
    contactEmail: 'contact@jaayma-ecommerce.com',
    supportPhone: '+33 1 23 45 67 89',
    timezone: 'Europe/Paris',
    currency: 'EUR',
    language: 'fr'
  })

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripeEnabled: true,
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalEnabled: false,
    paypalClientId: '',
    cashOnDeliveryEnabled: true
  })

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    freeShippingThreshold: 50,
    standardShippingCost: 5.99,
    expressShippingCost: 12.99,
    shippingZones: ['France métropolitaine', 'Europe', 'Monde']
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    stockAlerts: true,
    marketingEmails: false
  })

  const { toasts, removeToast, success, error } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      // En production, charger depuis la base de données
      // Pour l'instant, on utilise les valeurs par défaut
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulation
    } catch (err) {
      console.error('Erreur lors du chargement des paramètres:', err)
      error('Erreur', 'Impossible de charger les paramètres')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setLoading(true)
      // En production, sauvegarder en base de données
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulation
      success('Paramètres sauvegardés', 'Les modifications ont été enregistrées avec succès')
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      error('Erreur', 'Impossible de sauvegarder les paramètres')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveSettings()
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveSettings()
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveSettings()
  }

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveSettings()
  }

  const tabs = [
    { id: 'general', name: 'Général', icon: CogIcon },
    { id: 'payment', name: 'Paiements', icon: CreditCardIcon },
    { id: 'shipping', name: 'Livraison', icon: TruckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon }
  ]

  if (loading && activeTab === 'general') {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
        
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
              ))}
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Paramètres
        </h1>
        <p className="text-gray-600 mt-1">
          Configurez votre boutique en ligne
        </p>
      </div>

      {/* Settings Panel */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 p-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-1 py-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Informations générales
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Configurez les informations de base de votre boutique
                </p>
              </div>

              <form onSubmit={handleGeneralSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du site
                    </label>
                    <input
                      type="text"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL du site
                    </label>
                    <input
                      type="url"
                      value={generalSettings.siteUrl}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description du site
                  </label>
                  <textarea
                    rows={3}
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de contact
                    </label>
                    <input
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone support
                    </label>
                    <input
                      type="tel"
                      value={generalSettings.supportPhone}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuseau horaire
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Devise
                    </label>
                    <select
                      value={generalSettings.currency}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dollar ($)</option>
                      <option value="GBP">Livre (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Langue
                    </label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Méthodes de paiement
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Configurez les options de paiement acceptées
                </p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-8">
                {/* Stripe */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">Stripe</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentSettings.stripeEnabled}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {paymentSettings.stripeEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Clé publique
                        </label>
                        <input
                          type="text"
                          value={paymentSettings.stripePublicKey}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
                          placeholder="pk_test_..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Clé secrète
                        </label>
                        <input
                          type="password"
                          value={paymentSettings.stripeSecretKey}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                          placeholder="sk_test_..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* PayPal */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">PayPal</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentSettings.paypalEnabled}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {paymentSettings.paypalEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client ID PayPal
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.paypalClientId}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalClientId: e.target.value }))}
                        placeholder="AeR..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-md font-medium text-gray-900">Paiement à la livraison</h4>
                      <p className="text-sm text-gray-600">Permettre le paiement en espèces lors de la livraison</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentSettings.cashOnDeliveryEnabled}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, cashOnDeliveryEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Shipping Settings */}
          {activeTab === 'shipping' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Options de livraison
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Configurez les tarifs et zones de livraison
                </p>
              </div>

              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Livraison gratuite à partir de
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={shippingSettings.freeShippingThreshold}
                        onChange={(e) => setShippingSettings(prev => ({ ...prev, freeShippingThreshold: parseFloat(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-3 text-gray-500">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Livraison standard
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={shippingSettings.standardShippingCost}
                        onChange={(e) => setShippingSettings(prev => ({ ...prev, standardShippingCost: parseFloat(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-3 text-gray-500">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Livraison express
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={shippingSettings.expressShippingCost}
                        onChange={(e) => setShippingSettings(prev => ({ ...prev, expressShippingCost: parseFloat(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-3 text-gray-500">€</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zones de livraison
                  </label>
                  <div className="space-y-2">
                    {shippingSettings.shippingZones.map((zone, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={zone}
                          onChange={(e) => {
                            const newZones = [...shippingSettings.shippingZones]
                            newZones[index] = e.target.value
                            setShippingSettings(prev => ({ ...prev, shippingZones: newZones }))
                          }}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newZones = shippingSettings.shippingZones.filter((_, i) => i !== index)
                            setShippingSettings(prev => ({ ...prev, shippingZones: newZones }))
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setShippingSettings(prev => ({ 
                          ...prev, 
                          shippingZones: [...prev.shippingZones, 'Nouvelle zone'] 
                        }))
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Ajouter une zone
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BellIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Préférences de notification
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Configurez les notifications que vous souhaitez recevoir
                </p>
              </div>

              <form onSubmit={handleNotificationSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notifications par email</h4>
                      <p className="text-sm text-gray-600">Recevoir les notifications importantes par email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notifications SMS</h4>
                      <p className="text-sm text-gray-600">Recevoir les alertes urgentes par SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.smsNotifications}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Nouvelles commandes</h4>
                      <p className="text-sm text-gray-600">Être notifié des nouvelles commandes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.orderNotifications}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, orderNotifications: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Alertes de stock</h4>
                      <p className="text-sm text-gray-600">Être alerté quand le stock est faible</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.stockAlerts}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, stockAlerts: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Emails marketing</h4>
                      <p className="text-sm text-gray-600">Recevoir les newsletters et promotions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.marketingEmails}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default Settings