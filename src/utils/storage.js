// Sistema de almacenamiento para gestión de presentismo
// Actualmente usa localStorage, preparado para migración fácil a Supabase

const STORAGE_KEYS = {
  miembros: 'presentismo_miembros',
  lideres: 'presentismo_lideres',
  jovenes: 'presentismo_jovenes',
  attendance: {
    miembros: 'presentismo_attendance_miembros',
    lideres: 'presentismo_attendance_lideres',
    jovenes: 'presentismo_attendance_jovenes',
  },
}

// ============================================
// FUNCIONES PARA PERSONAS (Miembros, Líderes, Jóvenes)
// ============================================

export const getMiembros = () => {
  const data = localStorage.getItem(STORAGE_KEYS.miembros)
  return data ? JSON.parse(data) : []
}

export const saveMiembros = (miembros) => {
  localStorage.setItem(STORAGE_KEYS.miembros, JSON.stringify(miembros))
}

export const getLideres = () => {
  const data = localStorage.getItem(STORAGE_KEYS.lideres)
  return data ? JSON.parse(data) : []
}

export const saveLideres = (lideres) => {
  localStorage.setItem(STORAGE_KEYS.lideres, JSON.stringify(lideres))
}

export const getJovenes = () => {
  const data = localStorage.getItem(STORAGE_KEYS.jovenes)
  return data ? JSON.parse(data) : []
}

export const saveJovenes = (jovenes) => {
  localStorage.setItem(STORAGE_KEYS.jovenes, JSON.stringify(jovenes))
}

// ============================================
// FUNCIONES PARA REGISTROS DE ASISTENCIA
// ============================================

export const getAttendanceRecords = (category) => {
  const key = STORAGE_KEYS.attendance[category]
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

export const saveAttendanceRecord = (category, record) => {
  const key = STORAGE_KEYS.attendance[category]
  const records = getAttendanceRecords(category)
  
  // Agregar timestamp si no existe
  const newRecord = {
    ...record,
    timestamp: new Date().toISOString(),
  }
  
  const updatedRecords = [...records, newRecord]
  localStorage.setItem(key, JSON.stringify(updatedRecords))
  
  return updatedRecords
}

// ============================================
// FUNCIONES PARA ESTADÍSTICAS Y DASHBOARD
// ============================================

export const getAttendanceStats = () => {
  const categories = ['miembros', 'lideres', 'jovenes']
  const stats = {}
  
  categories.forEach((category) => {
    // Obtener personas registradas
    let people = []
    if (category === 'miembros') people = getMiembros()
    else if (category === 'lideres') people = getLideres()
    else if (category === 'jovenes') people = getJovenes()
    
    // Obtener registros de asistencia
    const attendanceRecords = getAttendanceRecords(category)
    
    // Filtrar registros del último mes
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    const lastMonthRecords = attendanceRecords.filter((record) => {
      const recordDate = new Date(record.fecha)
      return recordDate >= oneMonthAgo
    })
    
    // Calcular porcentaje de asistencia promedio
    let totalPresentes = 0
    let totalRegistros = 0
    
    lastMonthRecords.forEach((record) => {
      if (record.registros && Array.isArray(record.registros)) {
        const presentes = record.registros.filter((r) => r.estado === 'presente').length
        totalPresentes += presentes
        totalRegistros += record.registros.length
      }
    })
    
    const percentage = totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0
    
    stats[category] = {
      total: people.length,
      percentage: percentage,
      lastMonth: lastMonthRecords,
    }
  })
  
  return stats
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

// Limpiar todos los datos (útil para testing o reset)
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (typeof key === 'string') {
      localStorage.removeItem(key)
    } else if (typeof key === 'object') {
      Object.values(key).forEach((subKey) => {
        localStorage.removeItem(subKey)
      })
    }
  })
}

// Exportar todos los datos (útil para backup o migración)
export const exportAllData = () => {
  return {
    miembros: getMiembros(),
    lideres: getLideres(),
    jovenes: getJovenes(),
    attendance: {
      miembros: getAttendanceRecords('miembros'),
      lideres: getAttendanceRecords('lideres'),
      jovenes: getAttendanceRecords('jovenes'),
    },
    exportDate: new Date().toISOString(),
  }
}

// Importar datos (útil para restore o migración)
export const importAllData = (data) => {
  if (data.miembros) saveMiembros(data.miembros)
  if (data.lideres) saveLideres(data.lideres)
  if (data.jovenes) saveJovenes(data.jovenes)
  
  if (data.attendance) {
    Object.keys(data.attendance).forEach((category) => {
      const records = data.attendance[category]
      if (Array.isArray(records)) {
        const key = STORAGE_KEYS.attendance[category]
        localStorage.setItem(key, JSON.stringify(records))
      }
    })
  }
}
