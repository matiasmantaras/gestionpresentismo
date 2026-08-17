import { supabase } from '../lib/supabase'

// ============================================
// FUNCIONES PARA HOGARES DE RUMBO
// ============================================

/**
 * Obtener todos los miembros del hogar de un líder
 * @param {string} liderUsername - Username del líder
 */
export const getMiembrosHogar = async (liderUsername) => {
  try {
    const { data, error } = await supabase
      .from('hogares_rumbo_miembros')
      .select('*')
      .eq('lider_username', liderUsername)
      .eq('activo', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('Error al obtener miembros del hogar:', error)
    return []
  }
}

/**
 * Agregar un nuevo miembro al hogar
 * @param {string} liderUsername - Username del líder
 * @param {object} miembroData - { nombre_miembro, telefono }
 */
export const addMiembroHogar = async (liderUsername, miembroData) => {
  try {
    const { data, error } = await supabase
      .from('hogares_rumbo_miembros')
      .insert([
        {
          lider_username: liderUsername,
          nombre_miembro: miembroData.nombre_miembro,
          telefono: miembroData.telefono,
          activo: true,
        }
      ])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error al agregar miembro:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Actualizar datos de un miembro
 * @param {string} miembroId - ID del miembro
 * @param {object} miembroData - { nombre_miembro, telefono }
 */
export const updateMiembroHogar = async (miembroId, miembroData) => {
  try {
    const { data, error } = await supabase
      .from('hogares_rumbo_miembros')
      .update({
        nombre_miembro: miembroData.nombre_miembro,
        telefono: miembroData.telefono,
        updated_at: new Date().toISOString(),
      })
      .eq('id', miembroId)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error al actualizar miembro:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Eliminar (desactivar) un miembro del hogar
 * @param {string} miembroId - ID del miembro
 */
export const deleteMiembroHogar = async (miembroId) => {
  try {
    const { error } = await supabase
      .from('hogares_rumbo_miembros')
      .update({ activo: false })
      .eq('id', miembroId)
    
    if (error) throw error
    
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar miembro:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Obtener estadísticas del hogar
 * @param {string} liderUsername - Username del líder
 */
export const getEstadisticasHogar = async (liderUsername) => {
  try {
    const { data, error } = await supabase
      .from('hogares_rumbo_miembros')
      .select('*')
      .eq('lider_username', liderUsername)
      .eq('activo', true)
    
    if (error) throw error
    
    return {
      totalMiembros: data.length,
      miembrosConTelefono: data.filter(m => m.telefono && m.telefono.trim() !== '').length,
    }
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return {
      totalMiembros: 0,
      miembrosConTelefono: 0,
    }
  }
}

/**
 * Obtener resumen de todos los hogares (solo para admin)
 */
export const getResumenTodosHogares = async () => {
  try {
    const { data, error } = await supabase
      .from('hogares_rumbo_miembros')
      .select('lider_username')
      .eq('activo', true)
    
    if (error) throw error
    
    // Agrupar por líder
    const resumen = data.reduce((acc, item) => {
      acc[item.lider_username] = (acc[item.lider_username] || 0) + 1
      return acc
    }, {})
    
    return resumen
  } catch (error) {
    console.error('Error al obtener resumen:', error)
    return {}
  }
}
