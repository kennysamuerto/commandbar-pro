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

### [1.3.0] - 2025-01-27

#### ✨ Added
- **🖼️ New Window Command**: Create new browser windows with `Ctrl+N` shortcut
- **🕵️ Incognito Window Command**: Open incognito windows for private browsing
- **🔄 Reload Tab Command**: Refresh current tab with visual feedback
- **🔧 Developer Mode Command**: Toggle developer tools with `Ctrl+Shift+I`
- **📖 Enhanced Reader Mode**: Improved visual filters with better contrast and saturation
- **🎯 Toast Notifications**: Visual feedback for all command executions

#### 🐛 Fixed
- **Command Execution Issues**: Fixed all non-working commands (pin, close, duplicate, reload)
- **Popup Translations**: Complete translation support for all popup elements
- **Options Page Translations**: Fixed missing translations for privacy actions
- **Duplicate Web Search**: Prevented duplicate web search sections in suggestions
- **Background Script Actions**: Added missing `get_current_tab`, `create_window`, `create_incognito_window`, `reload_tab`, `toggle_devtools` actions

#### 🔧 Changed
- **Removed Edit Current URL**: Replaced with more useful Developer Mode command
- **Improved Error Handling**: Better error management with user-friendly messages
- **Enhanced Translation System**: More robust translation loading with retry mechanisms
- **Updated Keyboard Shortcuts**: Changed `Ctrl+Shift+K` to `Ctrl+Shift+I` for developer mode

#### 🚀 Improved
- **Command Feedback**: All commands now show success/error notifications
- **Translation Robustness**: Aggressive retry system for problematic translations
- **User Experience**: Better visual feedback and error messages
- **Code Quality**: Improved error handling and logging throughout the extension

#### 🔧 Technical
- Added comprehensive background script functions for tab and window management
- Implemented robust translation retry system for options page
- Enhanced content script with better error handling
- Improved i18n system with fallback mechanisms
- Added toast notification system for user feedback

### [1.2.1] - 2025-07-31

#### 🐛 Fixed
- **Console Spam Elimination**: Removed remaining `console.log` statements that were causing error spam in extension management page
- **Content Script Robustness**: Improved initialization error handling for restricted pages (chrome://, about:blank, etc.)
- **Silent Error Handling**: Added proper checks for `chrome.storage` availability before initialization
- **Production Ready**: Clean console output for end users with no unnecessary logging

#### 🔧 Technical
- Enhanced content script initialization with availability checks
- Silent fallback handling for pages where extension APIs are not accessible
- Improved error handling in i18n, options, popup, and background scripts
- Better compatibility with restricted websites and internal Chrome pages

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

### [1.3.0] - 2025-08-01

#### ✨ Agregado
- **🖼️ Comando Nueva Ventana**: Crear nuevas ventanas del navegador con atajo `Ctrl+N`
- **🕵️ Comando Ventana Incognito**: Abrir ventanas incognito para navegación privada
- **🔄 Comando Recargar Pestaña**: Actualizar pestaña actual con feedback visual
- **🔧 Comando Modo Desarrollador**: Alternar herramientas de desarrollador con `Ctrl+Shift+I`
- **📖 Modo Lectura Mejorado**: Filtros visuales mejorados con mejor contraste y saturación
- **🎯 Notificaciones Toast**: Feedback visual para todas las ejecuciones de comandos

#### 🐛 Corregido
- **Problemas de Ejecución de Comandos**: Arreglados todos los comandos que no funcionaban (pinear, cerrar, duplicar, recargar)
- **Traducciones del Popup**: Soporte completo de traducción para todos los elementos del popup
- **Traducciones de la Página de Opciones**: Arregladas traducciones faltantes para acciones de privacidad
- **Búsqueda Web Duplicada**: Prevenidas secciones duplicadas de búsqueda web en sugerencias
- **Acciones del Background Script**: Agregadas acciones faltantes `get_current_tab`, `create_window`, `create_incognito_window`, `reload_tab`, `toggle_devtools`

#### 🔧 Cambiado
- **Eliminado Editar URL Actual**: Reemplazado con el más útil comando Modo Desarrollador
- **Manejo de Errores Mejorado**: Mejor gestión de errores con mensajes amigables para el usuario
- **Sistema de Traducción Mejorado**: Carga de traducciones más robusta con mecanismos de reintento
- **Atajos de Teclado Actualizados**: Cambiado `Ctrl+Shift+K` a `Ctrl+Shift+I` para modo desarrollador

#### 🚀 Mejorado
- **Feedback de Comandos**: Todos los comandos ahora muestran notificaciones de éxito/error
- **Robustez de Traducciones**: Sistema agresivo de reintento para traducciones problemáticas
- **Experiencia de Usuario**: Mejor feedback visual y mensajes de error
- **Calidad del Código**: Manejo de errores y logging mejorado en toda la extensión

#### 🔧 Técnico
- Agregadas funciones completas del background script para gestión de pestañas y ventanas
- Implementado sistema robusto de reintento de traducciones para página de opciones
- Content script mejorado con mejor manejo de errores
- Sistema i18n mejorado con mecanismos de fallback
- Agregado sistema de notificaciones toast para feedback del usuario

### [1.2.1] - 2025-07-31

#### 🐛 Corregido
- **Eliminación de Spam en Consola**: Removidos los `console.log` restantes que causaban spam de errores en la página de gestión de extensiones
- **Robustez del Content Script**: Mejorado el manejo de errores de inicialización para páginas restringidas (chrome://, about:blank, etc.)
- **Manejo Silencioso de Errores**: Agregadas verificaciones adecuadas de disponibilidad de `chrome.storage` antes de la inicialización
- **Listo para Producción**: Consola limpia para usuarios finales sin logging innecesario

#### 🔧 Técnico
- Mejorada inicialización del content script con verificaciones de disponibilidad
- Manejo silencioso de fallback para páginas donde las APIs de extensión no son accesibles
- Mejor manejo de errores en scripts de i18n, options, popup y background
- Mejor compatibilidad con sitios web restringidos y páginas internas de Chrome

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
