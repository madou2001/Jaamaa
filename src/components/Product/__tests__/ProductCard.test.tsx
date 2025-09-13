import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductCard } from '../ProductCard'

// Mock product data for testing
const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 99.99,
  image_url: 'https://example.com/test-image.jpg',
  description: 'A test product description',
  category_id: '1',
  brand_id: '1',
  stock_quantity: 10,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

describe('ProductCard', () => {
  it('renders without crashing', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('displays product name and price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
  })
})
