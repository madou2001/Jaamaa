import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useRole } from '../../hooks/useRole'
// import { motion } from 'framer-motion'
import SilentRedirect from './SilentRedirect'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useAuth()
  const { isAdmin, loading, userProfile } = useRole()

  // Afficher un loader qui ressemble à une page normale pendant le chargement
  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header simulé */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Contenu simulé */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Rediriger vers login si pas connecté
  if (!user) {
    return <Navigate to="/login?redirect=/admin" replace />
  }

  // Vérifier si l'utilisateur est admin
  if (!isAdmin) {
    // Redirection silencieuse vers l'accueil pour masquer l'existence de l'admin
    return <SilentRedirect />
  }

  // Si tout est OK, afficher le contenu admin
  return <>{children}</>
}

export default AdminRoute
