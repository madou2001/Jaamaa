import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/UI/Toast'
import { useCategories } from '../../hooks/useCategories'
import { useAuth } from '../../hooks/useAuth'

interface ProductFormData {
  name: string
  description: string
  price: number
  sku: string
  quantity: number
  category_id: string
  image_url: string
  status: 'active' | 'draft' | 'archived'
  featured: boolean
  tags: string[]
  slug: string
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const { categories } = useCategories()
  const { toasts, removeToast, success, error } = useToast()
  const { user, session } = useAuth()

  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(isEditing)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [newTag, setNewTag] = useState('')

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    sku: '',
    quantity: 0,
    category_id: '',
    image_url: '',
    status: 'draft',
    featured: false,
    tags: [],
    slug: ''
  })

  const [errors, setErrors] = useState<Partial<ProductFormData>>({})

  useEffect(() => {
    if (isEditing && id) {
      fetchProduct(id)
    }
  }, [id, isEditing])

  const fetchProduct = async (productId: string) => {
    try {
      setLoadingProduct(true)
      const { data, error: fetchError } = await (supabase as any)
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (fetchError) throw fetchError

      const product = data as any
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: Number(product.price) || 0,
        sku: product.sku || '',
        quantity: Number(product.quantity) || 0,
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        status: product.status || 'draft',
        featured: Boolean(product.featured),
        tags: product.tags || [],
        slug: product.slug || ''
      })

      if (product.image_url) {
        setImagePreview(product.image_url)
      }
    } catch (err) {
      // console.error('Erreur lors du chargement du produit:', err)
      error('Erreur', 'Impossible de charger le produit')
      navigate('/admin/products')
    } finally {
      setLoadingProduct(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise'
    }

    if (Number(formData.price) <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0'
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'Le SKU est requis'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Le slug est requis'
    }

    if (Number(formData.quantity) < 0) {
      newErrors.quantity = 'La quantité ne peut pas être négative'
    }

    // La catégorie n'est plus requise pour permettre la création de produits même sans catégories
    // if (!formData.category_id) {
    //   newErrors.category_id = 'Une catégorie est requise'
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !session) {
      error('Erreur', 'Vous devez être connecté pour créer un produit')
      return
    }

    if (!validateForm()) {
      error('Erreur', 'Veuillez corriger les erreurs du formulaire')
      return
    }

    try {
      setLoading(true)

      const productData = {
        ...formData,
        updated_at: new Date().toISOString()
      }

      if (isEditing) {
        const { error: updateError } = await (supabase as any)
          .from('products')
          .update(productData)
          .eq('id', id)

        if (updateError) throw updateError

        success('Succès', 'Produit mis à jour avec succès')
      } else {
        const { error: insertError } = await (supabase as any)
          .from('products')
          .insert([{
            ...productData,
            created_at: new Date().toISOString()
          }])

        if (insertError) throw insertError

        success('Succès', 'Produit créé avec succès')
      }

      navigate('/admin/products')
    } catch (err) {
      // console.error('Erreur lors de la sauvegarde:', err)
      error('Erreur', `Impossible de ${isEditing ? 'mettre à jour' : 'créer'} le produit`)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour générer un slug à partir du nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Éviter les tirets multiples
      .trim()
  }

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Générer automatiquement le slug quand le nom change
      if (field === 'name' && typeof value === 'string') {
        newData.slug = generateSlug(value)
      }
      
      return newData
    })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Pour l'instant, on utilise un URL local
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        handleInputChange('image_url', result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loadingProduct) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
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
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit à votre catalogue'}
            </p>
            {user && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Connecté en tant que {user.email}
              </p>
            )}
            {!user && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ Non connecté - Connexion requise pour sauvegarder
              </p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nom du produit"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.sku ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="SKU-001"
              />
              {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.price ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            {/* Quantité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité en stock *
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.quantity ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.category_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">
                  {categories.length > 0 ? 'Sélectionner une catégorie' : 'Aucune catégorie disponible'}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.slug ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="slug-du-produit"
              />
              <p className="text-sm text-gray-500 mt-1">Généré automatiquement à partir du nom</p>
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'draft' | 'archived')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Brouillon</option>
                <option value="active">Actif</option>
                <option value="archived">Archivé</option>
              </select>
            </div>

            {/* Produit vedette */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Produit vedette
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Description détaillée du produit..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Image du produit */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Image du produit</h2>
          
          <div className="space-y-4">
            {/* Upload d'image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de l'image
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => {
                  handleInputChange('image_url', e.target.value)
                  setImagePreview(e.target.value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Ou upload de fichier */}
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">ou</div>
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <PhotoIcon className="h-4 w-4 mr-2" />
                Télécharger une image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Prévisualisation */}
            {imagePreview && (
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Prévisualisation"
                    className="h-48 w-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('')
                      handleInputChange('image_url', '')
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tags</h2>
          
          <div className="space-y-4">
            {/* Ajouter un tag */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ajouter un tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Liste des tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sauvegarde...' : (isEditing ? 'Mettre à jour' : 'Créer le produit')}
          </button>
        </div>
      </form>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default ProductForm
