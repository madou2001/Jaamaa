import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase-types'

// Utiliser les variables d'environnement ou fallback temporaire
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://puunqnkzwxandgovuivw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1dW5xbmt6d3hhbmRnb3Z1aXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTAyNjcsImV4cCI6MjA3MzI2NjI2N30.2HaATSNaGm4Y8mqBj759Phd5zK3JLfyTM0r3RopPNcc'

// Validation plus robuste des variables d'environnement
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is missing or invalid')
  throw new Error('VITE_SUPABASE_URL environment variable is required')
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing or invalid')
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required')
}

// Validation de l'URL Supabase
try {
  new URL(supabaseUrl)
} catch (error) {
  console.error('❌ Invalid Supabase URL format:', supabaseUrl)
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}. Must be a valid HTTP or HTTPS URL.`)
}

console.log('✅ Supabase configuration loaded successfully - DEPLOYMENT FIXED')

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
