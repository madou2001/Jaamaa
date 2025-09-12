import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  TruckIcon,
  ShieldCheckIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useLocalCart } from '../hooks/useLocalCart'
import { useWishlist } from '../hooks/useWishlist'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/UI/Toast'
import OptimizedImage from '../components/UI/OptimizedImage'

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  // Product state
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // UI state
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description')
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [userReview, setUserReview] = useState({ rating: 5, comment: '' })
  const [showReviewForm, setShowReviewForm] = useState(false)
  
  // Hooks
  const { addToCart, isInCart } = useLocalCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { toasts, removeToast, success, error } = useToast()

  useEffect(() => {
    if (slug) {
      fetchProductData()
    }
  }, [slug])

  const fetchProductData = async () => {
    try {
      setLoading(true)
      
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('slug', slug || '')
        .single()

      if (productError) throw productError
      
      const typedProductData = productData as any
      setProduct(typedProductData)

      // Fetch related products (same category)
      if (typedProductData && typedProductData.category_id) {
        const { data: relatedData } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name,
              slug
            )
          `)
          .eq('category_id', typedProductData.category_id)
          .neq('id', typedProductData.id)
          .eq('status', 'active')
          .limit(4)

        setRelatedProducts(relatedData || [])
      }

      // Simulate reviews data (you can replace with real API call)
      const mockReviews = [
        {
          id: 1,
          user: 'Marie D.',
          rating: 5,
          comment: 'Excellent produit, conforme à la description !',
          date: '2024-01-15',
          verified: true
        },
        {
          id: 2,
          user: 'Pierre L.',
          rating: 4,
          comment: 'Très bon rapport qualité-prix, livraison rapide.',
          date: '2024-01-10',
          verified: true
        },
        {
          id: 3,
          user: 'Sophie M.',
          rating: 5,
          comment: 'Je recommande vivement ! Service client au top.',
          date: '2024-01-05',
          verified: false
        }
      ]
      setReviews(mockReviews)
      
      // Calculate average rating
      const avgRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length
      setAverageRating(avgRating)

    } catch (err) {
      console.error('Error fetching product:', err)
      error('Erreur', 'Impossible de charger le produit')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: selectedVariant?.price || product.price,
        image_url: product.image_url
      }, quantity)

      success('Produit ajouté !', `${quantity}x ${product.name} ajouté au panier`)
    } catch (err) {
      error('Erreur', 'Impossible d\'ajouter le produit au panier')
    }
  }

  const handleAddReview = () => {
    const newReview = {
      id: reviews.length + 1,
      user: 'Vous',
      rating: userReview.rating,
      comment: userReview.comment,
      date: new Date().toISOString().split('T')[0],
      verified: false
    }
    
    setReviews([newReview, ...reviews])
    setUserReview({ rating: 5, comment: '' })
    setShowReviewForm(false)
    success('Avis ajouté !', 'Merci pour votre avis')
  }

  const handleToggleWishlist = async () => {
    if (!product) return

    try {
      const added = await toggleWishlist({
        id: product.id,
        name: product.name,
        price: selectedVariant?.price || product.price,
        image_url: product.image_url
      })

      if (added) {
        success('Ajouté aux favoris !', `${product.name} ajouté à votre liste de souhaits`)
      } else {
        success('Retiré des favoris', `${product.name} retiré de vos favoris`)
      }
    } catch (err) {
      error('Erreur', 'Impossible de modifier la liste de souhaits')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    }
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolidIcon
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <div className="h-8 rounded w-1/4 mb-8 smooth-loading"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 rounded smooth-loading"></div>
            <div className="space-y-4">
              <div className="h-8 rounded w-3/4 smooth-loading"></div>
              <div className="h-6 rounded w-1/2 smooth-loading"></div>
              <div className="h-4 rounded w-full smooth-loading"></div>
              <div className="h-4 rounded w-2/3 smooth-loading"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produit introuvable</h2>
          <Link to="/products" className="btn-primary">
          Retour aux produits
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_url || '/placeholder-product.svg']
  const currentPrice = selectedVariant?.price || product.price
  const originalPrice = product.compare_price

  // Debug: afficher les données du produit côté client
  console.log('🛍️ ProductDetail - Product data:', product)
  console.log('🖼️ ProductDetail - Images array:', images)
  console.log('🖼️ ProductDetail - Main image URL:', product.image_url)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-primary-600">Accueil</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Produits</Link>
        {product.categories && (
          <>
            <span>/</span>
            <Link to={`/products?category=${product.categories.id}`} className="hover:text-primary-600">
              {product.categories.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images Section */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <OptimizedImage
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
              fallbackSrc="/placeholder-product.svg"
              onLoad={() => console.log('✅ Image principale chargée:', images[selectedImage])}
              onError={() => console.warn('❌ Erreur image principale:', images[selectedImage])}
            />
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Product Badges */}
            <div className="absolute top-4 left-4 space-y-2">
              {product.featured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                  ⭐ Vedette
                </span>
              )}
              {originalPrice && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                  -{Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}%
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                  }`}
                >
                  <OptimizedImage
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    fallbackSrc="/placeholder-product.svg"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          {/* Header */}
            <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              {renderStars(averageRating)}
              <span className="text-gray-600">({reviews.length} avis)</span>
              <span className="text-gray-600">•</span>
              <span className="text-green-600 font-medium">En stock</span>
          </div>

          {/* Price */}
            <div className="flex items-center space-x-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">
                {formatPrice(currentPrice)}
            </span>
              {originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              {originalPrice && (
                <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                  Économisez {formatPrice(originalPrice - currentPrice)}
                </span>
            )}
            </div>
          </div>

          {/* Quick Description */}
          {product.description && (
            <div className="prose prose-sm text-gray-600">
              <p>{product.description}</p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Quantité:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-50"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-50"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  isInCart(product.id)
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                {isInCart(product.id) ? 'Déjà dans le panier' : 'Ajouter au panier'}
              </button>
              
              <button
                onClick={handleToggleWishlist}
                className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                  isInWishlist(product.id)
                    ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                title={isInWishlist(product.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                {isInWishlist(product.id) ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
              </button>
              
              <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <ShareIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <TruckIcon className="h-5 w-5 text-green-600" />
              <span>Livraison gratuite dès 50€</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <ShieldCheckIcon className="h-5 w-5 text-green-600" />
              <span>Garantie 2 ans</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span>Retour gratuit sous 30 jours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'description', name: 'Description' },
              { id: 'reviews', name: `Avis (${reviews.length})` },
              { id: 'shipping', name: 'Livraison' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
            </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'description' && (
                <div className="prose prose-lg max-w-none">
                  <h3>Description détaillée</h3>
                  <p>{product.description || 'Aucune description disponible pour ce produit.'}</p>
                  
                  <h4>Caractéristiques</h4>
                  <ul>
                    <li>Référence: {product.sku || product.id}</li>
                    <li>Catégorie: {product.categories?.name}</li>
                    {product.featured && <li>Produit vedette</li>}
                  </ul>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  {/* Reviews Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-4xl font-bold text-gray-900">
                        {averageRating.toFixed(1)}
                      </div>
                      <div>
                        {renderStars(averageRating, 'lg')}
                        <p className="text-gray-600 mt-1">Basé sur {reviews.length} avis</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="btn-primary"
                    >
                      Laisser un avis
                    </button>
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-6"
                    >
                      <h4 className="text-lg font-medium mb-4">Laisser un avis</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Note
                          </label>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setUserReview({ ...userReview, rating: star })}
                                className="p-1"
                              >
                                <StarSolidIcon
                                  className={`h-6 w-6 ${
                                    star <= userReview.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Commentaire
                          </label>
                          <textarea
                            value={userReview.comment}
                            onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                            rows={4}
                            className="input-field"
                            placeholder="Partagez votre expérience avec ce produit..."
                          />
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={handleAddReview}
                            disabled={!userReview.comment.trim()}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Publier l'avis
                          </button>
                          <button
                            onClick={() => setShowReviewForm(false)}
                            className="btn-secondary"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-medium">
                                {review.user.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h5 className="font-medium text-gray-900">{review.user}</h5>
                                {review.verified && (
                                  <CheckCircleIcon className="h-4 w-4 text-green-500" title="Achat vérifié" />
                                )}
                              </div>
                              {renderStars(review.rating, 'sm')}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="mt-3 text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="prose prose-lg max-w-none">
                  <h3>Informations de livraison</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Livraison Standard</h4>
                      <p className="text-green-700 text-sm">Gratuite dès 50€</p>
                      <p className="text-green-700 text-sm">3-5 jours ouvrés</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Livraison Express</h4>
                      <p className="text-blue-700 text-sm">9,99€</p>
                      <p className="text-blue-700 text-sm">24-48h</p>
                    </div>
                  </div>
                  
                  <h4>Politique de retour</h4>
                  <p>Retours gratuits sous 30 jours. Le produit doit être dans son état d'origine.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Produits similaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                to={`/products/${relatedProduct.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square bg-gray-100">
                    <OptimizedImage
                      src={relatedProduct.image_url || '/placeholder-product.svg'}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackSrc="/placeholder-product.svg"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {formatPrice(relatedProduct.price)}
            </p>
          </div>
        </div>
              </Link>
            ))}
      </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default ProductDetail
