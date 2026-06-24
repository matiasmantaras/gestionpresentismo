import { supabase, handleSupabaseError } from '../lib/supabase'

// ============================================
// FUNCIONES PARA PERSONAS
// ============================================

/**
 * Obtener todas las personas de una categoría
 * @param {string} categoria - 'miembros' | 'lideres' | 'jovenes'
 */
export const getPersonas = async (categoria) => {
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('categoria', categoria)
      .order('nombre', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error al obtener ${categoria}:`, error)
    return []
  }
}

/**
 * Agregar una nueva persona
 * @param {string} categoria - 'miembros' | 'lideres' | 'jovenes'
 * @param {object} personaData - Datos de la persona
 */
export const addPersona = async (categoria, personaData) => {
  try {
    // Generar QR code único
    const qrCode = `${categoria}_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    const { data, error } = await supabase
      .from('personas')
      .insert([{
        ...personaData,
        categoria,
        qr_code: qrCode,
      }])
      .select()
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error al agregar persona:', error)
    return handleSupabaseError(error)
  }
}

/**
 * Eliminar una persona
 * @param {string} id - UUID de la persona
 */
export const deletePersona = async (id) => {
  try {
    const { error } = await supabase
      .from('personas')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar persona:', error)
    return handleSupabaseError(error)
  }
}

/**
 * Buscar persona por QR code
 * @param {string} qrCode - Código QR escaneado
 */
export const getPersonaByQR = async (qrCode) => {
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('qr_code', qrCode)
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error al buscar persona por QR:', error)
    return handleSupabaseError(error)
  }
}

// ============================================
// FUNCIONES PARA ASISTENCIAS
// ============================================

/**
 * Registrar asistencia de múltiples personas
 * @param {string} categoria - 'miembros' | 'lideres' | 'jovenes'
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} tipoEvento - Tipo de evento/culto
 * @param {array} registros - Array de {id, estado}
 */
export const registrarAsistencia = async (categoria, fecha, tipoEvento, registros) => {
  try {
    // Preparar los registros para insertar
    const asistencias = registros.map(registro => ({
      persona_id: registro.id,
      fecha,
      estado: registro.estado,
      tipo_evento: tipoEvento,
      categoria,
    }))
    
    // Insertar en batch
    const { data, error } = await supabase
      .from('asistencias')
      .insert(asistencias)
      .select()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error al registrar asistencia:', error)
    return handleSupabaseError(error)
  }
}

/**
 * Registrar asistencia individual (para escaneo QR)
 * @param {string} personaId - UUID de la persona
 * @param {string} categoria - Categoría de la persona
 * @param {string} tipoEvento - Tipo de evento
 */
export const registrarAsistenciaIndividual = async (personaId, categoria, tipoEvento) => {
  try {
    const fecha = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('asistencias')
      .insert([{
        persona_id: personaId,
        fecha,
        estado: 'presente',
        tipo_evento: tipoEvento,
        categoria,
      }])
      .select()
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    // Si el error es de duplicado, es porque ya se registró hoy
    if (error.code === '23505') {
      return {
        success: false,
        error: 'Esta persona ya fue registrada hoy para este evento',
        isDuplicate: true
      }
    }
    console.error('Error al registrar asistencia individual:', error)
    return handleSupabaseError(error)
  }
}

/**
 * Obtener registros de asistencia por categoría
 * @param {string} categoria - 'miembros' | 'lideres' | 'jovenes'
 * @param {number} limit - Límite de registros (default 30)
 */
