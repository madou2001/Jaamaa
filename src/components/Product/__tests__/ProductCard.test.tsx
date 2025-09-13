import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProductCard from '../ProductCard'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

// Mock OptimizedImage component
vi.mock('../UI/OptimizedImage', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />
}))

// Mock product data for testing
const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 99.99,
  image_url: 'https://example.com/test-image.jpg',
  description: 'A test product description',
  slug: 'test-product',
  category_id: '1',
  brand_id: '1',
  quantity: 10,
  is_active: true,
  track_quantity: true,
  allow_backorder: false,
  featured: false,
  compare_price: null,
  images: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Wrapper component for tests that need router
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('ProductCard', () => {
  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    )
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('displays product name and price', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    )
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('99,99 €')).toBeInTheDocument() // French currency format
  })

  it('shows stock information when track_quantity is enabled', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    )
    expect(screen.getByText('En stock (10 disponibles)')).toBeInTheDocument()
  })
})
