import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  FireIcon,
  TagIcon,
  FolderIcon,
  CubeIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdvancedSearch } from '../../hooks/useAdvancedSearch'

interface AdvancedSearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  showSuggestions?: boolean
}

const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  onSearch,
  placeholder = "Rechercher des produits...",
  className = "",
  showSuggestions = true
}) => {
  const navigate = useNavigate()
  const { generateSuggestions, getRecentSearches, getPopularSearches } = useAdvancedSearch()
  
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true)
        try {
          const newSuggestions = await generateSuggestions(query)
          setSuggestions(newSuggestions)
        } catch (error) {
          // console.error('Erreur suggestions:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, generateSuggestions])

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim())
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowDropdown(false)
      setQuery('')
      inputRef.current?.blur()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return

    const items = getAllSuggestionItems()

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          handleSuggestionClick(items[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }

  const getAllSuggestionItems = () => {
    const items = []
    
    if (query.length === 0) {
      // Récents
      const recent = getRecentSearches()
      items.push(...recent.map(r => ({ type: 'recent', value: r, label: r })))
      
      // Populaires
      const popular = getPopularSearches()
      items.push(...popular.map(p => ({ type: 'popular', value: p, label: p })))
    } else {
      items.push(...suggestions)
    }
    
    return items
  }

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === 'product') {
      navigate(`/products/${suggestion.value}`)
    } else if (suggestion.type === 'category') {
      navigate(`/products?category=${suggestion.value}`)
    } else {
      handleSearch(suggestion.label.replace('Rechercher "', '').replace('"', ''))
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product': return CubeIcon
      case 'category': return FolderIcon
      case 'brand': return TagIcon
      case 'recent': return ClockIcon
      case 'popular': return FireIcon
      default: return MagnifyingGlassIcon
    }
  }

  const getSuggestionTypeText = (type: string) => {
    switch (type) {
      case 'product': return 'Produit'
      case 'category': return 'Catégorie'
      case 'brand': return 'Marque'
      case 'recent': return 'Récent'
      case 'popular': return 'Populaire'
      default: return ''
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
        />
        
        {/* Search Icon */}
        <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        
        {/* Clear/Loading */}
        <div className="absolute right-3 top-3.5">
          {loading ? (
            <div className="h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          ) : query ? (
            <button
              onClick={() => {
                setQuery('')
                setSuggestions([])
                inputRef.current?.focus()
              }}
              className="h-5 w-5 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon />
            </button>
          ) : (
            <button
              onClick={() => handleSearch()}
              className="h-5 w-5 text-primary-600 hover:text-primary-700"
            >
              <MagnifyingGlassIcon />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {query.length === 0 ? (
              /* Empty State - Recent & Popular */
              <div className="p-4">
                {/* Recent Searches */}
                {getRecentSearches().length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Recherches récentes
                    </h4>
                    <div className="space-y-1">
                      {getRecentSearches().map((search, index) => (
                        <button
                          key={search}
                          onClick={() => handleSearch(search)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors ${
                            selectedIndex === index ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                          }`}
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FireIcon className="h-4 w-4 mr-2" />
                    Recherches populaires
                  </h4>
                  <div className="grid grid-cols-2 gap-1">
                    {getPopularSearches().slice(0, 6).map((search, index) => {
                      const adjustedIndex = getRecentSearches().length + index
                      return (
                        <button
                          key={search}
                          onClick={() => handleSearch(search)}
                          className={`text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors ${
                            selectedIndex === adjustedIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                          }`}
                        >
                          {search}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Search Suggestions */
              <div className="py-2">
                {suggestions.length === 0 && !loading ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Aucune suggestion trouvée
                  </div>
                ) : (
                  suggestions.map((suggestion, index) => {
                    const Icon = getSuggestionIcon(suggestion.type)
                    return (
                      <button
                        key={`${suggestion.type}-${suggestion.value}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                          selectedIndex === index ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                        }`}
                      >
                        {suggestion.image ? (
                          <img
                            src={suggestion.image}
                            alt={suggestion.label}
                            className="w-8 h-8 object-cover rounded mr-3"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling!.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className={`w-8 h-8 mr-3 flex items-center justify-center ${suggestion.image ? 'hidden' : ''}`}>
                          <Icon className="h-5 w-5 text-gray-400" />
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className="font-medium">{suggestion.label}</div>
                          {suggestion.type !== 'query' && (
                            <div className="text-xs text-gray-500">
                              {getSuggestionTypeText(suggestion.type)}
                              {suggestion.count && ` • ${suggestion.count} résultats`}
                            </div>
                          )}
                        </div>

                        <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                      </button>
                    )
                  })
                )}

                {/* Search Query Option */}
                {query.trim() && (
                  <button
                    onClick={() => handleSearch()}
                    className={`w-full flex items-center px-4 py-3 text-sm border-t border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedIndex === suggestions.length ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="font-medium">Rechercher "{query}"</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdvancedSearchBar
