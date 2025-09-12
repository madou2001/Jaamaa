import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  TagIcon,
  CubeIcon,
  CurrencyEuroIcon,
  PhotoIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/UI/Toast'
import OptimizedImage from '../../components/UI/OptimizedImage'
import { testImageLoad } from '../../utils/testImages'

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
  category_id?: string
  brand?: string
  tags?: string[]
  specifications?: { [key: string]: string }
}

interface Category {
  id: string
  name: string
}

const ProductView: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { toasts, removeToast, success, error } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchProduct(id)
    }
  }, [id])

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true)
      
      // Récupérer le produit
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (productError) throw productError

      setProduct(productData)

      // Récupérer la catégorie si elle existe
      if (productData.category_id) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id, name')
          .eq('id', productData.category_id)
          .single()

        if (!categoryError && categoryData) {
          setCategory(categoryData)
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement du produit:', err)
      error('Erreur', 'Impossible de charger le produit')
      navigate('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async () => {
    if (!product || !window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (deleteError) throw deleteError

      success('Produit supprimé', 'Le produit a été supprimé avec succès')
      navigate('/admin/products')
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      error('Erreur', 'Impossible de supprimer le produit')
    }
  }

  const toggleFeatured = async () => {
    if (!product) return

    try {
      const newFeatured = !product.featured
      const { error: updateError } = await supabase
        .from('products')
        .update({ featured: newFeatured })
        .eq('id', product.id)

      if (updateError) throw updateError

      setProduct(prev => prev ? { ...prev, featured: newFeatured } : null)
      success('Produit mis à jour', newFeatured ? 'Ajouté aux vedettes' : 'Retiré des vedettes')
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err)
      error('Erreur', 'Impossible de mettre à jour le produit')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Produit non trouvé</h3>
        <p className="text-gray-600 mb-6">Le produit demandé n'existe pas ou a été supprimé.</p>
        <Link
          to="/admin/products"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour à la liste
        </Link>
      </div>
    )
  }

  // Debug: afficher l'URL de l'image dans la console
  console.log('🖼️ Product image URL:', product.image_url)
  console.log('🗂️ Product data:', product)
  
  // Test automatique de l'image
  if (product.image_url) {
    testImageLoad(product.image_url).then(success => {
      console.log(`🧪 Test image ${product.image_url}:`, success ? '✅ OK' : '❌ FAIL')
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-1">Détails du produit</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Statut */}
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(product.status)}`}>
            {getStatusText(product.status)}
          </span>

          {/* Actions */}
          <button
            onClick={toggleFeatured}
            className={`p-2 rounded-lg transition-colors ${
              product.featured 
                ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
            }`}
            title={product.featured ? 'Retirer des vedettes' : 'Ajouter aux vedettes'}
          >
            <StarIcon className={`h-5 w-5 ${product.featured ? 'fill-current' : ''}`} />
          </button>

          <Link
            to={`/admin/products/${product.id}/edit`}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <PencilIcon className="h-5 w-5" />
          </Link>

          <button
            onClick={deleteProduct}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.image_url ? (
                <OptimizedImage
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                  fallbackSrc="/placeholder-product.svg"
                  onLoad={() => console.log('✅ Image produit chargée:', product.image_url)}
                  onError={() => console.warn('❌ Erreur image produit:', product.image_url)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center flex-col">
                  <PhotoIcon className="h-16 w-16 text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">Aucune image</p>
                </div>
              )}
            </div>
            
            {product.featured && (
              <div className="flex items-center space-x-2 text-yellow-600">
                <StarIcon className="h-5 w-5 fill-current" />
                <span className="text-sm font-medium">Produit vedette</span>
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="space-y-6">
            {/* Prix et stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CurrencyEuroIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Prix</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {formatPrice(product.price)}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CubeIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Stock</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {product.quantity}
                </p>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="space-y-4">
              {product.sku && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <p className="text-gray-900">{product.sku}</p>
                </div>
              )}

              {category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <p className="text-gray-900">{category.name}</p>
                </div>
              )}

              {product.brand && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                  <p className="text-gray-900">{product.brand}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Spécifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spécifications</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{key}</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Métadonnées */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Créé le:</span>
                  <br />
                  {formatDate(product.created_at)}
                </div>
                <div>
                  <span className="font-medium">Modifié le:</span>
                  <br />
                  {formatDate(product.updated_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default ProductView
