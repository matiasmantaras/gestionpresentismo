# Sistema de Gestión de Presentismo - Ministerio Nuevo Rumbo Alem

Aplicación web para gestionar la asistencia de miembros de la iglesia a diferentes actividades.

## 🎯 Características

### Módulos Principales

1. **Miembros Generales**
   - Gestión de asistencia a cultos regulares (Domingo Noche)
   - Registro de cultos especiales
   - Control de presente/ausente/justificado

2. **Líderes de Ministerio**
   - Seguimiento de asistencia a reuniones de liderazgo
   - Organización por ministerios (Alabanza, Intercesión, Niños, Jóvenes, etc.)
   - Gestión personalizada de líderes

3. **Grupo de Jóvenes**
   - Registro de asistencia a encuentros juveniles
   - Reuniones semanales y actividades especiales
   - Seguimiento de retiros y eventos

### Funcionalidades

- ✅ Panel principal (Dashboard) con estadísticas de asistencia
- ✅ Navegación intuitiva con sidebar responsive
- ✅ Registro masivo de asistencia (checklist)
- ✅ Búsqueda y filtrado de personas
- ✅ Estadísticas en tiempo real
- ✅ Diseño mobile-first totalmente responsive
- ✅ Almacenamiento local con localStorage
- ✅ Interfaz moderna y profesional

## 🎨 Diseño

- **Paleta de colores**: Azul oscuro (primary), blanco y dorado suave (gold)
- **Framework CSS**: Tailwind CSS
- **Responsive**: Optimizado para móvil, tablet y escritorio
- **Iconos**: SVG integrados para mejor rendimiento

## 🚀 Tecnologías

- **React 19** - Framework de UI
- **Vite 8** - Build tool y dev server
- **Tailwind CSS 4** - Framework de estilos
- **localStorage** - Persistencia de datos local

## 📦 Instalación y Uso

El proyecto ya está configurado. Para iniciar:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:5173](http://localhost:5173)

## 🗂️ Estructura del Proyecto

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx       # Encabezado con logo e información
│   │   └── Sidebar.jsx      # Menú de navegación lateral
│   ├── pages/
│   │   ├── Dashboard.jsx    # Panel principal con estadísticas
│   │   ├── MiembrosGenerales.jsx
│   │   ├── LideresMinisterio.jsx
│   │   └── GrupoJovenes.jsx
│   └── common/
│       ├── AttendanceList.jsx  # Lista de personas registradas
│       └── AttendanceForm.jsx  # Formulario de toma de asistencia
├── utils/
│   └── storage.js           # Funciones para localStorage
├── App.jsx                  # Componente principal
└── index.css               # Estilos globales con Tailwind
```

## 💾 Estructura de Datos

Los datos se almacenan en localStorage con las siguientes estructuras:

### Personas
```javascript
{
  id: number,
  nombre: string,
  fechaRegistro: string (ISO),
  ministerio?: string  // Solo para líderes
}
```

### Registros de Asistencia
```javascript
{
  id: number,
  fecha: string (ISO),
  tipo?: string,  // Tipo de culto/reunión/encuentro
  registros: [
    {
      id: number,
      nombre: string,
      estado: 'presente' | 'ausente' | 'justificado'
    }
  ]
}
```

## 🔄 Migración a Supabase

El código está estructurado para facilitar la migración futura a Supabase:

1. Todas las operaciones de datos están centralizadas en `src/utils/storage.js`
2. Los componentes usan funciones abstractas (getMiembros, saveMiembros, etc.)
3. Para migrar, solo necesitas modificar las funciones en `storage.js` para usar Supabase en lugar de localStorage

## 📱 Uso de la Aplicación

### Dashboard
- Vista general con estadísticas de los tres módulos
- Porcentaje de asistencia promedio
- Gráfico de tendencia mensual
- Acceso rápido a cada módulo

### Gestión de Personas
1. Clic en "Agregar" para registrar nuevas personas
2. Buscar por nombre usando el campo de búsqueda
3. Eliminar personas con el botón de acción

### Registro de Asistencia
1. Clic en "Registrar Asistencia"
2. Seleccionar fecha y tipo de evento
3. Marcar presente/ausente/justificado para cada persona
4. Ver estadísticas en tiempo real
5. Guardar el registro

## 🎯 Próximas Mejoras Sugeridas

- [ ] Integración con Supabase para persistencia en la nube
- [ ] Autenticación de usuarios
- [ ] Reportes exportables (PDF, Excel)
- [ ] Gráficos avanzados de tendencias
- [ ] Notificaciones para ausencias frecuentes
- [ ] Historial detallado por persona
- [ ] Filtros avanzados por fechas y períodos
- [ ] Modo offline con sincronización

## 📄 Licencia

Proyecto desarrollado para el Ministerio Nuevo Rumbo Alem.

