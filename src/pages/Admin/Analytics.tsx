import React, { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  CurrencyEuroIcon,
  ShoppingBagIcon,
  UsersIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueGrowth: number
  ordersGrowth: number
  customersGrowth: number
  avgOrderValue: number
  monthlyRevenue: { month: string; revenue: number }[]
  topProducts: { name: string; sales: number; revenue: number }[]
  customersByMonth: { month: string; customers: number }[]
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    avgOrderValue: 0,
    monthlyRevenue: [],
    topProducts: [],
    customersByMonth: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      // Calculer la date de début selon la période sélectionnée
      const startDate = new Date()
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(startDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
      }

      // Requêtes parallèles pour récupérer toutes les données
      const [ordersResult, customersResult, productsResult] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('profiles')
          .select('*')
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('products')
          .select('*')
      ])

      const orders = ordersResult.data || []
      const customers = customersResult.data || []
      const products = productsResult.data || []

      // Calculs statistiques
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
      const totalOrders = orders.length
      const totalCustomers = customers.length
      const totalProducts = products.length
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Simulation de croissance (en production, comparer avec période précédente)
      const revenueGrowth = Math.random() * 30 - 15 // -15% à +15%
      const ordersGrowth = Math.random() * 40 - 20 // -20% à +20%
      const customersGrowth = Math.random() * 25 - 10 // -10% à +15%

      // Revenus mensuels (simulation)
      const monthlyRevenue = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short' })
        monthlyRevenue.push({
          month: monthName,
          revenue: Math.random() * 50000 + 20000
        })
      }

      // Top produits (simulation basée sur les vrais produits)
      const topProducts = products
        .slice(0, 5)
        .map(product => ({
          name: product.name,
          sales: Math.floor(Math.random() * 100) + 10,
          revenue: Math.random() * 10000 + 2000
        }))

      // Clients par mois (simulation)
      const customersByMonth = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short' })
        customersByMonth.push({
          month: monthName,
          customers: Math.floor(Math.random() * 200) + 50
        })
      }

      setData({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth,
        ordersGrowth,
        customersGrowth,
        avgOrderValue,
        monthlyRevenue,
        topProducts,
        customersByMonth
      })

    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error)
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

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const stats = [
    {
      title: 'Chiffre d\'affaires',
      value: formatPrice(data.totalRevenue),
      growth: data.revenueGrowth,
      icon: CurrencyEuroIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Commandes',
      value: data.totalOrders.toString(),
      growth: data.ordersGrowth,
      icon: ShoppingBagIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Clients',
      value: data.totalCustomers.toString(),
      growth: data.customersGrowth,
      icon: UsersIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Panier moyen',
      value: formatPrice(data.avgOrderValue),
      growth: 0,
      icon: ChartBarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-72 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Analysez les performances de votre boutique
          </p>
        </div>
        
        {/* Time Range Filter */}
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="1y">1 an</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
                  <div className={`flex items-center mt-2 text-sm ${getGrowthColor(stat.growth)}`}>
                    {React.createElement(getGrowthIcon(stat.growth), { className: "h-4 w-4 mr-1" })}
                    {Math.abs(stat.growth).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution du chiffre d'affaires
          </h3>
          <div className="space-y-4">
            {data.monthlyRevenue.map((item, index) => (
              <div key={item.month} className="flex items-center">
                <span className="text-sm text-gray-600 w-12">{item.month}</span>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.revenue / 70000) * 100}%` }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-green-500 h-2 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-20 text-right">
                  {formatPrice(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Produits les plus vendus
          </h3>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[150px]">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {product.sales} ventes
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatPrice(product.revenue)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Growth */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Évolution des inscriptions clients
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {data.customersByMonth.map((item, index) => (
            <motion.div
              key={item.month}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="h-24 flex items-end justify-center mb-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.customers / 250) * 100}%` }}
                  transition={{ delay: index * 0.1 }}
                  className="w-8 bg-purple-500 rounded-t"
                />
              </div>
              <p className="text-sm font-medium text-gray-900">{item.customers}</p>
              <p className="text-xs text-gray-600">{item.month}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics