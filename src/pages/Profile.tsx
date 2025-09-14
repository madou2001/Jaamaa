import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  UserIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  HeartIcon,
  MapPinIcon,
  BellIcon,
  KeyIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useLocalCart } from '../hooks/useLocalCart'
import { useWishlist } from '../hooks/useWishlist'
import { supabase } from '../lib/supabase'
import AddressForm from '../components/Forms/AddressForm'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  newsletter: boolean
  notifications: boolean
}

interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  country: string
  isDefault: boolean
}

const Profile: React.FC = () => {
  const { user, signOut } = useAuth()
  const { } = useLocalCart()
  const { getWishlistCount } = useWishlist()

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'settings'>('profile')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [addressLoading, setAddressLoading] = useState(false)

  // Profile form
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    newsletter: true,
    notifications: true
  })

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadUserData()
    loadOrders()
  }, [user]) // Recharger les commandes quand l'utilisateur change

  const loadUserData = async () => {
    try {
      if (!user) {
        // Fallback vers localStorage si pas d'utilisateur connecté
        const savedProfile = localStorage.getItem('user_profile')
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile))
        }
        const savedAddresses = localStorage.getItem('user_addresses')
        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses))
        }
        return
      }

      // Charger le profil depuis Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        // Fallback vers localStorage
        const savedProfile = localStorage.getItem('user_profile')
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile))
        }
      } else if (profileData) {
        // Transformer les données Supabase au format attendu
        const profileDataTyped = profileData as any
        setProfile({
          firstName: profileDataTyped.first_name || '',
          lastName: profileDataTyped.last_name || '',
          email: user.email || '',
          phone: profileDataTyped.phone || '',
          dateOfBirth: profileDataTyped.date_of_birth || '',
          gender: '', // Temporaire - sera ajouté avec la migration
          newsletter: false, // Temporaire - sera ajouté avec la migration
          notifications: true // Temporaire - sera ajouté avec la migration
        })
      } else {
        // Aucun profil trouvé, utiliser les données de l'utilisateur
        setProfile({
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          dateOfBirth: user.user_metadata?.date_of_birth || '',
          gender: user.user_metadata?.gender || '',
          newsletter: user.user_metadata?.newsletter || false,
          notifications: user.user_metadata?.notifications || true
        })
      }

      // Charger les adresses depuis Supabase
      const { data: addressesData, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (addressesError) {
        // Fallback vers localStorage
        const savedAddresses = localStorage.getItem('user_addresses')
        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses))
        }
      } else if (addressesData) {
        // Transformer les données Supabase au format attendu
        const transformedAddresses = addressesData.map((addr: any) => ({
          id: addr.id,
          type: addr.type || 'home',
          firstName: addr.first_name || '',
          lastName: addr.last_name || '',
          address: addr.address_line_1 || '',
          city: addr.city || '',
          postalCode: addr.postal_code || '',
          country: addr.country || '',
          isDefault: addr.is_default || false
        }))
        setAddresses(transformedAddresses)
      }
    } catch (err) {
      // Fallback vers localStorage
      const savedProfile = localStorage.getItem('user_profile')
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      }
      const savedAddresses = localStorage.getItem('user_addresses')
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses))
      }
    }
  }

  const loadOrders = async () => {
    setOrdersLoading(true)
    try {
      if (!user) {
        // Si pas d'utilisateur connecté, charger depuis localStorage (fallback)
        const allOrders = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('order_')) {
            try {
              const orderData = localStorage.getItem(key)
              if (orderData) {
                allOrders.push(JSON.parse(orderData))
              }
            } catch (error) {
            }
          }
        }
        allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setOrders(allOrders)
        setOrdersLoading(false)
        return
      }

      // Récupérer les commandes depuis Supabase pour l'utilisateur connecté
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ordersError) {
        // Fallback vers localStorage en cas d'erreur
        const allOrders = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('order_')) {
            try {
              const orderData = localStorage.getItem(key)
              if (orderData) {
                allOrders.push(JSON.parse(orderData))
              }
            } catch (error) {
            }
          }
        }
        allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setOrders(allOrders)
        return
      }

      // Transformer les données Supabase au format attendu
      const transformedOrders = ordersData?.map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        items: order.order_items?.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          productPrice: item.unit_price,
          quantity: item.quantity,
          productImage: '/placeholder-product.svg'
        })) || [],
        shippingInfo: {
          firstName: order.shipping_address?.first_name || '',
          lastName: order.shipping_address?.last_name || '',
          email: order.email,
          phone: order.shipping_address?.phone || '',
          address: order.shipping_address?.address_line_1 || '',
          city: order.shipping_address?.city || '',
          postalCode: order.shipping_address?.postal_code || '',
          country: order.shipping_address?.country || ''
        },
        shippingMethod: order.shipping_method,
        subtotal: order.subtotal,
        shippingCost: order.shipping_amount,
        tax: order.tax_amount,
        total: order.total_amount,
        status: order.status,
        createdAt: order.created_at,
        paymentInfo: {
          cardNumber: '**** **** **** 1234',
          cardholderName: `${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}`.trim() || 'Non spécifié',
          expiryDate: '**/**',
          cvv: '***'
        }
      })) || []

      setOrders(transformedOrders)
      setOrdersLoading(false)
    } catch (err) {
      setOrdersLoading(false)
    }
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) {
        // Fallback vers localStorage si pas d'utilisateur connecté
        localStorage.setItem('user_profile', JSON.stringify(profile))
        setLoading(false)
        return
      }

      //   id: user.id,
      //   email: user.email,
      //   first_name: profile.firstName,
      //   last_name: profile.lastName,
      //   phone: profile.phone,
      //   date_of_birth: profile.dateOfBirth || null,
      // })

      // Vérifier si le profil existe déjà
      const { error: _checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()


      // Sauvegarder le profil dans Supabase (sans les champs manquants temporairement)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: profile.phone,
          date_of_birth: profile.dateOfBirth || null,
          // gender: profile.gender, // Temporaire - désactivé jusqu'à la migration
          // newsletter: profile.newsletter, // Temporaire - désactivé jusqu'à la migration
          // notifications: profile.notifications, // Temporaire - désactivé jusqu'à la migration
          updated_at: new Date().toISOString()
        } as any)

      if (profileError) {
        if (profileError.code === '42501') {
        } else {
        }
        return
      }

      // Sauvegarder aussi dans localStorage comme backup
      localStorage.setItem('user_profile', JSON.stringify(profile))
      
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return
    }

    if (passwordForm.newPassword.length < 6) {
      return
    }

    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }

  const handleAddressSave = async (addressData: Omit<Address, 'id'>) => {
    setAddressLoading(true)
    try {
      if (!user) {
        // Fallback vers localStorage si pas d'utilisateur connecté
        const newAddress: Address = {
          ...addressData,
          id: editingAddress?.id || `addr_${Date.now()}`
        }

        if (editingAddress) {
          const updatedAddresses = addresses.map(addr => 
            addr.id === editingAddress.id ? newAddress : addr
          )
          setAddresses(updatedAddresses)
          localStorage.setItem('user_addresses', JSON.stringify(updatedAddresses))
        } else {
          const updatedAddresses = [...addresses, newAddress]
          setAddresses(updatedAddresses)
          localStorage.setItem('user_addresses', JSON.stringify(updatedAddresses))
        }

        setShowAddressForm(false)
        setEditingAddress(null)
        setAddressLoading(false)
        return
      }


      // Si c'est l'adresse par défaut, désactiver les autres
      if (addressData.isDefault) {
        const { error: updateError } = await (supabase
          .from('addresses')
          // @ts-ignore
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', editingAddress?.id || '') as any)
        
        if (updateError) {
        }
      }

      // Sauvegarder l'adresse dans Supabase
      const addressPayload = {
        user_id: user.id,
        type: addressData.type === 'home' ? 'shipping' : addressData.type, // Map home to shipping
        first_name: addressData.firstName,
        last_name: addressData.lastName,
        address_line_1: addressData.address,
        city: addressData.city,
        postal_code: addressData.postalCode,
        country: addressData.country,
        is_default: addressData.isDefault,
        updated_at: new Date().toISOString()
      }

      let result: any
      if (editingAddress) {
        // Mettre à jour l'adresse existante
        const { data, error } = await (supabase
          .from('addresses')
          // @ts-ignore
          .update(addressPayload)
          .eq('id', editingAddress.id)
          .eq('user_id', user.id)
          .select() as any)
        result = { data, error }
      } else {
        // Créer une nouvelle adresse
        const { data, error } = await supabase
          .from('addresses')
          .insert(addressPayload as any)
          .select()
        result = { data, error }
      }

      if (result.error) {
        if (result.error.code === '42501') {
        } else {
        }
        return
      }


      // Recharger toutes les adresses depuis Supabase pour être sûr
      await loadUserData()

      if (editingAddress) {
      } else {
      }

      setShowAddressForm(false)
      setEditingAddress(null)
    } catch (err) {
    } finally {
      setAddressLoading(false)
    }
  }

  const handleAddressDelete = async (addressId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      try {
        if (user) {
          // Supprimer de Supabase
          const { error: deleteError } = await supabase
            .from('addresses')
            .delete()
            .eq('id', addressId)
            .eq('user_id', user.id)

          if (deleteError) {
            return
          }
        }

        // Mettre à jour l'état local
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId)
        setAddresses(updatedAddresses)
        localStorage.setItem('user_addresses', JSON.stringify(updatedAddresses))
      } catch (err) {
      }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmée'
      case 'processing': return 'En préparation'
      case 'shipped': return 'Expédiée'
      case 'delivered': return 'Livrée'
      default: return status
    }
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Connexion requise
          </h2>
          <p className="mt-2 text-gray-600">
            Vous devez être connecté pour accéder à votre profil.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <Link to="/login" className="btn-primary">
              Se connecter
            </Link>
            <Link to="/register" className="btn-secondary">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', name: 'Mon Profil', icon: UserIcon },
    { id: 'orders', name: 'Mes Commandes', icon: ShoppingBagIcon, badge: orders.length },
    { id: 'addresses', name: 'Mes Adresses', icon: MapPinIcon },
    { id: 'settings', name: 'Paramètres', icon: Cog6ToothIcon }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Compte</h1>
        <p className="text-gray-600">Gérez vos informations personnelles et vos commandes</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ShoppingBagIcon className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Commandes</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <HeartIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Favoris</p>
              <p className="text-2xl font-bold text-gray-900">{getWishlistCount()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <MapPinIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Adresses</p>
              <p className="text-2xl font-bold text-gray-900">{addresses.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <tab.icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{tab.name}</span>
                </div>
                {tab.badge && (
                  <span className="bg-primary-100 text-primary-600 text-xs font-medium px-2 py-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={signOut}
              className="w-full text-left text-red-600 hover:text-red-700 font-medium"
            >
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>
                  
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom
                        </label>
                        <input
                          type="text"
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de naissance
                        </label>
                        <input
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Genre
                        </label>
                        <select
                          value={profile.gender}
                          onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                          className="input-field"
                        >
                          <option value="">Sélectionner</option>
                          <option value="male">Homme</option>
                          <option value="female">Femme</option>
                          <option value="other">Autre</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profile.newsletter}
                          onChange={(e) => setProfile({ ...profile, newsletter: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Recevoir la newsletter
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profile.notifications}
                          onChange={(e) => setProfile({ ...profile, notifications: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Notifications par email
                        </span>
                      </label>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                      >
                        {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes Commandes</h2>
                  
                  {ordersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Chargement de vos commandes...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune commande</h3>
                      <p className="mt-2 text-gray-600">
                        Vous n'avez pas encore passé de commande.
                      </p>
                      <Link to="/products" className="btn-primary mt-4">
                        Découvrir nos produits
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium text-gray-900">{order.id}</h3>
                              <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                {getOrderStatusText(order.status)}
                              </span>
                              <p className="text-lg font-bold text-gray-900 mt-1">
                                {formatPrice(order.total)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {order.items.slice(0, 3).map((item: any) => (
                              <div key={item.id} className="flex items-center space-x-3">
                                <img
                                  src={item.productImage || '/placeholder-product.svg'}
                                  alt={item.productName}
                                  className="w-10 h-10 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                    {item.productName}
                                  </p>
                                  <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-sm text-gray-600 mt-2">
                                +{order.items.length - 3} autre(s) article(s)
                              </p>
                            )}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-3">
                            <Link
                              to={`/order-confirmation/${order.id}`}
                              className="btn-secondary text-sm"
                            >
                              Voir détails
                            </Link>
                            <button className="btn-primary text-sm">
                              Renouveler la commande
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Mes Adresses</h2>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="btn-primary"
                    >
                      Ajouter une adresse
                    </button>
                  </div>
                  
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune adresse</h3>
                      <p className="mt-2 text-gray-600">
                        Ajoutez vos adresses pour accélérer vos commandes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="font-medium text-gray-900">
                                  {address.firstName} {address.lastName}
                                </h3>
                                {address.isDefault && (
                                  <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded">
                                    Par défaut
                                  </span>
                                )}
                                <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                                  {address.type === 'home' ? 'Domicile' : address.type === 'work' ? 'Travail' : 'Autre'}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm">
                                {address.address}<br />
                                {address.postalCode} {address.city}<br />
                                {address.country}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingAddress(address)
                                  setShowAddressForm(true)
                                }}
                                className="text-primary-600 hover:text-primary-700 text-sm"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => handleAddressDelete(address.id)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Paramètres du compte</h2>
                  
                  {/* Change Password */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <KeyIcon className="h-5 w-5 mr-2 text-primary-600" />
                      Changer le mot de passe
                    </h3>
                    
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mot de passe actuel
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmer le nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                      >
                        {loading ? 'Modification...' : 'Modifier le mot de passe'}
                      </button>
                    </form>
                  </div>

                  {/* Notifications Settings */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <BellIcon className="h-5 w-5 mr-2 text-primary-600" />
                      Préférences de notification
                    </h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profile.newsletter}
                          onChange={(e) => setProfile({ ...profile, newsletter: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-3">
                          <span className="text-sm font-medium text-gray-900">Newsletter</span>
                          <span className="text-sm text-gray-600 block">Recevez nos dernières offres et nouveautés</span>
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profile.notifications}
                          onChange={(e) => setProfile({ ...profile, notifications: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-3">
                          <span className="text-sm font-medium text-gray-900">Notifications de commande</span>
                          <span className="text-sm text-gray-600 block">Recevez des mises à jour sur vos commandes</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-red-900 mb-2 flex items-center">
                      <TrashIcon className="h-5 w-5 mr-2 text-red-600" />
                      Zone dangereuse
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      La suppression de votre compte est irréversible. Toutes vos données seront perdues.
                    </p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Address Form Modal */}
      <AddressForm
        isOpen={showAddressForm}
        onClose={() => {
          setShowAddressForm(false)
          setEditingAddress(null)
        }}
        onSave={handleAddressSave}
        editingAddress={editingAddress}
        loading={addressLoading}
      />

      {/* Toast Notifications */}
    </div>
  )
}

export default Profile
