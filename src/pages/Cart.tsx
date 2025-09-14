import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ShoppingCartIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  HeartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { useLocalCart } from '../hooks/useLocalCart'
import { useWishlist } from '../hooks/useWishlist'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/UI/Toast'

const Cart: React.FC = () => {
  const { 
    cartItems, 
    initialized,
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartItemsCount 
  } = useLocalCart()
  
  const { addToWishlist } = useWishlist()
  const { toasts, success, error: showError } = useToast()
  const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null)

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setUpdatingQuantity(cartItemId)
    try {
      updateCartItem(cartItemId, newQuantity)
    } catch (err) {
      showError('Erreur', 'Impossible de mettre à jour la quantité')
    } finally {
      setUpdatingQuantity(null)
    }
  }

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      removeFromCart(cartItemId)
      success('Succès', 'Produit retiré du panier')
    } catch (err) {
      showError('Erreur', 'Impossible de retirer le produit')
    }
  }

  const handleMoveToWishlist = async (cartItem: any) => {
    try {
      await addToWishlist({
        id: cartItem.productId,
        name: cartItem.productName,
        price: cartItem.productPrice || 0,
        image_url: cartItem.productImage
      })
      removeFromCart(cartItem.id)
      success('Succès', 'Produit déplacé vers la liste de souhaits')
    } catch (err) {
      showError('Erreur', 'Impossible de déplacer le produit')
    }
  }

  const handleClearCart = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      try {
        clearCart()
        success('Succès', 'Panier vidé')
      } catch (err) {
        showError('Erreur', 'Impossible de vider le panier')
      }
    }
  }

  const subtotal = getCartTotal()
  const shipping = subtotal >= 50 ? 0 : 4.99
  const tax = subtotal * 0.20
  const total = subtotal + shipping + tax

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du panier...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingCartIcon className="h-24 w-24 text-gray-400 mx-auto mb-8" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 mb-8">
            Découvrez notre collection et ajoutez vos produits favoris !
          </p>
          <div className="space-y-4">
            <Link 
              to="/products" 
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Panier</h1>
          <p className="text-gray-600 mt-2">{getCartItemsCount()} article(s) dans votre panier</p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.productImage || '/placeholder-product.svg'}
                        alt={item.productName}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900">{item.productName}</h3>
                      <p className="text-primary-600 font-semibold">{(item.productPrice || 0).toFixed(2)} €</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingQuantity === item.id}
                        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updatingQuantity === item.id}
                        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className="text-lg font-semibold text-gray-900">
                      {((item.productPrice || 0) * item.quantity).toFixed(2)} €
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMoveToWishlist(item)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Ajouter aux favoris"
                      >
                        <HeartIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="mt-6 flex justify-between items-center pt-6 border-t border-gray-200">
                <Link 
                  to="/products"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Continuer mes achats
                </Link>
                
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Vider le panier
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé de la commande</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{subtotal.toFixed(2)} €</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} €`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span className="font-medium">{tax.toFixed(2)} €</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>

                </div>

              </div>

              {subtotal < 50 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <TruckIcon className="h-4 w-4 inline mr-1" />
                    Ajoutez {(50 - subtotal).toFixed(2)} € pour la livraison gratuite !
                  </p>
                </div>
              )}

              <Link
                to="/checkout"
                className="w-full mt-6 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                Passer la commande
              </Link>

              {/* Trust Indicators */}
              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-2 text-green-500" />
                  Paiement sécurisé
                </div>
                <div className="flex items-center">
                  <TruckIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Livraison sous 3-5 jours
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={() => {}} />
    </div>
  )
}

export default Cart
