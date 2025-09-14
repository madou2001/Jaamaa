import React from 'react'
import { useRole } from '../../hooks/useRole'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'

const SecurityInfo: React.FC = () => {
  const { userProfile, isAdmin } = useRole()

  if (!isAdmin) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 mb-1">
            🔒 Sécurité Admin Activée
          </h3>
          <p className="text-sm text-blue-700 mb-2">
            L'accès admin est maintenant protégé. Seuls les utilisateurs avec le rôle 'admin' peuvent accéder à cette section.
          </p>
          <div className="text-xs text-blue-600">
            <p><strong>Votre rôle :</strong> {userProfile?.role}</p>
            <p><strong>Email :</strong> {userProfile?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityInfo
