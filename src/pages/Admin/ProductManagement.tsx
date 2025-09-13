import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/UI/Toast'
import OptimizedImage from '../../components/UI/OptimizedImage'

interface Product {
  id: string
  name: string
  description: string
  price: number
  sku?: string
  quantity: number
  image_url?: string
  status: 'active' | 'inactive' | 'draft'
  featured: boolean
  created_at: string
  updated_at: string
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all')
  
  const { toasts, removeToast, success, error } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setProducts(data || [])
    } catch (err) {
      error('Erreur', 'Impossible de charger les produits')
    } finally {
      setLoading(false)
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    try {
      const { error: updateError } = await (supabase as any)
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId)

      if (updateError) throw updateError

      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, status: newStatus as 'active' | 'inactive' | 'draft' }
          : product
      ))

      success('Statut mis à jour', `Produit ${newStatus === 'active' ? 'activé' : 'désactivé'}`)
    } catch (err) {
      error('Erreur', 'Impossible de mettre à jour le statut')
    }
  }

  const toggleFeatured = async (productId: string, featured: boolean) => {
    try {
      const { error: updateError } = await (supabase as any)
        .from('products')
        .update({ featured })
        .eq('id', productId)

      if (updateError) throw updateError

      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, featured } : product
      ))

      success('Produit mis à jour', featured ? 'Ajouté aux vedettes' : 'Retiré des vedettes')
    } catch (err) {
      error('Erreur', 'Impossible de mettre à jour le produit')
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (deleteError) throw deleteError

      setProducts(prev => prev.filter(product => product.id !== productId))
      success('Produit supprimé', 'Le produit a été supprimé avec succès')
    } catch (err) {
      error('Erreur', 'Impossible de supprimer le produit')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'inactive': return 'Inactif'
      case 'draft': return 'Brouillon'
      default: return status
    }
  }

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        {/* Filters Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
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
            Gestion des produits
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez votre catalogue ({filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''})
          </p>
        </div>
        
        <Link
          to="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Nouveau produit</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'draft')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="draft">Brouillon</option>
          </select>

          {/* Stats */}
          <div className="text-sm text-gray-600 flex items-center">
            <span className="font-medium">{filteredProducts.length}</span> résultat(s)
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <PhotoIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Essayez de modifier vos filtres de recherche.'
                : 'Commencez par ajouter votre premier produit.'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link
                to="/admin/products/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Ajouter un produit</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <OptimizedImage
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                          fallbackSrc="/placeholder-product.svg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PhotoIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        {product.featured && (
                          <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {product.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.sku && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {product.sku}
                          </span>
                        )}
                        <span className="text-sm text-gray-600">
                          Stock: {product.quantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    {/* Status */}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                      {getStatusText(product.status)}
                    </span>

                    {/* Featured Toggle */}
                    <button
                      onClick={() => toggleFeatured(product.id, !product.featured)}
                      className={`p-2 rounded-lg transition-colors ${
                        product.featured 
                          ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                          : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                      title={product.featured ? 'Retirer des vedettes' : 'Ajouter aux vedettes'}
                    >
                      <StarIcon className={`h-4 w-4 ${product.featured ? 'fill-current' : ''}`} />
                    </button>

                    {/* Status Toggle */}
                    <button
                      onClick={() => toggleProductStatus(product.id, product.status)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        product.status === 'active'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {product.status === 'active' ? 'Désactiver' : 'Activer'}
                    </button>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1">
                      <Link
                        to={`/admin/products/${product.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default ProductManagement
