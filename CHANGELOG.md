# Changelog - CommandBar Pro | Registro de Cambios

<!-- Language Selection / Selección de Idioma -->
<div align="center">

**Choose Language / Elige Idioma:**

[🇬🇧 **English**](#english) | [🇪🇸 **Español**](#español)

</div>

---

## English

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [1.2.0] - 2025-07-31

#### ✨ Added
- **🧪 Experimental Feature: Auto-open in New Tab**:
  - CommandBar automatically opens when creating new empty tabs (Ctrl+T, + button)
  - **Disabled by default** - optional experimental function
  - Includes custom `new_tab.html` page for fast transition
  - **Complete** CommandBar with all features: tab search, bookmarks, history
  - Smart navigation: same tab from new tab, new tab from other pages
  - Configurable delay (100ms recommended) for smooth transition
  - **No usage tracking** for this experimental feature

#### 🔧 Changed
- **Updated Footer Links**:
  - Changelog now points to official GitHub repository
  - Report Bug uses GitHub Issues instead of email
  - View Source Code points to correct repository
- **Experimental Section**: English hardcoded interface for greater stability

#### 🚀 Improved
- **Production Optimization**:
  - Removed **all debug console.log** (200+ logs cleaned)
  - Only keeps `console.error` for critical errors
  - Clean console for end users
  - Improved performance without unnecessary logging operations
- **System Robustness**:
  - Improved handling of Chrome internal pages (`chrome://`, `about:blank`)
  - Smart fallbacks for content script injection
  - Prevention of infinite loops in auto-open
  - Automatic detection of tabs created by CommandBar

#### 🐛 Fixed
- Translation issues in experimental options section
- Content Security Policy (CSP) conflicts in `new_tab.html`
- Manifest errors with invalid schemes (`chrome-extension://`)
- Unnecessary auto-opening in tabs created by CommandBar for navigation
- Improvements in script injection stability on problematic sites

#### 🔧 Technical
- New tab architecture with custom extension page
- Tab marking system to prevent loops
- Sequential script injection (`i18n.js` → `styles.css` → `content.js`)
- Smart context detection (new tab vs. regular page)
- Optimization of delays and timeouts for better UX
- Code cleanup: experimental debug functions removed

### [1.1.1] - 2025-07-30

#### 🚀 Improved
- **Smart Hybrid Cache**:
  - Cache size increased from 100 to **5000 entries**
  - Queries up to **1000 entries** from complete Chrome history
  - Autocomplete now works with **your entire history**, not just since installation
  - Cache expiration time increased to 60 seconds for better performance
  - Configurable constants for future optimizations

#### 🔧 Technical
- Hybrid cache architecture: local speed + complete history access
- Optimized cleanup algorithm (keeps 2500 most recent entries)
- Updated technical documentation in privacy policy

#### 🐛 Fixed
- Removed unnecessary console warnings for optional interface elements
- `updateElementText` functions now silently handle missing elements
- Initialization errors when i18n system is not immediately available
- More robust initialization with fallbacks to ensure basic functionality
- Defensive translation handling to avoid console errors

### [1.1.0] - 2025-07-30

#### ✨ Added
- **New Edit Mode Shortcut**: `Cmd+Shift+K` (Mac) / `Ctrl+Shift+K` (Windows/Linux)
  - Pre-fills CommandBar with current URL
  - All actions open in current tab
  - Perfect for editing URLs or navigating in same tab

#### 🔧 Changed  
- **Universal Keyboard Shortcuts**:
  - `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux) → Normal CommandBar
  - `Cmd+Shift+K` (Mac) / `Ctrl+Shift+K` (Windows/Linux) → Edit CommandBar
  - **Advantage**: Universal standard for command bars (like GitHub, VSCode, Arc)

#### 🚀 Improved
- **Smart Autocomplete Algorithm**:
  - 200ms debounce to avoid interference with fast typing
  - Hybrid sorting: 70% frequency + 30% recency
  - Priority for exact matches at domain start
  - Better user experience when typing fast

### [1.0.0] - 2025-07-28

#### 🎉 Initial Release

##### ✨ Added
- **Universal Command Bar**: `Ctrl+K` / `Cmd+K` keyboard shortcut for quick access
- **Smart Search**: Find content in tabs, bookmarks and history
- **Direct Navigation**: Type URLs to navigate instantly
- **Quick Commands**: Command system with "/" prefix for specific actions
- **Tab Management**: Create, pin, duplicate, close tabs from CommandBar
- **Web Search**: Integration with Google, Bing and DuckDuckGo
- **Modern Interface**: Clean and responsive design with smooth animations
- **Adaptive Theme**: Automatic support for light and dark mode
- **Options Page**: Advanced configuration with multiple customization options
- **Total Privacy**: All data stays local, no sending to servers

---

## Español

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [1.2.0] - 2025-07-31

#### ✨ Agregado
- **🧪 Función Experimental: Auto-abrir en Nueva Pestaña**:
  - CommandBar se abre automáticamente al crear nuevas pestañas vacías (Ctrl+T, botón +)
  - **Desactivada por defecto** - función experimental opcional
  - Incluye página personalizada `new_tab.html` para transición rápida
  - CommandBar **completo** con todas las funciones: búsqueda de pestañas, marcadores, historial
  - Navegación inteligente: misma pestaña desde nueva pestaña, nueva pestaña desde otras páginas
  - Delay configurable (100ms recomendado) para transición fluida
  - **Sin tracking** de uso para esta función experimental

#### 🔧 Cambiado
- **Enlaces del Footer actualizados**:
  - Changelog ahora apunta al repositorio GitHub oficial
  - Reportar Bug usa GitHub Issues en lugar de email
  - Ver Código Fuente apunta al repositorio correcto
- **Sección Experimental**: Interfaz en inglés hardcodeado para mayor estabilidad

#### 🚀 Mejorado
- **Optimización para Producción**:
  - Eliminados **todos los console.log** de debug (200+ logs limpiados)
  - Solo mantiene `console.error` para errores críticos
  - Consola limpia para usuarios finales
  - Rendimiento mejorado sin operaciones de logging innecesarias
- **Robustez del Sistema**:
  - Manejo mejorado de páginas internas de Chrome (`chrome://`, `about:blank`)
  - Fallbacks inteligentes para inyección de content scripts
  - Prevención de bucles infinitos en auto-apertura
  - Detección automática de pestañas creadas por CommandBar

#### 🐛 Corregido
- Problemas de traducción en la sección experimental de opciones
- Conflictos de Content Security Policy (CSP) en `new_tab.html`
- Errores de manifest con esquemas inválidos (`chrome-extension://`)
- Auto-apertura innecesaria en pestañas creadas por CommandBar para navegación
- Mejoras en la estabilidad de inyección de scripts en sitios problemáticos

#### 🔧 Técnico
- Arquitectura de nueva pestaña con página personalizada de extensión
- Sistema de marcado de pestañas para prevenir bucles
- Inyección secuencial de scripts (`i18n.js` → `styles.css` → `content.js`)
- Detección inteligente de contexto (nueva pestaña vs. página regular)
- Optimización de delays y timeouts para mejor UX
- Limpieza de código: funciones de debug experimental removidas

### [1.1.1] - 2025-07-30

#### 🚀 Mejorado
- **Cache Híbrido Inteligente**:
  - Tamaño del cache aumentado de 100 a **5000 entradas**
  - Consulta hasta **1000 entradas** del historial completo de Chrome
  - Autocompletado ahora funciona con **todo tu historial**, no solo desde instalación
  - Tiempo de expiración del cache aumentado a 60 segundos para mejor rendimiento
  - Constantes configurables para futuras optimizaciones

#### 🔧 Técnico
- Arquitectura de cache híbrido: velocidad local + acceso completo al historial
- Algoritmo de limpieza optimizado (mantiene 2500 entradas más recientes)
- Documentación técnica actualizada en política de privacidad

#### 🐛 Corregido
- Eliminados warnings innecesarios en consola por elementos opcionales de la interfaz
- Funciones `updateElementText` ahora manejan silenciosamente elementos no encontrados
- Errores de inicialización cuando el sistema i18n no está disponible inmediatamente
- Inicialización más robusta con fallbacks para garantizar funcionalidad básica
- Manejo defensivo de traducciones para evitar errores en la consola

### [1.1.0] - 2025-07-30

#### ✨ Agregado
- **Nuevo Atajo de Modo Edición**: `Cmd+Shift+K` (Mac) / `Ctrl+Shift+K` (Windows/Linux)
  - Pre-rellena la CommandBar con la URL actual
  - Todas las acciones se abren en la pestaña actual
  - Perfecto para editar URLs o navegar en la misma pestaña

#### 🔧 Cambiado  
- **Atajos de Teclado Universales**:
  - `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux) → CommandBar normal
  - `Cmd+Shift+K` (Mac) / `Ctrl+Shift+K` (Windows/Linux) → CommandBar edición
  - **Ventaja**: Estándar universal para command bars (como GitHub, VSCode, Arc)

#### 🚀 Mejorado
- **Algoritmo de Autocompletado Inteligente**:
  - Debounce de 200ms para evitar interferencia con escritura rápida
  - Ordenación híbrida: 70% frecuencia + 30% recencia
  - Prioridad para coincidencias exactas al inicio del dominio
  - Mejor experiencia de usuario al escribir rápido

### [1.0.0] - 2025-07-28

#### 🎉 Lanzamiento Inicial

##### ✨ Agregado
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
