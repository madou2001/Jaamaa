import React, { useState, useEffect } from 'react'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CreditCardIcon,
  BanknotesIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import ToastContainer from '../../components/UI/Toast'

interface Order {
  id: string
  order_number: string
  user_id: string
  email: string
  status: string
  payment_status: string
  payment_method: string
  total_amount: number
  created_at: string
  shipping_address: any
  customer_name?: string
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')

  const { toasts, removeToast, success, error } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Enrichir avec les noms des clients
      const enrichedOrders = ordersData?.map((order: any) => ({
        ...order,
        customer_name: `${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}`.trim() || order.email
      })) || []

      setOrders(enrichedOrders)
    } catch (err) {
      // console.error('Erreur lors du chargement des commandes:', err)
      error('Erreur', 'Impossible de charger les commandes')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        // @ts-ignore
        .update({ status: newStatus })
        .eq('id', orderId)

      if (updateError) throw updateError

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

      success('Statut mis à jour', `Commande ${getStatusText(newStatus)}`)
    } catch (err) {
      // console.error('Erreur lors de la mise à jour du statut:', err)
      error('Erreur', 'Impossible de mettre à jour le statut')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-indigo-100 text-indigo-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'confirmed': return 'Confirmée'
      case 'processing': return 'En préparation'
      case 'shipped': return 'Expédiée'
      case 'delivered': return 'Livrée'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'paid': return 'Payé'
      case 'failed': return 'Échoué'
      case 'refunded': return 'Remboursé'
      default: return status
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCardIcon className="h-4 w-4" />
      case 'cash_on_delivery': return <BanknotesIcon className="h-4 w-4" />
      default: return <CreditCardIcon className="h-4 w-4" />
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'card': return 'Carte'
      case 'cash_on_delivery': return 'Livraison'
      default: return method
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filtrage des commandes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        {/* Filters Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Orders Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
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
          Gestion des commandes
        </h1>
        <p className="text-gray-600 mt-1">
          Gérez et suivez toutes les commandes ({filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''})
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="processing">En préparation</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les paiements</option>
            <option value="pending">En attente</option>
            <option value="paid">Payé</option>
            <option value="failed">Échoué</option>
            <option value="refunded">Remboursé</option>
          </select>

          {/* Stats */}
          <div className="text-sm text-gray-600 flex items-center">
            <span className="font-medium">{filteredOrders.length}</span> résultat(s)
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande trouvée</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche.'
                : 'Les commandes apparaîtront ici une fois créées.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {/* Order Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          #{order.order_number}
                        </h3>
                        <div className="flex items-center text-gray-500 text-sm">
                          {getPaymentMethodIcon(order.payment_method)}
                          <span className="ml-1">{getPaymentMethodText(order.payment_method)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.customer_name} • {order.email}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <br />
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                        {getPaymentStatusText(order.payment_status)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(order.total_amount)}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    {/* Status Update */}
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmée</option>
                      <option value="processing">En préparation</option>
                      <option value="shipped">Expédiée</option>
                      <option value="delivered">Livrée</option>
                      <option value="cancelled">Annulée</option>
                    </select>

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

export default OrderManagement
