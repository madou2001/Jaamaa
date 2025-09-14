import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'

const SilentRedirect: React.FC = () => {
  useEffect(() => {
    // Log de sécurité (optionnel - à supprimer en production)
    console.warn('🚨 Tentative d\'accès non autorisé à l\'admin détectée')
  }, [])

  // Redirection immédiate et silencieuse vers l'accueil
  return <Navigate to="/" replace />
}

export default SilentRedirect
