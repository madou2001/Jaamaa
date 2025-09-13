import { useCallback } from 'react'
import { useToast } from './useToast'

export const useErrorHandler = () => {
  const { error: showError } = useToast()

  const handleError = useCallback((error: any, customMessage?: string) => {
    // console.error('Error:', error)
    
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
    
    showError('Erreur', message)
  }, [showError])

  return { handleError }
}
