import { supabase } from '../lib/supabase'

// ============================================
// FUNCIONES DE AUTENTICACIÓN (USUARIO/CONTRASEÑA)
// ============================================

const RESERVED_DIEZMO_USER = {
 username: 'diezmo',
 password: 'diezmo123',
 nombre: 'Diezmo y Ofrendas',
 rol: 'diezmo',
 activo: true,
}

export const ensureDiezmoUserExists = async () => {
 try {
   const { data: existingUser, error: fetchError } = await supabase
     .from('usuarios')
     .select('*')
     .eq('username', RESERVED_DIEZMO_USER.username)
     .maybeSingle()

   if (fetchError && fetchError.code !== 'PGRST116') {
     throw fetchError
   }

   if (!existingUser) {
     const { error: insertError } = await supabase
       .from('usuarios')
       .insert([
         {
           ...RESERVED_DIEZMO_USER,
         },
       ])

     if (insertError) throw insertError

     return { ...RESERVED_DIEZMO_USER }
   }

   const shouldUpdate =
     existingUser.password !== RESERVED_DIEZMO_USER.password ||
     existingUser.nombre !== RESERVED_DIEZMO_USER.nombre ||
     existingUser.rol !== RESERVED_DIEZMO_USER.rol ||
     existingUser.activo !== RESERVED_DIEZMO_USER.activo

   if (shouldUpdate) {
     const { error: updateError } = await supabase
       .from('usuarios')
       .update({
         password: RESERVED_DIEZMO_USER.password,
         nombre: RESERVED_DIEZMO_USER.nombre,
         rol: RESERVED_DIEZMO_USER.rol,
         activo: true,
       })
       .eq('id', existingUser.id)

     if (updateError) throw updateError
   }

   return {
     ...existingUser,
     ...RESERVED_DIEZMO_USER,
   }
 } catch (error) {
   console.error('Error al asegurar el usuario reservado de Diezmo y Ofrendas:', error)
   return null
 }
}

/**
* Iniciar sesión con usuario y contraseña
* @param {string} username
* @param {string} password
*/
export const signIn = async (username, password) => {
  try {
    const normalizedUsername = String(username || '').trim().toLowerCase()
    const normalizedPassword = String(password || '').trim()

    await ensureDiezmoUserExists()

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', normalizedUsername)
      .eq('password', normalizedPassword)
      .eq('activo', true)
      .maybeSingle()
     
    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!data) {
      return {
        success: false,
        error: 'Usuario o contraseña incorrectos',
      }
    }
     
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
    const normalizedUsername = String(username || '').trim().toLowerCase()

    if (normalizedUsername === 'diezmo') {
      return {
        success: false,
        error: 'Ese nombre de usuario está reservado para el acceso exclusivo de Diezmo y Ofrendas',
      }
    }

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
