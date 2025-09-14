import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  CheckCircleIcon,
  TruckIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PrinterIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      if (!orderId) {
        setLoading(false)
        return
      }

      // Récupérer la commande depuis Supabase avec ses articles
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single()

      if (orderError) {
        
        // Fallback vers localStorage pour les anciennes commandes
        const localOrderData = localStorage.getItem(`order_${orderId}`)
        if (localOrderData) {
          setOrder(JSON.parse(localOrderData))
        }
      } else {
        // Transformer les données pour correspondre au format attendu
        const orderDataTyped = orderData as any
        const transformedOrder = {
          id: orderDataTyped.id,
          order_number: orderDataTyped.order_number,
          items: orderDataTyped.order_items?.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            productPrice: item.unit_price,
            quantity: item.quantity,
            productImage: '/placeholder-product.svg' // Image par défaut
          })) || [],
          shippingInfo: {
            firstName: orderDataTyped.shipping_address?.first_name || '',
            lastName: orderDataTyped.shipping_address?.last_name || '',
            email: orderDataTyped.email,
            phone: orderDataTyped.shipping_address?.phone || '',
            address: orderDataTyped.shipping_address?.address_line_1 || '',
            city: orderDataTyped.shipping_address?.city || '',
            postalCode: orderDataTyped.shipping_address?.postal_code || '',
            country: orderDataTyped.shipping_address?.country || ''
          },
          shippingMethod: orderDataTyped.shipping_method,
          subtotal: orderDataTyped.subtotal,
          shippingCost: orderDataTyped.shipping_amount,
          tax: orderDataTyped.tax_amount,
          total: orderDataTyped.total_amount,
          status: orderDataTyped.status,
          createdAt: orderDataTyped.created_at,
          // Informations de paiement par défaut (masquées pour la sécurité)
          paymentInfo: {
            cardNumber: '**** **** **** 1234',
            cardholderName: `${orderDataTyped.shipping_address?.first_name || ''} ${orderDataTyped.shipping_address?.last_name || ''}`.trim(),
            expiryDate: '**/**',
            cvv: '***'
          }
        }

        setOrder(transformedOrder)
      }
    } catch (error) {
    } finally {
      setLoading(false)
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4 smooth-loading"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto smooth-loading"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Commande introuvable</h2>
          <p className="text-gray-600 mb-6">
            Nous n'avons pas pu trouver cette commande.
          </p>
          <Link to="/products" className="btn-primary">
            Continuer mes achats
          </Link>
        </div>
      </div>
    )
  }

  // Vérification de sécurité pour paymentInfo
  if (!order.paymentInfo) {
    order.paymentInfo = {
      cardNumber: '**** **** **** 1234',
      cardholderName: `${order.shippingInfo?.firstName || ''} ${order.shippingInfo?.lastName || ''}`.trim() || 'Non spécifié',
      expiryDate: '**/**',
      cvv: '***'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Commande confirmée !
        </h1>
        <p className="text-lg text-gray-600">
          Merci pour votre achat. Votre commande a été traitée avec succès.
        </p>
      </motion.div>

      {/* Order Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Détails de la commande
          </h2>
          <button
            onClick={handlePrint}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Imprimer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Numéro de commande</h3>
            <p className="text-gray-600">{order.id}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Date de commande</h3>
            <p className="text-gray-600">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Statut</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {order.status === 'confirmed' ? 'Confirmée' : order.status}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Total</h3>
            <p className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</p>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-medium text-gray-900 mb-4">Articles commandés</h3>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center space-x-4">
                <img
                  src={item.productImage || '/placeholder-product.svg'}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.productName}</h4>
                  <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                  <p className="text-sm text-gray-600">Prix unitaire: {formatPrice(item.productPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatPrice(item.productPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Livraison</span>
              <span>{formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>TVA (20%)</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Shipping & Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <TruckIcon className="h-5 w-5 mr-2 text-primary-600" />
            Adresse de livraison
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
            <p>{order.shippingInfo.address}</p>
            <p>{order.shippingInfo.postalCode} {order.shippingInfo.city}</p>
            <p>{order.shippingInfo.country}</p>
            {order.shippingInfo.phone && <p>Tél: {order.shippingInfo.phone}</p>}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900">Mode de livraison</p>
            <p className="text-sm text-gray-600">
              {order.shippingMethod === 'express' ? 'Livraison express (24-48h)' : 'Livraison standard (3-5 jours)'}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-600" />
            Informations de paiement
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Carte bancaire</p>
            <p>{order.paymentInfo?.cardNumber || '**** **** **** 1234'}</p>
            <p>Titulaire: {order.paymentInfo?.cardholderName || 'Non spécifié'}</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900">Email de confirmation</p>
            <p className="text-sm text-gray-600">{order.shippingInfo.email}</p>
          </div>
        </motion.div>
      </div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 rounded-lg p-6 mb-6"
      >
        <h3 className="font-semibold text-blue-900 mb-4">Prochaines étapes</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center">
            <EnvelopeIcon className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-blue-800">
              Un email de confirmation a été envoyé à {order.shippingInfo.email}
            </span>
          </div>
          <div className="flex items-center">
            <TruckIcon className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-blue-800">
              Votre commande sera préparée et expédiée dans les 24 heures
            </span>
          </div>
          <div className="flex items-center">
            <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-blue-800">
              Vous recevrez un numéro de suivi par email
            </span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link to="/products" className="btn-secondary inline-flex items-center justify-center">
          Continuer mes achats
        </Link>
        <Link to="/profile" className="btn-primary inline-flex items-center justify-center">
          Voir mes commandes
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </Link>
      </motion.div>
    </div>
  )
}

export default OrderConfirmation
