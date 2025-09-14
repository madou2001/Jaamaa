import React, { useState, useEffect } from 'react'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShoppingBagIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import ToastContainer from '../../components/UI/Toast'

interface Customer {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  is_verified: boolean
  created_at: string
  total_orders: number
  total_spent: number
  last_order_date?: string
}

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const { toasts, removeToast, error } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)

      // Récupérer les profils des utilisateurs
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Récupérer les statistiques de commandes pour chaque client
      const { data: ordersStats, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, total_amount, created_at')

      if (ordersError) throw ordersError

      // Calculer les statistiques par client
      const customerStats = ordersStats?.reduce((acc: any, order: any) => {
        if (!acc[order.user_id]) {
          acc[order.user_id] = {
            total_orders: 0,
            total_spent: 0,
            last_order_date: null
          }
        }
        acc[order.user_id].total_orders += 1
        acc[order.user_id].total_spent += order.total_amount
        
        if (!acc[order.user_id].last_order_date || 
            new Date(order.created_at) > new Date(acc[order.user_id].last_order_date)) {
          acc[order.user_id].last_order_date = order.created_at
        }
        
        return acc
      }, {}) || {}

      // Enrichir les profils avec les statistiques
      const enrichedCustomers = profilesData?.map((profile: any) => ({
        ...profile,
        total_orders: customerStats[profile.id]?.total_orders || 0,
        total_spent: customerStats[profile.id]?.total_spent || 0,
        last_order_date: customerStats[profile.id]?.last_order_date
      })) || []

      setCustomers(enrichedCustomers)
    } catch (err) {
      error('Erreur', 'Impossible de charger les clients')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getCustomerName = (customer: Customer) => {
    if (customer.first_name || customer.last_name) {
      return `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
    }
    return customer.email.split('@')[0]
  }

  // Filtrage des clients
  const filteredCustomers = customers.filter(customer => {
    const customerName = getCustomerName(customer).toLowerCase()
    const email = customer.email.toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    
    return customerName.includes(searchLower) || email.includes(searchLower)
  })

  // Statistiques
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.total_orders > 0).length
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.total_spent, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Search Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Customers Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
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
          Gestion des clients
        </h1>
        <p className="text-gray-600 mt-1">
          Gérez vos clients et consultez leurs informations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total clients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCustomers}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clients actifs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeCustomers}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <ShoppingBagIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CA total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(totalRevenue)}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <CurrencyEuroIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client trouvé</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Essayez de modifier votre recherche.'
                : 'Les clients apparaîtront ici une fois inscrits.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-lg">
                        {getCustomerName(customer).charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {getCustomerName(customer)}
                        </h3>
                        {customer.is_verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Vérifié
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-gray-600 text-sm">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Stats */}
                    <div className="text-right">
                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <span className="text-gray-600">Commandes:</span>
                          <span className="font-medium text-gray-900 ml-1">{customer.total_orders}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total:</span>
                          <span className="font-medium text-gray-900 ml-1">{formatPrice(customer.total_spent)}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-500 text-xs mt-1">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Inscrit le {formatDate(customer.created_at)}
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default CustomerManagement
