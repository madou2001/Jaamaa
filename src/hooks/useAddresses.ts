import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface Address {
  id: string
  type: 'home' | 'work' | 'other' | 'shipping' | 'billing'
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  country: string
  isDefault: boolean
  company?: string
  state?: string
  addressLine2?: string
}

export const useAddresses = () => {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchAddresses()
    } else {
      setAddresses([])
      setLoading(false)
    }
  }, [user])

  const fetchAddresses = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data: addressesData, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (addressesError) {
        throw addressesError
      }

      // Transformer les données Supabase au format attendu
      const transformedAddresses = addressesData?.map((addr: any) => ({
        id: addr.id,
        type: addr.type || 'home',
        firstName: addr.first_name || '',
        lastName: addr.last_name || '',
        address: addr.address_line_1 || '',
        addressLine2: addr.address_line_2 || '',
        city: addr.city || '',
        state: addr.state || '',
        postalCode: addr.postal_code || '',
        country: addr.country || '',
        company: addr.company || '',
        isDefault: addr.is_default || false
      })) || []

      setAddresses(transformedAddresses)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des adresses')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultAddress = () => {
    return addresses.find(addr => addr.isDefault) || addresses[0] || null
  }

  const getShippingAddresses = () => {
    return addresses.filter(addr => addr.type === 'shipping' || addr.type === 'home')
  }

  const getBillingAddresses = () => {
    return addresses.filter(addr => addr.type === 'billing' || addr.type === 'home')
  }

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    getDefaultAddress,
    getShippingAddresses,
    getBillingAddresses
  }
}
