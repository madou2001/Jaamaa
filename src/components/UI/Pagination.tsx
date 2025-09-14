import React from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon 
} from '@heroicons/react/24/outline'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  loading?: boolean
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  loading = false
}) => {
  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = []
    const maxVisiblePages = 7

    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si il y en a peu
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Logique complexe pour les nombreuses pages
      if (currentPage <= 4) {
        // Début : 1, 2, 3, 4, 5, ..., last
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i)
        }
        if (totalPages > 6) {
          pageNumbers.push('...')
          pageNumbers.push(totalPages)
        }
      } else if (currentPage >= totalPages - 3) {
        // Fin : 1, ..., last-4, last-3, last-2, last-1, last
        pageNumbers.push(1)
        if (totalPages > 6) {
          pageNumbers.push('...')
        }
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        // Milieu : 1, ..., current-1, current, current+1, ..., last
        pageNumbers.push(1)
        pageNumbers.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('...')
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center mt-12 mb-8">
      <div className="bg-white/95 backdrop-blur-md shadow-lg border border-gray-200 rounded-2xl px-6 py-4">
        {/* Navigation pagination centrée */}
        <div className="flex justify-center mb-3">
          <div className="flex items-center space-x-1 bg-gray-50 rounded-2xl p-2 shadow-inner">
        {/* Première page */}
        <motion.button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || loading}
          className="p-3 rounded-xl bg-white shadow-md text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-gray-200"
          whileHover={{ scale: currentPage === 1 || loading ? 1 : 1.05 }}
          whileTap={{ scale: currentPage === 1 || loading ? 1 : 0.95 }}
        >
          <ChevronDoubleLeftIcon className="h-5 w-5" />
        </motion.button>

        {/* Page précédente */}
        <motion.button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="p-3 rounded-xl bg-white shadow-md text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-gray-200"
          whileHover={{ scale: currentPage === 1 || loading ? 1 : 1.05 }}
          whileTap={{ scale: currentPage === 1 || loading ? 1 : 0.95 }}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </motion.button>

        {/* Numéros de pages */}
        {getPageNumbers().map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            )
          }

          const isCurrentPage = pageNum === currentPage

          return (
            <motion.button
              key={pageNum}
              onClick={() => onPageChange(pageNum as number)}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isCurrentPage
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 shadow-md'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              whileHover={{ 
                scale: loading ? 1 : 1.1,
                y: loading || isCurrentPage ? 0 : -2
              }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              initial={false}
              animate={{
                scale: isCurrentPage ? 1.1 : 1
              }}
            >
              {pageNum}
            </motion.button>
          )
        })}

        {/* Page suivante */}
        <motion.button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="p-3 rounded-xl bg-white shadow-md text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-gray-200"
          whileHover={{ scale: currentPage === totalPages || loading ? 1 : 1.05 }}
          whileTap={{ scale: currentPage === totalPages || loading ? 1 : 0.95 }}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </motion.button>

        {/* Dernière page */}
        <motion.button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
          className="p-3 rounded-xl bg-white shadow-md text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-gray-200"
          whileHover={{ scale: currentPage === totalPages || loading ? 1 : 1.05 }}
          whileTap={{ scale: currentPage === totalPages || loading ? 1 : 0.95 }}
        >
          <ChevronDoubleRightIcon className="h-5 w-5" />
        </motion.button>
          </div>
        </div>
        
        {/* Informations sur les résultats centrées */}
        <div className="text-center">
          <div className="text-sm text-gray-600">
            Affichage de <span className="font-semibold text-indigo-600">{startItem}</span> à{' '}
            <span className="font-semibold text-indigo-600">{endItem}</span> sur{' '}
            <span className="font-semibold text-indigo-600">{totalItems}</span> résultats
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pagination
