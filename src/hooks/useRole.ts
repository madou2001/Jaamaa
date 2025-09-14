import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

export type UserRole = 'admin' | 'user' | 'moderator'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name?: string
  created_at: string
}

export const useRole = () => {
  const { user, loading } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserProfile(null)
        setRoleLoading(false)
        return
      }

      try {
        // Essayer de récupérer le profil depuis la base de données
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          // Fallback: utiliser la logique basée sur l'email si pas de profil en DB
          const isAdmin = user.email === 'admin@jaayma.com' || 
                         user.email === 'madoune.gueye@gmail.com' ||
                         user.email === 'doumass124@gmail.com' ||
                         user.id === '5d5604f2-9d26-4e7e-a202-0ee5d7d74638' ||
                         user.user_metadata?.role === 'admin'

          const fallbackProfile: UserProfile = {
            id: user.id,
            email: user.email || '',
            role: isAdmin ? 'admin' : 'user',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            created_at: user.created_at
          }

          setUserProfile(fallbackProfile)
        } else {
          // Utiliser le profil de la base de données
          // Créer le profil avec la structure correcte
          const userProfile: UserProfile = {
            id: profile.id,
            email: profile.email || user.email || '',
            role: profile.role || 'user',
            full_name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email?.split('@')[0] || '',
            created_at: profile.created_at || user.created_at
          }
          
          setUserProfile(userProfile)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du rôle:', error)
        
        // Fallback en cas d'erreur
        const isAdmin = user.email === 'admin@jaayma.com' || 
                       user.email === 'madoune.gueye@gmail.com' ||
                       user.email === 'doumass124@gmail.com' ||
                       user.id === '5d5604f2-9d26-4e7e-a202-0ee5d7d74638' ||
                       user.user_metadata?.role === 'admin'

        const fallbackProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          role: isAdmin ? 'admin' : 'user',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          created_at: user.created_at
        }

        setUserProfile(fallbackProfile)
      } finally {
        setRoleLoading(false)
      }
    }

    fetchUserRole()
  }, [user])

  const isAdmin = userProfile?.role === 'admin'
  const isModerator = userProfile?.role === 'moderator' || isAdmin
  const isUser = userProfile?.role === 'user'

  return {
    userProfile,
    isAdmin,
    isModerator,
    isUser,
    loading: loading || roleLoading
  }
}
