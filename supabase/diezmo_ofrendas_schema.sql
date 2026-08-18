-- =========================================================
-- Tabla: public.diezmo_ofrendas
-- =========================================================
-- Objetivo:
-- Guardar los ingresos de Diezmo y Ofrendas registrados por el
-- usuario exclusivo autorizado para esa sección.
--
-- Importante:
-- Este proyecto usa autenticación personalizada con localStorage,
-- no Supabase Auth. Por eso la restricción principal se aplica en
-- la app por rol (usuario 'diezmo'), y esta tabla se usa como store
-- real para los movimientos.
-- =========================================================

CREATE TABLE IF NOT EXISTS public.diezmo_ofrendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT,
  apellido TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('Diezmo', 'Ofrenda')),
  monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  metodo TEXT NOT NULL DEFAULT 'Efectivo',
  fecha DATE NOT NULL,
  created_by_username TEXT NOT NULL DEFAULT 'diezmo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diezmo_ofrendas_fecha
ON public.diezmo_ofrendas (fecha DESC);

CREATE INDEX IF NOT EXISTS idx_diezmo_ofrendas_tipo
ON public.diezmo_ofrendas (tipo);

CREATE INDEX IF NOT EXISTS idx_diezmo_ofrendas_created_by
ON public.diezmo_ofrendas (created_by_username);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_diezmo_ofrendas_updated_at ON public.diezmo_ofrendas;
CREATE TRIGGER trg_diezmo_ofrendas_updated_at
BEFORE UPDATE ON public.diezmo_ofrendas
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- Usuario reservado para la sección
-- =========================================================
-- Este usuario debe existir en la tabla public.usuarios
-- para que la app permita acceder a la sección Diezmo y Ofrendas.

INSERT INTO public.usuarios (username, password, nombre, rol, activo)
SELECT 'diezmo', 'diezmo123', 'Diezmo y Ofrendas', 'diezmo', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios WHERE username = 'diezmo'
);

UPDATE public.usuarios
SET password = 'diezmo123',
    nombre = 'Diezmo y Ofrendas',
    rol = 'diezmo',
    activo = true
WHERE username = 'diezmo';

-- =========================================================
-- Validación recomendada en Supabase
-- =========================================================
-- En la app, la restricción se hace así:
--   - el usuario actual debe venir de public.usuarios
--   - username = 'diezmo'
--   - rol = 'diezmo'
--   - activo = true
--
-- Si después migran a Supabase Auth real, entonces conviene poner
-- Row Level Security y políticas por auth.uid().
-- =========================================================
