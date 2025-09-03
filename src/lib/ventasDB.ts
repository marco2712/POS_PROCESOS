import { supabase } from './supabase'
import type { Database } from './database.types'

// Tipos de la base de datos
type VentaInsert = Database['public']['Tables']['venta']['Insert']
type VentaItemInsert = Database['public']['Tables']['venta_item']['Insert']

export const ventasDB = {
  async insertVenta(venta: VentaInsert) {
    return supabase
      .from('venta')
      .insert(venta)
      .select()
      .single() as Promise<{
        data: Database['public']['Tables']['venta']['Row'] | null
        error: any
      }>
  },

  async insertVentaItems(items: VentaItemInsert[]) {
    return supabase
      .from('venta_item')
      .insert(items) as Promise<{
        data: null
        error: any
      }>
  },

  async deleteVenta(id: number) {
    return supabase
      .from('venta')
      .delete()
      .eq('id', id) as Promise<{
        data: null
        error: any
      }>
  }
}
