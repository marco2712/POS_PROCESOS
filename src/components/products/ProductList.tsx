// src/components/products/ProductList.tsx
import React, { useState } from 'react'
import { useProducts } from '../../hooks/useProducts'
import { useAuth } from '../../contexts/AuthContext'
import type { Producto } from '../../lib/database.types'

interface ProductListProps {
  onEditProduct?: (product: Producto) => void
  onSelectProduct?: (product: Producto) => void
  searchQuery?: string
  selectable?: boolean
}

const ProductList: React.FC<ProductListProps> = ({
  onEditProduct,
  onSelectProduct,
  searchQuery = '',
  selectable = false
}) => {
  const { hasPermission } = useAuth()
  const { products, loading, error, deleteProduct, searchProducts } = useProducts()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Productos filtrados por búsqueda
  const filteredProducts = searchQuery ? searchProducts(searchQuery) : products

  const handleDelete = async (product: Producto) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${product.nombre}"?`)) {
      return
    }

    setDeletingId(product.id)
    try {
      const { success, error } = await deleteProduct(product.id)
      if (!success && error) {
        alert(error)
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando productos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-red-800">Error</h3>
        <p className="text-sm text-red-700 mt-1">{error}</p>
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900">
          {searchQuery ? 'No se encontraron productos' : 'No hay productos'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {searchQuery 
            ? `No hay productos que coincidan con "${searchQuery}"` 
            : 'Comienza creando tu primer producto.'
          }
        </p>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product: Producto) => (
              <tr 
                key={product.id} 
                className={`hover:bg-gray-50 ${selectable ? 'cursor-pointer' : ''}`}
                onClick={() => selectable && onSelectProduct?.(product)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.codigo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPrice(product.precio)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(product.created_at).toLocaleDateString('es-CO')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {selectable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectProduct?.(product)
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Seleccionar
                      </button>
                    )}
                    
                    {hasPermission(['admin', 'manager']) && onEditProduct && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditProduct(product)
                        }}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Editar
                      </button>
                    )}
                    
                    {hasPermission(['admin']) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(product)
                        }}
                        disabled={deletingId === product.id}
                        className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                      >
                        {deletingId === product.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductList