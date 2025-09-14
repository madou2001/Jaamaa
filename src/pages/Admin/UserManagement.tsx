import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UsersIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: 'admin' | 'moderator' | 'user'
  phone?: string
  created_at: string
  last_sign_in_at?: string
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'moderator' | 'user'>('all')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<'admin' | 'moderator' | 'user'>('user')
  const { success, showError } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('🔍 UserManagement: Début de la récupération des utilisateurs')
      
      // Essayer d'abord de récupérer depuis profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('🔍 UserManagement: Résultat profiles:', { profilesData, profilesError })

      if (profilesError) {
        console.warn('⚠️ UserManagement: Erreur profiles, tentative avec auth.users:', profilesError)
        
        // Fallback: récupérer depuis auth.users si profiles échoue
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
        
        console.log('🔍 UserManagement: Résultat auth.users:', { authData, authError })
        
        if (authError) throw authError
        
        // Transformer les données auth.users en format User
        const transformedUsers: User[] = authData.users.map(user => ({
          id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          full_name: user.user_metadata?.full_name || 
                    `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() ||
                    user.email?.split('@')[0] || '',
          role: 'user', // Par défaut
          phone: user.user_metadata?.phone || '',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at
        }))
        
        console.log('🔍 UserManagement: Utilisateurs transformés:', transformedUsers)
        setUsers(transformedUsers)
      } else {
        console.log('✅ UserManagement: Utilisateurs récupérés depuis profiles:', profilesData)
        setUsers(profilesData || [])
      }
    } catch (error) {
      console.error('❌ UserManagement: Erreur lors de la récupération des utilisateurs:', error)
      showError('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role } : user
      ))
      
      setEditingUser(null)
      success(`Rôle mis à jour vers ${role}`)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error)
      showError('Erreur lors de la mise à jour du rôle')
    }
  }

  const syncAllUsers = async () => {
    try {
      setLoading(true)
      success('Synchronisation en cours...')
      
      // Appeler une fonction SQL pour synchroniser tous les utilisateurs
      const { error } = await supabase.rpc('sync_all_users')
      
      if (error) throw error
      
      // Recharger les utilisateurs
      await fetchUsers()
      success('Synchronisation terminée avec succès')
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error)
      showError('Erreur lors de la synchronisation. Exécutez le script SQL manuellement.')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'moderator': return 'bg-yellow-100 text-yellow-800'
      case 'user': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldCheckIcon className="h-4 w-4" />
      case 'moderator': return <ShieldExclamationIcon className="h-4 w-4" />
      case 'user': return <UsersIcon className="h-4 w-4" />
      default: return <UsersIcon className="h-4 w-4" />
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des Utilisateurs
        </h1>
        <p className="text-gray-600 mt-1">
          Gérez les utilisateurs et leurs rôles dans le système
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg border"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg border"
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg border"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ShieldExclamationIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Modérateurs</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'moderator').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg border"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'user').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Admins</option>
              <option value="moderator">Modérateurs</option>
              <option value="user">Utilisateurs</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={syncAllUsers}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span>Synchroniser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Utilisateurs ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || roleFilter !== 'all' ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche ou de filtre.'
                  : 'Il semble qu\'aucun utilisateur ne soit enregistré dans le système.'
                }
              </p>
              {!searchTerm && roleFilter === 'all' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Conseil :</strong> Exécutez le script <code>sync-all-users.sql</code> 
                    dans Supabase pour synchroniser tous les utilisateurs.
                  </p>
                </div>
              )}
            </div>
          ) : (
            filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-lg">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {user.full_name || `${user.first_name} ${user.last_name}`}
                    </h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Inscrit le {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1 capitalize">{user.role}</span>
                  </div>
                  
                  <button
                    onClick={() => setEditingUser(user)}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Modifier le rôle"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Modifier le rôle de {editingUser.full_name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau rôle
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="user">Utilisateur</option>
                  <option value="moderator">Modérateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => updateUserRole(editingUser.id, newRole)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
