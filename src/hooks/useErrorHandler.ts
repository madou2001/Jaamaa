import { useCallback } from 'react'

export const useErrorHandler = () => {

  const handleError = useCallback((error: any, customMessage?: string) => {
    
    let message = customMessage || 'Une erreur est survenue'
    
    if (error?.message) {
      // Handle specific error messages
      if (error.message.includes('auth')) {
        message = 'Erreur d\'authentification'
      } else if (error.message.includes('network')) {
        message = 'Erreur de connexion'
      } else if (error.message.includes('permission')) {
        message = 'Permissions insuffisantes'
      } else {
        message = error.message
      }
    }
    
  }, [showError])

  return { handleError }
}
