// src/pages/Sales.tsx
import React from 'react'

const SalesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Ventas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestión de ventas y transacciones
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Nueva Venta
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-6">
          <p className="text-center text-gray-500">
            Funcionalidad de ventas próximamente...
          </p>
        </div>
      </div>
    </div>
  )
}

export default SalesPage
