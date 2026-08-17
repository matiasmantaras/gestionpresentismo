import { supabase } from '../lib/supabase'

// ============================================
// FUNCIONES DE AUTENTICACIÓN (USUARIO/CONTRASEÑA)
// ============================================

/**
 * Iniciar sesión con usuario y contraseña
 * @param {string} username
 * @param {string} password
 */
export const signIn = async (username, password) => {
  try {
    // Buscar usuario en la tabla usuarios
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .eq('activo', true)
      .single()
    
    if (error || !data) {
      return {
        success: false,
        error: 'Usuario o contraseña incorrectos',
      }
    }
    
    // Guardar sesión en localStorage
    const session = {
      user: {
        id: data.id,
        username: data.username,
        nombre: data.nombre,
        rol: data.rol,
      },
      timestamp: new Date().toISOString(),
    }
    
    localStorage.setItem('auth_session', JSON.stringify(session))
    
    return {
      success: true,
      user: session.user,
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    return {
      success: false,
      error: error.message || 'Error al iniciar sesión',
    }
  }
}

/**
 * Registrar nuevo usuario
 * @param {string} username
 * @param {string} password
 * @param {string} nombre
 */
export const signUp = async (username, password, nombre) => {
  try {
    // Verificar si el usuario ya existe
    const { data: existing } = await supabase
      .from('usuarios')
      .select('username')
      .eq('username', username)
      .single()
    
    if (existing) {
      return {
        success: false,
        error: 'El nombre de usuario ya está en uso',
      }
    }
    
    // Insertar nuevo usuario
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          username,
          password,
          nombre,
          rol: 'usuario',
          activo: true,
        }
      ])
      .select()
      .single()
    
    if (error) throw error
    
    // Iniciar sesión automáticamente después del registro
    const session = {
      user: {
        id: data.id,
        username: data.username,
        nombre: data.nombre,
        rol: data.rol,
      },
      timestamp: new Date().toISOString(),
    }
    
    localStorage.setItem('auth_session', JSON.stringify(session))
    
    return {
      success: true,
      user: session.user,
      message: 'Usuario registrado exitosamente',
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    return {
      success: false,
      error: error.message || 'Error al registrar usuario',
    }
  }
}

/**
 * Cerrar sesión
 */
export const signOut = async () => {
  try {
    localStorage.removeItem('auth_session')
    
    return { success: true }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    return {
      success: false,
      error: error.message || 'Error al cerrar sesión',
    }
  }
}

/**
 * Obtener sesión actual
 */
export const getSession = async () => {
  try {
    const sessionStr = localStorage.getItem('auth_session')
    
    if (!sessionStr) {
      return {
        success: false,
        session: null,
        user: null,
      }
    }
    
    const session = JSON.parse(sessionStr)
    
    return {
      success: true,
      session,
      user: session.user,
    }
  } catch (error) {
    console.error('Error al obtener sesión:', error)
    return {
      success: false,
      session: null,
      user: null,
    }
  }
}

/**
 * Obtener usuario actual
 */
export const getCurrentUser = async () => {
  try {
    const { user } = await getSession()
    
    return {
      success: !!user,
      user,
    }
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return {
      success: false,
      user: null,
    }
  }
}

/**
 * Listener para cambios en autenticación
 * @param {Function} callback
 */
export const onAuthStateChange = (callback) => {
  // Escuchar cambios en localStorage (por si se cierra sesión en otra pestaña)
  const handleStorageChange = (e) => {
    if (e.key === 'auth_session') {
      const session = e.newValue ? JSON.parse(e.newValue) : null
      callback({ session, user: session?.user || null })
    }
  }
  
  window.addEventListener('storage', handleStorageChange)
  
  // Retornar función para desuscribirse
  return () => {
    window.removeEventListener('storage', handleStorageChange)
  }
}

/**
 * Cambiar contraseña del usuario actual
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const { user } = await getCurrentUser()
    
    if (!user) {
      return {
        success: false,
        error: 'No hay sesión activa',
      }
    }
    
    // Verificar contraseña actual
    const { data: userData, error: verifyError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .eq('password', currentPassword)
      .single()
    
    if (verifyError || !userData) {
      return {
        success: false,
        error: 'Contraseña actual incorrecta',
      }
    }
    
    // Actualizar contraseña
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ password: newPassword })
      .eq('id', user.id)
    
    if (updateError) throw updateError
    
    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    }
  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    return {
      success: false,
      error: error.message || 'Error al cambiar contraseña',
    }
  }
}
