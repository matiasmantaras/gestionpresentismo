import { supabase, handleSupabaseError } from '../lib/supabase'

export const getDiezmoOfrendas = async () => {
  try {
    const { data, error } = await supabase
      .from('diezmo_ofrendas')
      .select('*')
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error al obtener diezmos y ofrendas:', error)
    return []
  }
}

export const addDiezmoOfrenda = async (entry) => {
  try {
    const payload = {
      nombre: String(entry.nombre || '').trim(),
      apellido: String(entry.apellido || '').trim(),
      tipo: entry.tipo,
      monto: Number(entry.monto),
      metodo: entry.metodo,
      fecha: entry.fecha,
      created_by_username: 'diezmo',
    }

    if (!payload.nombre && payload.tipo === 'Diezmo') {
      return {
        success: false,
        error: 'El nombre es obligatorio para el diezmo.',
      }
    }

    if (!payload.apellido && payload.tipo === 'Diezmo') {
      return {
        success: false,
        error: 'El apellido es obligatorio para el diezmo.',
      }
    }

    if (!payload.tipo || !payload.monto || !payload.fecha) {
      return {
        success: false,
        error: 'Faltan datos obligatorios.',
      }
    }

    const { data, error } = await supabase
      .from('diezmo_ofrendas')
      .insert([payload])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error al guardar diezmo/ofrenda:', error)
    return handleSupabaseError(error)
  }
}
