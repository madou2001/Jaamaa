import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase-types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export des types pour utilisation dans l'app
export type { 
  Database, 
  ProductWithRelations, 
  CategoryWithSubcategories, 
  OrderWithItems, 
  CartItemWithProduct,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  ShippingMethod
} from './supabase-types'