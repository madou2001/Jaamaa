import React from 'react'
import { Link } from 'react-router-dom'
import { 
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import { useWishlist } from '../hooks/useWishlist'
import { useLocalCart } from '../hooks/useLocalCart'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/UI/Toast'

const Wishlist: React.FC = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart, isInCart } = useLocalCart()
  const { toasts, removeToast, success, error } = useToast()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const handleAddToCart = async (item: any) => {
    try {
      await addToCart({
        id: item.productId,
        name: item.productName,
        price: item.productPrice,
        image_url: item.productImage
      })
      
      success('Produit ajouté !', `${item.productName} ajouté au panier`)
    } catch (err) {
      error('Erreur', 'Impossible d\'ajouter le produit au panier')
    }
  }

  const handleRemoveItem = (productId: string, productName: string) => {
    removeFromWishlist(productId)
    success('Retiré des favoris', `${productName} retiré de vos favoris`)
  }

  const handleClearWishlist = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider votre liste de souhaits ?')) {
      clearWishlist()
      success('Liste vidée', 'Votre liste de souhaits a été vidée')
    }
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Votre liste de souhaits est vide
          </h2>
          <p className="mt-2 text-gray-600">
            Découvrez nos produits et ajoutez vos favoris ici.
          </p>
          <div className="mt-6">
            <Link to="/products" className="btn-primary">
              Découvrir nos produits
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Ma Liste de Souhaits ({wishlistItems.length} article{wishlistItems.length !== 1 ? 's' : ''})
        </h1>
        {wishlistItems.length > 0 && (
          <button
            onClick={handleClearWishlist}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Vider la liste
          </button>
        )}
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100">
              <img
                src={item.productImage || '/placeholder-product.svg'}
                alt={item.productName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-product.svg'
                }}
              />
              
              {/* Remove button */}
              <button
                onClick={() => handleRemoveItem(item.productId, item.productName)}
                className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                title="Retirer des favoris"
              >
                <XMarkIcon className="h-4 w-4 text-gray-600" />
              </button>

              {/* Wishlist badge */}
              <div className="absolute top-2 left-2">
                <HeartSolidIcon className="h-6 w-6 text-red-500" />
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                {item.productName}
              </h3>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(item.productPrice)}
                </span>
                <span className="text-xs text-gray-500">
                  Ajouté le {new Date(item.addedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    isInCart(item.productId)
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  <ShoppingCartIcon className="h-4 w-4 mr-2" />
                  {isInCart(item.productId) ? 'Déjà dans le panier' : 'Ajouter au panier'}
                </button>
                
                <button
                  onClick={() => handleRemoveItem(item.productId, item.productName)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Retirer
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Actions rapides
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="btn-secondary inline-flex items-center justify-center"
            >
              Continuer mes achats
            </Link>
            <button
              onClick={() => {
                // Ajouter tous les articles de la wishlist au panier
                wishlistItems.forEach(item => {
                  if (!isInCart(item.productId)) {
                    handleAddToCart(item)
                  }
                })
              }}
              className="btn-primary inline-flex items-center justify-center"
              disabled={wishlistItems.every(item => isInCart(item.productId))}
            >
              <ShoppingCartIcon className="h-4 w-4 mr-2" />
              Tout ajouter au panier
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default Wishlist