export const getAsistencias = async (categoria, limit = 30) => {
  try {
    const { data, error } = await supabase
      .from('asistencias')
      .select(`
        *,
        personas:persona_id (
          id,
          nombre,
          email
        )
      `)
      .eq('categoria', categoria)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error al obtener asistencias de ${categoria}:`, error)
    return []
  }
}

/**
 * Obtener asistencias recientes (últimos 30 días) de todas las categorías
 */
export const getAsistenciasRecientes = async () => {
  try {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - 30)
    
    const { data, error } = await supabase
      .from('asistencias')
      .select(`
        *,
        personas:persona_id (
          nombre,
          categoria
        )
      `)
      .gte('fecha', fechaLimite.toISOString().split('T')[0])
      .order('fecha', { ascending: false })
      .limit(50)
    
    if (error) throw error
    
    // Agrupar por fecha y tipo de evento
    const agrupadas = {}
    data.forEach(asistencia => {
      const key = `${asistencia.fecha}_${asistencia.tipo_evento}_${asistencia.categoria}`
      if (!agrupadas[key]) {
        agrupadas[key] = {
          fecha: asistencia.fecha,
          tipo: asistencia.tipo_evento,
          categoria: asistencia.categoria,
          registros: []
        }
      }
      agrupadas[key].registros.push({
        nombre: asistencia.personas.nombre,
        estado: asistencia.estado
      })
    })
    
    return Object.values(agrupadas)
  } catch (error) {
    console.error('Error al obtener asistencias recientes:', error)
    return []
  }
}

// ============================================
// FUNCIONES PARA ESTADÍSTICAS
// ============================================

/**
 * Obtener estadísticas completas del sistema
 */
export const getEstadisticas = async () => {
  try {
    // Obtener conteo de personas por categoría
    const { data: personas, error: errorPersonas } = await supabase
      .from('personas')
      .select('categoria')
    
    if (errorPersonas) throw errorPersonas
    
    // Obtener asistencias recientes
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - 30)
    
    const { data: asistencias, error: errorAsistencias } = await supabase
      .from('asistencias')
      .select('categoria, estado, fecha')
      .gte('fecha', fechaLimite.toISOString().split('T')[0])
    
    if (errorAsistencias) throw errorAsistencias
    
    // Calcular estadísticas por categoría
    const stats = {
      miembros: calcularEstadisticasCategoria('miembros', personas, asistencias),
      lideres: calcularEstadisticasCategoria('lideres', personas, asistencias),
      jovenes: calcularEstadisticasCategoria('jovenes', personas, asistencias),
    }
    
    return stats
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return {
      miembros: { total: 0, percentage: 0, lastMonth: [] },
      lideres: { total: 0, percentage: 0, lastMonth: [] },
      jovenes: { total: 0, percentage: 0, lastMonth: [] },
    }
  }
}

/**
 * Calcular estadísticas de una categoría específica
 */
const calcularEstadisticasCategoria = (categoria, personas, asistencias) => {
  const personasCategoria = personas.filter(p => p.categoria === categoria)
  const asistenciasCategoria = asistencias.filter(a => a.categoria === categoria)
  
  const presentes = asistenciasCategoria.filter(a => a.estado === 'presente').length
  const total = asistenciasCategoria.length
  
  return {
    total: personasCategoria.length,
    percentage: total > 0 ? Math.round((presentes / total) * 100) : 0,
    lastMonth: asistenciasCategoria,
  }
}

// ============================================
// FUNCIONES DE MIGRACIÓN (localStorage → Supabase)
// ============================================

/**
 * Migrar datos de localStorage a Supabase
 * IMPORTANTE: Ejecutar solo una vez para migrar datos existentes
 */
export const migrarDatosLocalStorage = async () => {
  try {
    const resultados = {
      miembros: 0,
      lideres: 0,
      jovenes: 0,
      errores: []
    }
    
    // Migrar cada categoría
    for (const categoria of ['miembros', 'lideres', 'jovenes']) {
      const key = `presentismo_${categoria}`
      const datosLocal = localStorage.getItem(key)
      
      if (datosLocal) {
        const personas = JSON.parse(datosLocal)
        
        for (const persona of personas) {
          const resultado = await addPersona(categoria, {
            nombre: persona.nombre,
            email: persona.email,
            telefono: persona.telefono,
            ministerio: persona.ministerio,
          })
          
          if (resultado.success) {
            resultados[categoria]++
          } else {
            resultados.errores.push(`Error al migrar ${persona.nombre}`)
          }
        }
      }
    }
    
    console.log('✅ Migración completada:', resultados)
    return resultados
  } catch (error) {
    console.error('❌ Error en migración:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// COMPATIBILIDAD CON API ANTIGUA
// ============================================
// Estas funciones mantienen la misma interfaz que storage.js
// para que no tengas que cambiar nada en los componentes

export const getMiembros = () => getPersonas('miembros')
export const getLideres = () => getPersonas('lideres')
export const getJovenes = () => getPersonas('jovenes')

export const saveMiembros = async (personas) => {
  // Esta función ya no es necesaria con Supabase
  console.warn('saveMiembros ya no es necesario, usar addPersona en su lugar')
}

export const saveLideres = async (personas) => {
  console.warn('saveLideres ya no es necesario, usar addPersona en su lugar')
}

export const saveJovenes = async (personas) => {
  console.warn('saveJovenes ya no es necesario, usar addPersona en su lugar')
}

export const getAttendanceRecords = (categoria) => getAsistencias(categoria)
export const getAttendanceStats = getEstadisticas
