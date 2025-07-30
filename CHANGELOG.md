# Changelog - CommandBar Pro

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-01-20

### ✨ Agregado
- **Nuevo Atajo de Modo Edición**: `Cmd+Shift+;` (Mac) / `Ctrl+Shift+;` (Windows/Linux)
  - Pre-rellena la CommandBar con la URL actual
  - Todas las acciones se abren en la pestaña actual
  - Perfecto para editar URLs o navegar en la misma pestaña

### 🔧 Cambiado  
- **Atajos de Teclado Universales**:
  - `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux) → CommandBar normal
  - `Cmd+Shift+K` (Mac) / `Ctrl+Shift+K` (Windows/Linux) → CommandBar edición
  - **Ventaja**: Estándar universal para command bars (como GitHub, VSCode, Arc)

### 🚀 Mejorado
- **Algoritmo de Autocompletado Inteligente**:
  - Debounce de 200ms para evitar interferencia con escritura rápida
  - Ordenación híbrida: 70% frecuencia + 30% recencia
  - Prioridad para coincidencias exactas al inicio del dominio
  - Mejor experiencia de usuario al escribir rápido

## [1.0.0] - 2024-01-20

### 🎉 Lanzamiento Inicial

#### ✨ Agregado
- **Command Bar Universal**: Atajo de teclado `Ctrl+K` / `Cmd+K` para acceso rápido
- **Búsqueda Inteligente**: Encuentra contenido en pestañas, marcadores e historial
- **Navegación Directa**: Escribe URLs para navegar instantáneamente
- **Comandos Rápidos**: Sistema de comandos con prefijo "/" para acciones específicas
- **Gestión de Pestañas**: Crear, pinear, duplicar, cerrar pestañas desde CommandBar
- **Búsqueda Web**: Integración con Google, Bing y DuckDuckGo
- **Interfaz Moderna**: Diseño limpio y responsive con animaciones suaves
- **Tema Adaptativo**: Soporte automático para modo claro y oscuro
- **Página de Opciones**: Configuración avanzada con múltiples opciones de personalización
- **Privacidad Total**: Todos los datos se mantienen localmente, sin envío a servidores

#### 🎯 Funcionalidades Principales
- Búsqueda universal con resultados en tiempo real
- Navegación por teclado completa (↑/↓, Enter, Escape)
- Detección automática de URLs vs búsquedas
- Cache inteligente para mejor rendimiento
- Estadísticas de uso opcionales (locales)
- Exportar/importar configuración

#### 🔧 Características Técnicas
- Manifest V3 para máxima compatibilidad
- Service Worker eficiente
- Content Scripts no invasivos
- CSS moderno con Grid y Flexbox
- JavaScript vanilla sin dependencias
- APIs nativas de Chrome para máximo rendimiento

#### 🎨 Diseño y UX
- Interfaz inspirada en Arc Browser
- Animaciones fluidas y responsivas
- Iconos SVG personalizados
- Tipografía del sistema para consistencia
- Diseño mobile-first
- Accesibilidad mejorada

#### ⚙️ Configuración Disponible
- **General**: Tema, velocidad de animaciones, máximo de resultados
- **Búsqueda**: Fuentes de datos, retraso de búsqueda, motor por defecto
- **Teclado**: Prevención de conflictos con sitios web
- **Privacidad**: Control granular sobre almacenamiento de datos
- **Experimental**: Funciones beta opcionales

#### 📱 Compatibilidad
- Chrome 88+
- Chromium 88+
- Microsoft Edge 88+
- Responsive en todas las resoluciones
- Soporte para preferencias de accesibilidad

#### 🔒 Privacidad y Seguridad
- Sin tracking de navegación
- Sin envío de datos a servidores externos
- Permisos mínimos necesarios
- Código abierto para transparencia
- Configuración granular de privacidad

---

## [Próximas Versiones]

### 🚀 v1.1.0 - Planificado
- **Comandos Personalizados**: Crear tus propios comandos
- **Búsqueda con IA**: Sugerencias inteligentes (opcional)
- **Sincronización**: Configuración entre dispositivos (opcional)
- **Temas Personalizados**: Editor de temas visual
- **Estadísticas Avanzadas**: Métricas de productividad

### 🎯 v1.2.0 - Planificado
- **Comandos de Voz**: Control por voz (opcional)
- **Extensiones de Terceros**: API para desarrolladores
- **Búsqueda en PDF**: Indexar contenido de documentos
- **Workspace Management**: Organización de pestañas por proyectos
- **Integración Cloud**: Conectar con servicios externos

### 🛠️ v1.3.0 - Planificado
- **Machine Learning**: Predicción de acciones frecuentes
- **Búsqueda Semántica**: Comprensión de contexto mejorada
- **Colaboración**: Compartir comandos con equipos
- **Analytics Dashboard**: Insights de productividad
- **Mobile Companion**: App móvil complementaria

---

## Política de Versionado

- **MAJOR**: Cambios incompatibles en la API
- **MINOR**: Nuevas funcionalidades manteniendo compatibilidad
- **PATCH**: Correcciones de bugs y mejoras menores

## Cómo Contribuir

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Soporte

- 📧 Email: soporte@commandbarpro.com
- 🐛 Issues: [GitHub Issues](https://github.com/usuario/commandbar-pro/issues)
- 📖 Docs: [Documentación](https://github.com/usuario/commandbar-pro/wiki)
- 💬 Discord: [Comunidad](https://discord.gg/commandbarpro)

---

**Nota**: Las fechas y versiones futuras son estimadas y pueden cambiar según el desarrollo y feedback de la comunidad. 