import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useStockValidation } from './useStockValidation'
import { generateSaleNumber } from '../utils/formatters'
import type { Venta } from '../lib/database.types'
import type { Database } from '../lib/database.types'

type DbResult<T> = T extends PromiseLike<infer U> ? U : never
type DbResultOk<T> = T extends Promise<{ data: infer U }> ? U : never

// Tipos para el formulario
export interface VentaFormItem {
  producto_id: number
  cantidad: number
  precio_unitario: number
}

export interface VentaFormData {
  cliente_id?: number | null
  items: VentaFormItem[]
}

// Tipos de retorno
interface UseVentasReturn {
  createVenta: (data: VentaFormData) => Promise<{ success: boolean; venta?: Venta; error?: string }>
  loading: boolean
  error: string | null
}

export const useVentas = (): UseVentasReturn => {
  const { org } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { validateStock } = useStockValidation()

  const createVenta = async (data: VentaFormData): Promise<{ success: boolean; venta?: Venta; error?: string }> => {
    if (!org?.id) {
      return { success: false, error: 'No hay organización seleccionada' }
    }

    // Validar que haya items
    if (!data.items.length) {
      return { success: false, error: 'La venta debe tener al menos un item' }
    }

    // Validar stock para cada item
    for (const item of data.items) {
      const stockValidation = validateStock(item.producto_id, item.cantidad)
      if (!stockValidation.isValid) {
        return { success: false, error: stockValidation.message }
      }
    }

    setLoading(true)
    setError(null)

    try {
      // Crear la venta
      const ventaData = {
        org_id: org.id,
        cliente_id: data.cliente_id,
        numero: generateSaleNumber()
      }

      const { data: ventaResult, error: ventaError } = await supabase
        .from('venta')
        .insert([ventaData])
        .select() as DbResult<ReturnType<typeof supabase.from<'venta'>>>

      if (ventaError || !ventaResult || ventaResult.length === 0) {
        throw new Error(ventaError?.message || 'Error al crear la venta')
      }

      const venta = ventaResult[0] as Venta

      // Crear los items de la venta
      const ventaItems = data.items.map(item => ({
        venta_id: venta.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }))

      const { error: itemsError } = await supabase
        .from('venta_item')
        .insert(ventaItems)

      if (itemsError) {
        // Si hay error al crear los items, eliminar la venta
        await supabase
          .from('venta')
          .delete()
          .match({ id: venta.id })
        throw new Error(itemsError.message)
      }

      return { success: true, venta }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado al crear la venta'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  return {
    createVenta,
    loading,
    error
  }
}
