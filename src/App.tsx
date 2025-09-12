import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout/Layout'
import ToastContainer from './components/UI/ToastContainer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Categories from './pages/Categories'
import Brands from './pages/Brands'
import About from './pages/About'
import Wishlist from './pages/Wishlist'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Profile from './pages/Profile'
import SearchResults from './pages/SearchResults'
import NotFound from './pages/NotFound'
import PromoBanner from './components/Promotions/PromoBanner'
import AdminLayout from './components/Admin/AdminLayout'
import Dashboard from './pages/Admin/Dashboard'
import ProductManagement from './pages/Admin/ProductManagement'
import ProductForm from './pages/Admin/ProductForm'
import ProductView from './pages/Admin/ProductView'
import OrderManagement from './pages/Admin/OrderManagement'
import CustomerManagement from './pages/Admin/CustomerManagement'
import CategoryManagement from './pages/Admin/CategoryManagement'
import Analytics from './pages/Admin/Analytics'
import Settings from './pages/Admin/Settings'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Admin Routes - Separate from main layout */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/:id" element={<ProductView />} />
                  <Route path="products/:id/edit" element={<ProductForm />} />
                  <Route path="orders" element={<OrderManagement />} />
                  <Route path="customers" element={<CustomerManagement />} />
                  <Route path="categories" element={<CategoryManagement />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="promotions" element={<div className="p-6">Gestion des promotions (à venir)</div>} />
                  <Route path="shipping" element={<div className="p-6">Gestion des livraisons (à venir)</div>} />
                  <Route path="settings" element={<Settings />} />
                </Route>

          {/* Main Routes - With layout */}
          <Route path="/*" element={
            <>
              {/* Promo Header Banner */}
              <PromoBanner type="header" />
              
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ToastContainer />
              </Layout>
              
              {/* Floating Promo Banners */}
              <PromoBanner type="floating" />
            </>
          } />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App