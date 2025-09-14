import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ShoppingCartIcon, 
  UserIcon, 
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'
import { useRole } from '../../hooks/useRole'
import { useLocalCart } from '../../hooks/useLocalCart'
import { useWishlist } from '../../hooks/useWishlist'
import { supabase } from '../../lib/supabase'
import AdvancedSearchBar from '../Search/AdvancedSearchBar'

const Header: React.FC = () => {
  const { user, signOut } = useAuth()
  const { isAdmin } = useRole()
  const { cartItems } = useLocalCart()
  const { getWishlistCount } = useWishlist()
  
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  // Charger les catégories
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name')
        setCategories(data || [])
      } catch (error) {
      }
    }
    loadCategories()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  // Utiliser cartItems directement pour la réactivité
  const cartItemsCount = React.useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }, [cartItems])
  const wishlistCount = getWishlistCount()

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg hover-lift group-hover:shadow-primary transition-all duration-300">
                <span className="text-white font-bold text-xl">J</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gradient-primary">Jaayma</span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <AdvancedSearchBar 
              onSearch={(query) => {
                navigate(`/search?q=${encodeURIComponent(query)}`)
              }}
              placeholder="Rechercher des produits..."
              className="w-full"
            />
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-gray-700 hover:text-primary-600 font-semibold transition-all duration-300 hover:scale-105">
              Produits
            </Link>
            
            {/* Categories Dropdown - Version Premium */}
            <div className="relative group">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                onMouseEnter={() => setCategoriesOpen(true)}
                className="flex items-center text-gray-700 hover:text-primary-600 font-semibold transition-all duration-300 hover:scale-105 group"
              >
                <span className="relative">
                  Catégories
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
                </span>
                <ChevronDownIcon className={`h-4 w-4 ml-2 transition-all duration-300 ${categoriesOpen ? 'rotate-180 text-primary-600' : ''}`} />
              </button>

              {/* Mega Dropdown Menu */}
              <div
                className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-500 z-50 ${
                  categoriesOpen ? 'opacity-100 visible transform translate-y-0 scale-100' : 'opacity-0 invisible transform translate-y-4 scale-95'
                }`}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500/10 to-blue-500/10 p-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">🛍️ Nos Catégories</h3>
                  <p className="text-sm text-gray-600">Découvrez nos produits par catégorie</p>
                </div>

                {/* Categories Grid */}
                <div className="p-4">
                  <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                    {/* Toutes les catégories */}
                    <Link
                      to="/categories"
                      className="flex items-center group/item px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 transition-all duration-300 border-2 border-transparent hover:border-primary-200/50"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-blue-100 group-hover/item:from-primary-200 group-hover/item:to-blue-200 transition-all duration-300 mr-3">
                        <span className="text-lg">📂</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover/item:text-primary-700 transition-colors">
                          Toutes les catégories
                        </div>
                        <div className="text-xs text-gray-500">
                          Voir l'ensemble de notre catalogue
                        </div>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover/item:text-primary-500 transform group-hover/item:rotate-90 transition-all duration-300" />
                    </Link>

                    {/* Séparateur */}
                    <div className="border-t border-gray-200/50 my-3"></div>

                    {/* Categories individuelles */}
                    {categories.slice(0, 6).map((category, index) => {
                      const categoryIcons = ['👕', '📱', '🏠', '📚', '🎮', '⚽', '🍔', '💄', '🚗', '🎵']
                      const categoryIcon = categoryIcons[index % categoryIcons.length]
                      
                      return (
                        <Link
                          key={category.id}
                          to={`/products?category=${category.id}`}
                          className="flex items-center group/item px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-white/70 hover:to-primary-50/70 transition-all duration-300 border-2 border-transparent hover:border-primary-200/30"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover/item:from-primary-100 group-hover/item:to-primary-200 transition-all duration-300 mr-3 group-hover/item:scale-110">
                            <span className="text-lg">{categoryIcon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 group-hover/item:text-primary-700 transition-colors">
                              {category.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Découvrir la collection
                            </div>
                          </div>
                          <div className="opacity-0 group-hover/item:opacity-100 transition-all duration-300">
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          </div>
                        </Link>
                      )
                    })}

                    {/* Voir plus */}
                    {categories.length > 6 && (
                      <>
                        <div className="border-t border-gray-200/50 my-3"></div>
                        <Link
                          to="/categories"
                          className="flex items-center justify-center group/item px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          <span className="font-semibold mr-2">Voir toutes les catégories</span>
                          <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                            +{categories.length - 6}
                          </span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-3 border-t border-white/10">
                  <div className="text-center text-xs text-gray-600">
                    💫 Nouveautés chaque semaine dans toutes les catégories
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-3 text-gray-700 hover:text-red-500 transition-all duration-300 hover:scale-110 hover-lift"
              title="Ma liste de souhaits"
            >
              <HeartIcon className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-3 text-gray-700 hover:text-primary-600 transition-all duration-300 hover:scale-110 hover-lift"
              title="Mon panier"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg bounce-in">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <UserIcon className="h-6 w-6" />
                  <span className="hidden sm:block">{user.user_metadata.full_name}</span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mon Profil
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mes Commandes
                  </Link>
                  
                  {/* Bouton Administrateur - Visible seulement pour les admins */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 font-medium"
                    >
                      🛡️ Administrateur
                    </Link>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary-600"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <AdvancedSearchBar 
            onSearch={(query) => {
              navigate(`/search?q=${encodeURIComponent(query)}`)
            }}
            placeholder="Rechercher des produits..."
            className="w-full"
          />
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4 glass">
            <div className="flex flex-col space-y-2">
              <Link
                to="/products"
                className="text-gray-700 hover:text-primary-600 font-medium px-4 py-3 hover:bg-white/20 rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📦 Produits
              </Link>
              
              {/* Menu utilisateur mobile */}
              {user && (
                <div className="px-4 py-2 border-t border-white/20">
                  <p className="text-sm font-semibold text-gray-600 mb-2">👤 Mon Compte</p>
                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      className="block text-gray-600 hover:text-primary-600 text-sm py-2 px-3 hover:bg-white/20 rounded transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Mon Profil
                    </Link>
                    <Link
                      to="/orders"
                      className="block text-gray-600 hover:text-primary-600 text-sm py-2 px-3 hover:bg-white/20 rounded transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Mes Commandes
                    </Link>
                    
                    {/* Bouton Administrateur mobile */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block text-white bg-indigo-600 hover:bg-indigo-700 text-sm py-2 px-3 rounded font-medium transition-all"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        🛡️ Administrateur
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMobileMenuOpen(false)
                      }}
                      className="block w-full text-left text-gray-600 hover:text-red-600 text-sm py-2 px-3 hover:bg-white/20 rounded transition-all"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
              
              <div className="px-4 py-2">
                <p className="text-sm font-semibold text-gray-600 mb-2">📂 Catégories</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.id}`}
                      className="text-gray-600 hover:text-primary-600 text-sm py-2 px-3 hover:bg-white/20 rounded transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
                {categories.length > 6 && (
                  <Link
                    to="/categories"
                    className="block text-primary-600 text-sm font-medium mt-2 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Voir toutes les catégories →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
