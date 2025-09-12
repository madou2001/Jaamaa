import React, { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  HomeIcon,
  CubeIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  TagIcon,
  TruckIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ArrowLeftOnRectangleIcon,
  TicketIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Appliquer les classes CSS pour éliminer tout espace
  React.useEffect(() => {
    document.documentElement.classList.add('admin-page')
    document.body.classList.add('admin-page')
    
    return () => {
      document.documentElement.classList.remove('admin-page')
      document.body.classList.remove('admin-page')
    }
  }, [])

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/admin',
      icon: HomeIcon,
      current: location.pathname === '/admin'
    },
    {
      name: 'Produits',
      href: '/admin/products',
      icon: CubeIcon,
      current: location.pathname.startsWith('/admin/products')
    },
    {
      name: 'Commandes',
      href: '/admin/orders',
      icon: ShoppingBagIcon,
      current: location.pathname.startsWith('/admin/orders'),
      badge: '3' // Nouvelles commandes
    },
    {
      name: 'Clients',
      href: '/admin/customers',
      icon: UsersIcon,
      current: location.pathname.startsWith('/admin/customers')
    },
    {
      name: 'Catégories',
      href: '/admin/categories',
      icon: TagIcon,
      current: location.pathname.startsWith('/admin/categories')
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      current: location.pathname.startsWith('/admin/analytics')
    },
    {
      name: 'Promotions',
      href: '/admin/promotions',
      icon: TicketIcon,
      current: location.pathname.startsWith('/admin/promotions')
    },
    {
      name: 'Livraisons',
      href: '/admin/shipping',
      icon: TruckIcon,
      current: location.pathname.startsWith('/admin/shipping')
    },
    {
      name: 'Paramètres',
      href: '/admin/settings',
      icon: Cog6ToothIcon,
      current: location.pathname.startsWith('/admin/settings')
    }
  ]

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to="/admin" className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 transition-colors ${
                    item.current ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                  }`}
                />
                {item.name}
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Link
                to="/"
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                Voir le site
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
         {/* Mobile header */}
       <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
         <div className="flex items-center justify-between h-14 px-4">
           <button
             onClick={() => setSidebarOpen(true)}
             className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
           >
             <Bars3Icon className="h-5 w-5" />
           </button>
           
           <h1 className="text-lg font-semibold text-gray-900">
             {navigation.find(item => item.current)?.name || 'Admin'}
           </h1>
           
           <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
             <BellIcon className="h-5 w-5" />
           </button>
         </div>
       </header>

         {/* Desktop header - Supprimé pour éliminer l'espace vide */}

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
