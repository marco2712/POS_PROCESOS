// src/hooks/useProducts.ts
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import type { PostgrestResponse } from '@supabase/supabase-js'

type Producto = Database['public']['Tables']['producto']['Row']
type ProductoInsert = Database['public']['Tables']['producto']['Insert']
type ProductoUpdate = Database['public']['Tables']['producto']['Update']

// Helper function to handle Supabase types
async function updateProducto(data: ProductoUpdate, id: number): Promise<PostgrestResponse<any>> {
  // @ts-ignore - Known Supabase typing issue
  return supabase.from('producto').update(data).eq('id', id)
}

// Helper function to handle Supabase types
async function insertProducto(data: ProductoInsert): Promise<PostgrestResponse<any>> {
  // @ts-ignore - Known Supabase typing issue
  return supabase.from('producto').insert(data)
}

export interface ProductoFormData {
  codigo: string
  nombre: string
  precio: number
}

interface UseProductsReturn {
  products: Producto[]
  loading: boolean
  error: string | null
  createProduct: (data: ProductoFormData) => Promise<{ success: boolean; error?: string }>
  updateProduct: (id: number, data: ProductoFormData) => Promise<{ success: boolean; error?: string }>
  deleteProduct: (id: number) => Promise<{ success: boolean; error?: string }>
  refreshProducts: () => Promise<void>
  searchProducts: (query: string) => Producto[]
}

export const useProducts = (): UseProductsReturn => {
  const { org } = useAuth()
  const [products, setProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar productos
  const loadProducts = async () => {
    if (!org?.id) {
      setProducts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('producto')
        .select('*')
        .eq('org_id', org.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setProducts(data || [])
    } catch (err) {
      setError('Error cargando productos')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar productos al montar el componente o cambiar la organización
  useEffect(() => {
    loadProducts()
  }, [org?.id])

  // Crear producto
  const createProduct = async (data: ProductoFormData): Promise<{ success: boolean; error?: string }> => {
    if (!org?.id) {
      return { success: false, error: 'No hay organización seleccionada' }
    }

    try {
      const productData = {
        ...data,
        org_id: org.id,
      }

      const { error: insertError } = await insertProducto(productData)

      if (insertError) {
        // Verificar si es error de duplicado de código
        if (insertError.code === '23505') {
          return { success: false, error: 'Ya existe un producto con este código' }
        }
        return { success: false, error: insertError.message }
      }

      // Recargar productos después de crear
      await loadProducts()
      return { success: true }
    } catch (err) {
      console.error('Error creating product:', err)
      return { success: false, error: 'Error inesperado al crear el producto' }
    }
  }

  // Actualizar producto
  const updateProduct = async (id: number, data: ProductoFormData): Promise<{ success: boolean; error?: string }> => {
    if (!org?.id) {
      return { success: false, error: 'No hay organización seleccionada' }
    }

    try {
      const updateData = {
        ...data,
        org_id: org.id
      }

      const { error: updateError } = await updateProducto(updateData, id) // Asegurar que solo actualice productos de la org

      if (updateError) {
        // Verificar si es error de duplicado de código
        if (updateError.code === '23505') {
          return { success: false, error: 'Ya existe un producto con este código' }
        }
        return { success: false, error: updateError.message }
      }

      // Recargar productos después de actualizar
      await loadProducts()
      return { success: true }
    } catch (err) {
      console.error('Error updating product:', err)
      return { success: false, error: 'Error inesperado al actualizar el producto' }
    }
  }

  // Eliminar producto
  const deleteProduct = async (id: number): Promise<{ success: boolean; error?: string }> => {
    if (!org?.id) {
      return { success: false, error: 'No hay organización seleccionada' }
    }

    try {
      const { error: deleteError } = await supabase
        .from('producto')
        .delete()
        .eq('id', id)
        .eq('org_id', org.id) // Asegurar que solo elimine productos de la org

      if (deleteError) {
        // Verificar si hay ventas asociadas
        if (deleteError.code === '23503') {
          return { success: false, error: 'No se puede eliminar el producto porque tiene ventas asociadas' }
        }
        return { success: false, error: deleteError.message }
      }

      // Recargar productos después de eliminar
      await loadProducts()
      return { success: true }
    } catch (err) {
      console.error('Error deleting product:', err)
      return { success: false, error: 'Error inesperado al eliminar el producto' }
    }
  }

  // Refrescar productos
  const refreshProducts = async () => {
    await loadProducts()
  }

  // Buscar productos (US_008)
  const searchProducts = (query: string): Producto[] => {
    if (!query.trim()) {
      return products
    }

    const lowercaseQuery = query.toLowerCase().trim()
    
    return products.filter(product =>
      product.codigo.toLowerCase().includes(lowercaseQuery) ||
      product.nombre.toLowerCase().includes(lowercaseQuery)
    )
  }

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    searchProducts,
  }
}