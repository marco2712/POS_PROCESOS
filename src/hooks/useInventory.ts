import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '../lib/database.types'

type ProductoRow = Database['public']['Tables']['producto']['Row']
type VentaItemRow = Database['public']['Tables']['venta_item']['Row']

interface ProductoInventario extends ProductoRow {
  stock: number
}

interface VentaItemExtendido extends VentaItemRow {
  producto: ProductoRow
}

export function useInventory() {
  const [inventory, setInventory] = useState<ProductoInventario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { org } = useAuth()

  const loadInventory = async () => {
    if (!org?.id) return
    
    try {
      setLoading(true)
      setError(null)

      // 1. Obtener todos los productos de la organización
      const { data: productos, error: productosError } = await supabase
        .from('producto')
        .select('*')
        .eq('org_id', org.id)

      if (productosError) throw productosError
      if (!productos) throw new Error('No se encontraron productos')

      // 2. Obtener todas las ventas de items para calcular el stock
      const { data: ventasItems, error: ventasError } = await supabase
        .from('venta_item')
        .select(`
          id,
          venta_id,
          producto_id,
          cantidad,
          precio_unitario,
          created_at,
          producto:producto_id(*)
        `)
        .eq('producto.org_id', org.id)

      if (ventasError) throw ventasError
      if (!ventasItems) throw new Error('Error al cargar ventas')

      // 3. Calcular el stock por producto
      const inventario = (productos as ProductoRow[]).map(producto => {
        const ventasDelProducto = (ventasItems as VentaItemExtendido[]).filter(
          item => item.producto_id === producto.id
        )
        const stockVendido = ventasDelProducto.reduce(
          (total, item) => total + item.cantidad,
          0
        )
        
        return {
          ...producto,
          stock: -stockVendido // Stock negativo significa ventas
        }
      })

      setInventory(inventario)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el inventario')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [org?.id])

  return {
    inventory,
    loading,
    error,
    reloadInventory: loadInventory
  }
}
