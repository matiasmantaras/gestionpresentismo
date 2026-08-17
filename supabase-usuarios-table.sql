-- ================================================
-- TABLA DE USUARIOS PARA AUTENTICACIÓN
-- ================================================
-- Ejecutá este SQL en el editor SQL de Supabase
-- (Dashboard > SQL Editor > New Query)

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  rol VARCHAR(20) DEFAULT 'usuario',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsqueda rápida por username
CREATE INDEX idx_usuarios_username ON usuarios(username);

-- Insertar usuario por defecto (admin/admin123)
-- Nota: En producción deberías usar bcrypt, pero para simplicidad usamos texto plano
INSERT INTO usuarios (username, password, nombre, rol)
VALUES ('admin', 'admin123', 'Administrador', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Opcional: Insertar más usuarios de ejemplo
INSERT INTO usuarios (username, password, nombre, rol)
VALUES 
  ('pastor', 'pastor123', 'Pastor Principal', 'admin'),
  ('lider', 'lider123', 'Líder de Ministerio', 'usuario')
ON CONFLICT (username) DO NOTHING;

-- Habilitar RLS (Row Level Security) - opcional
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura a todos (para login)
CREATE POLICY "Permitir lectura de usuarios"
  ON usuarios
  FOR SELECT
  USING (true);

-- Comentarios
COMMENT ON TABLE usuarios IS 'Tabla de usuarios para autenticación del sistema';
COMMENT ON COLUMN usuarios.username IS 'Nombre de usuario único';
COMMENT ON COLUMN usuarios.password IS 'Contraseña (en texto plano por ahora)';
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: admin o usuario';
