import { useInventory } from './useInventory'

export interface StockValidationResult {
  isValid: boolean
  message: string
  availableStock: number
}

export const useStockValidation = () => {
  const { inventory, loading, error } = useInventory()

  const validateStock = (productId: number, requestedQuantity: number): StockValidationResult => {
    // Si hay error o está cargando, no permitir la venta
    if (error || loading) {
      return {
        isValid: false,
        message: 'No se puede validar el stock en este momento',
        availableStock: 0
      }
    }

    // Encontrar el producto en el inventario
    const product = inventory.find(item => item.id === productId)

    // Si no se encuentra el producto
    if (!product) {
      return {
        isValid: false,
        message: 'Producto no encontrado en el inventario',
        availableStock: 0
      }
    }

    // Calcular stock disponible (recordar que stock negativo significa ventas)
    const availableStock = Math.abs(product.stock)

    // Validar si hay suficiente stock
    if (requestedQuantity > availableStock) {
      return {
        isValid: false,
        message: `Stock insuficiente. Stock disponible: ${availableStock}`,
        availableStock
      }
    }

    // Si todo está bien
    return {
      isValid: true,
      message: 'Stock disponible',
      availableStock
    }
  }

  return {
    validateStock,
    loading,
    error
  }
}
