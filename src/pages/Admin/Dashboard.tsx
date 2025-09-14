import React, { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  CurrencyEuroIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import SecurityInfo from '../../components/Admin/SecurityInfo'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueGrowth: number
  ordersGrowth: number
}

interface RecentOrder {
  id: string
  order_number: string
  customer_name: string
  total_amount: number
  status: string
  created_at: string
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    ordersGrowth: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Parallèle des requêtes pour les statistiques
      const [ordersResult, customersResult, productsResult] = await Promise.all([
        supabase.from('orders').select('total_amount, created_at, order_number, email'),
        supabase.from('profiles').select('id, created_at'),
        supabase.from('products').select('id')
      ])

      const orders = (ordersResult.data as any[]) || []
      const customers = (customersResult.data as any[]) || []
      const products = (productsResult.data as any[]) || []

      // Calculer les statistiques
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
      const totalOrders = orders.length
      const totalCustomers = customers.length
      const totalProducts = products.length

      // Croissance (simulation - en production, comparer avec période précédente)
      const revenueGrowth = Math.random() * 20 - 10 // -10% à +10%
      const ordersGrowth = Math.random() * 30 - 15 // -15% à +15%

      setStats({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth,
        ordersGrowth
      })

      // Commandes récentes
      const recentOrdersData = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(order => ({
          id: order.id || crypto.randomUUID(),
          order_number: order.order_number || `ORD-${Date.now()}`,
          customer_name: order.email?.split('@')[0] || 'Client',
          total_amount: order.total_amount,
          status: 'confirmed',
          created_at: order.created_at
        }))

      setRecentOrders(recentOrdersData)

    } catch (error) {
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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const statCards = [
    {
      title: 'Chiffre d\'affaires',
      value: formatPrice(stats.totalRevenue),
      growth: stats.revenueGrowth,
      icon: CurrencyEuroIcon,
      color: 'text-green-600'
    },
    {
      title: 'Commandes',
      value: stats.totalOrders.toString(),
      growth: stats.ordersGrowth,
      icon: ShoppingBagIcon,
      color: 'text-blue-600'
    },
    {
      title: 'Clients',
      value: stats.totalCustomers.toString(),
      growth: 0,
      icon: UsersIcon,
      color: 'text-purple-600'
    },
    {
      title: 'Produits',
      value: stats.totalProducts.toString(),
      growth: 0,
      icon: ChartBarIcon,
      color: 'text-orange-600'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Info */}
      <SecurityInfo />
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord
        </h1>
        <p className="text-gray-600 mt-1">
          Vue d'ensemble de votre activité
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                {stat.growth !== 0 && (
                  <div className={`flex items-center mt-2 text-sm ${
                    stat.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.growth >= 0 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(stat.growth).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-lg bg-gray-50`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Commandes récentes
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Voir toutes
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <ShoppingBagIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>Aucune commande récente</p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        #{order.order_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.customer_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      Confirmée
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(order.total_amount)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
