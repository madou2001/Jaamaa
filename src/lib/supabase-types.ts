/**
 * JAAYMA E-COMMERCE DATABASE TYPES
 * Generated from professional schema v2.0
 */

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
export type ProductStatus = 'active' | 'draft' | 'archived' | 'out_of_stock'
export type ShippingMethod = 'standard' | 'express' | 'overnight' | 'pickup'
export type AddressType = 'billing' | 'shipping'
export type DiscountType = 'percentage' | 'fixed_amount'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          date_of_birth: string | null
          avatar_url: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      
      addresses: {
        Row: {
          id: string
          user_id: string
          type: AddressType
          first_name: string
          last_name: string
          company: string | null
          address_line_1: string
          address_line_2: string | null
          city: string
          state: string | null
          postal_code: string
          country: string
          phone: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: AddressType
          first_name: string
          last_name: string
          company?: string | null
          address_line_1: string
          address_line_2?: string | null
          city: string
          state?: string | null
          postal_code: string
          country?: string
          phone?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: AddressType
          first_name?: string
          last_name?: string
          company?: string | null
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          state?: string | null
          postal_code?: string
          country?: string
          phone?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number
          is_featured: boolean
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_featured?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_featured?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      brands: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          website_url: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      products: {
        Row: {
          id: string
          name: string
          slug: string
          short_description: string | null
          description: string | null
          price: number
          compare_price: number | null
          cost_price: number | null
          sku: string | null
          barcode: string | null
          weight: number | null
          dimensions_length: number | null
          dimensions_width: number | null
          dimensions_height: number | null
          track_quantity: boolean
          quantity: number
          low_stock_threshold: number
          allow_backorder: boolean
          status: ProductStatus
          featured: boolean
          category_id: string | null
          brand_id: string | null
          image_url: string | null
          images: string[]
          tags: string[]
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          short_description?: string | null
          description?: string | null
          price: number
          compare_price?: number | null
          cost_price?: number | null
          sku?: string | null
          barcode?: string | null
          weight?: number | null
          dimensions_length?: number | null
          dimensions_width?: number | null
          dimensions_height?: number | null
          track_quantity?: boolean
          quantity?: number
          low_stock_threshold?: number
          allow_backorder?: boolean
          status?: ProductStatus
          featured?: boolean
          category_id?: string | null
          brand_id?: string | null
          image_url?: string | null
          images?: string[]
          tags?: string[]
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          short_description?: string | null
          description?: string | null
          price?: number
          compare_price?: number | null
          cost_price?: number | null
          sku?: string | null
          barcode?: string | null
          weight?: number | null
          dimensions_length?: number | null
          dimensions_width?: number | null
          dimensions_height?: number | null
          track_quantity?: boolean
          quantity?: number
          low_stock_threshold?: number
          allow_backorder?: boolean
          status?: ProductStatus
          featured?: boolean
          category_id?: string | null
          brand_id?: string | null
          image_url?: string | null
          images?: string[]
          tags?: string[]
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          sku: string | null
          price: number | null
          compare_price: number | null
          cost_price: number | null
          quantity: number
          weight: number | null
          image_url: string | null
          position: number
          attributes: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          sku?: string | null
          price?: number | null
          compare_price?: number | null
          cost_price?: number | null
          quantity?: number
          weight?: number | null
          image_url?: string | null
          position?: number
          attributes?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          sku?: string | null
          price?: number | null
          compare_price?: number | null
          cost_price?: number | null
          quantity?: number
          weight?: number | null
          image_url?: string | null
          position?: number
          attributes?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }

      coupons: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: DiscountType
          discount_value: number
          minimum_amount: number
          usage_limit: number | null
          usage_count: number
          user_usage_limit: number
          starts_at: string | null
          ends_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          discount_type: DiscountType
          discount_value: number
          minimum_amount?: number
          usage_limit?: number | null
          usage_count?: number
          user_usage_limit?: number
          starts_at?: string | null
          ends_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          discount_type?: DiscountType
          discount_value?: number
          minimum_amount?: number
          usage_limit?: number | null
          usage_count?: number
          user_usage_limit?: number
          starts_at?: string | null
          ends_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          variant_id?: string | null
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }

      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          email: string
          status: OrderStatus
          payment_status: PaymentStatus
          currency: string
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          total_amount: number
          shipping_method: ShippingMethod
          shipping_address: Record<string, any>
          billing_address: Record<string, any>
          coupon_code: string | null
          notes: string | null
          shipped_at: string | null
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          email: string
          status?: OrderStatus
          payment_status?: PaymentStatus
          currency?: string
          subtotal: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount: number
          shipping_method?: ShippingMethod
          shipping_address: Record<string, any>
          billing_address: Record<string, any>
          coupon_code?: string | null
          notes?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          email?: string
          status?: OrderStatus
          payment_status?: PaymentStatus
          currency?: string
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount?: number
          shipping_method?: ShippingMethod
          shipping_address?: Record<string, any>
          billing_address?: Record<string, any>
          coupon_code?: string | null
          notes?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string | null
          product_name: string
          product_sku: string | null
          variant_name: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          variant_id?: string | null
          product_name: string
          product_sku?: string | null
          variant_name?: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          variant_id?: string | null
          product_name?: string
          product_sku?: string | null
          variant_name?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }

      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }

      product_reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string | null
          rating: number
          title: string | null
          content: string | null
          is_verified_purchase: boolean
          is_approved: boolean
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          content?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          order_id?: string | null
          rating?: number
          title?: string | null
          content?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
      }

      shipping_zones: {
        Row: {
          id: string
          name: string
          countries: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          countries: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          countries?: string[]
          created_at?: string
          updated_at?: string
        }
      }

      shipping_rates: {
        Row: {
          id: string
          zone_id: string
          name: string
          method: ShippingMethod
          price: number
          min_order_amount: number
          max_order_amount: number | null
          estimated_days_min: number | null
          estimated_days_max: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          zone_id: string
          name: string
          method: ShippingMethod
          price: number
          min_order_amount?: number
          max_order_amount?: number | null
          estimated_days_min?: number | null
          estimated_days_max?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          zone_id?: string
          name?: string
          method?: ShippingMethod
          price?: number
          min_order_amount?: number
          max_order_amount?: number | null
          estimated_days_min?: number | null
          estimated_days_max?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    
    Views: {
      product_analytics: {
        Row: {
          id: string
          name: string
          sku: string | null
          price: number
          quantity: number
          total_sold: number
          avg_rating: number
          review_count: number
          created_at: string
        }
      }
      
      sales_analytics: {
        Row: {
          date: string
          order_count: number
          total_revenue: number
          avg_order_value: number
        }
      }
    }
  }
}

// Extended types with relations
export type ProductWithRelations = Database['public']['Tables']['products']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row']
  brands?: Database['public']['Tables']['brands']['Row']
  product_variants?: Database['public']['Tables']['product_variants']['Row'][]
}

export type CategoryWithSubcategories = Database['public']['Tables']['categories']['Row'] & {
  subcategories?: Database['public']['Tables']['categories']['Row'][]
}

export type OrderWithItems = Database['public']['Tables']['orders']['Row'] & {
  order_items?: Database['public']['Tables']['order_items']['Row'][]
}

export type CartItemWithProduct = Database['public']['Tables']['cart_items']['Row'] & {
  products?: ProductWithRelations
  product_variants?: Database['public']['Tables']['product_variants']['Row']
}
