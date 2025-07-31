# CommandBar Pro - Chrome Extension

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue?style=for-the-badge&logo=googlechrome)](https://chrome.google.com/webstore/detail/commandbar-pro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.2.1-brightgreen?style=for-the-badge)](https://github.com/kennysamuerto/commandbar-pro)
[![Privacy First](https://img.shields.io/badge/Privacy-First-ff69b4?style=for-the-badge&logo=shield)](PRIVACY.md)

<!-- Language Selection / Selección de Idioma -->
<div align="center">

**Choose Language / Elige Idioma:**

[🇬🇧 **English**](#english) | [🇪🇸 **Español**](#español)

</div>

---

## English

An advanced Command Bar for Chrome inspired by Arc Browser that allows you to navigate, search and control your browser efficiently.

### ✨ Features

#### 🚀 Main Functionalities
- **Universal keyboard shortcuts**: 
  - `Ctrl+K` (or `Cmd+K` on Mac) - Open Command Bar
  - `Ctrl+Shift+K` (or `Cmd+Shift+K` on Mac) - Edit current URL
- **Multilingual**: Complete interface in **Spanish** and **English**
- **Smart search**: Find tabs, bookmarks and history
- **Direct navigation**: Type URLs to navigate instantly
- **Quick commands**: Execute actions with "/" prefix
- **Web search**: Google, Bing, DuckDuckGo integrated
- **Complete tab management**: Create, pin, duplicate, close
- **Dark/light theme**: Adapts to your preferences
- **Responsive interface**: Works perfectly on any resolution
- **Optimized popup**: 480px width, fully scrollable with balanced design
- **Auto configuration**: Opens automatically on install
- **🧪 Experimental: Auto-open on New Tab**: Automatically opens CommandBar when creating new empty tabs

#### 🎯 Search Types

##### 1. Direct Navigation
```
google.com → Navigate to Google
https://github.com → Open GitHub
brand.com → Detect if open or open new tab
```

##### 2. Commands with "/"
```
/new tab → Create new tab
/pin → Pin current tab
/close → Close current tab
/duplicate → Duplicate current tab
/bookmarks → Open bookmarks manager
/history → Open browser history
/reload → Reload current page
/edit url → Edit current URL
```

##### 3. Universal Search
```
facebook → Search in tabs, bookmarks, history and web
work project → Find related tabs
important document → Search in bookmarks and history
```

### 🛠️ Installation

#### Method 1: From source code
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right corner)
4. Click "Load unpacked extension"
5. Select the `commandbar` folder
6. Done! The extension will be installed
7. **Configuration page will open automatically** to select your language

#### Method 2: From Chrome Store
*Coming soon*

### 🎮 Usage

#### Open CommandBar
- **Main shortcut**: `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)
- **Edit current URL**: `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Shift+K` (Mac)
- **Click icon**: Click on extension icon
- **Popup button**: "Try Command Bar"

#### Change Language
- **From popup**: "Language Settings" button (opens advanced options)
- **From options**: "Language" section (first option) 
- **Instant change**: No reload needed

#### Keyboard Navigation
- `Enter`: Execute selected action
- `↑/↓`: Navigate between suggestions
- `Escape`: Close CommandBar

#### Usage Examples

##### Search and Switch Tab
1. Open CommandBar (`Cmd+K` or `Ctrl+K`)
2. Type: `youtube`
3. Select YouTube tab from list
4. Press `Enter`

##### Direct Navigation
1. Open CommandBar (`Cmd+K` or `Ctrl+K`)
2. Type: `github.com`
3. Press `Enter`

##### Edit Current URL
1. Press `Cmd+Shift+K` (or `Ctrl+Shift+K`)
2. Modify the pre-filled URL
3. Press `Enter` to navigate in same tab

##### Web Search
1. Open CommandBar (`Cmd+K` or `Ctrl+K`)
2. Type: `javascript best practices`
3. Select "Search on Google"
4. Press `Enter`

### ⚙️ Configuration

Access configuration from:
- Extension popup → "Advanced Settings"
- Extension popup → "Language Settings"
- Or from `chrome://extensions/` → CommandBar Pro → Options
- **Opens automatically** when installing the extension!

#### Available Options
- **Language**: Complete Spanish and English (first option on page)
- **Dark Theme**: Interface with dark colors
- **Search sources**: Customize where to search
- **Search engine**: Google, Bing, DuckDuckGo, Yahoo
- **🧪 Experimental Features**: Auto-open on new tab (disabled by default)

#### APIs Used
- **Chrome Tabs API**: Tab management
- **Chrome Bookmarks API**: Bookmarks access
- **Chrome History API**: History search
- **Chrome Storage API**: Persistent configuration
- **Chrome Commands API**: Keyboard shortcuts
- **Chrome Scripting API**: Script injection

#### Required Permissions
- `tabs`: Tab access and management
- `bookmarks`: Bookmarks reading
- `history`: History search
- `storage`: Save configuration
- `activeTab`: Active tab interaction
- `scripting`: Script injection
- `<all_urls>`: Function on all websites

### 🔧 Development

#### Project Structure
- **Manifest V3**: Latest Chrome extension version
- **Service Worker**: Works without blocking browser
- **Content Scripts**: Non-invasive injection
- **i18n System**: Complete internationalization
- **Modern CSS**: Grid, Flexbox, CSS variables
- **Vanilla JavaScript**: No external dependencies

#### Main Files
- `i18n.js`: Translation system
- `background.js`: Main service worker
- `content.js`: CommandBar interface
- `popup.js/html`: Extension popup
- `options.js/html`: Configuration page
- `new_tab.js/html`: Custom new tab page (experimental)

### 🐛 Troubleshooting

#### CommandBar doesn't appear
1. Verify extension is enabled
2. Refresh web page
3. Check error console (`F12`)

#### Shortcuts don't work
1. Verify permissions in `chrome://extensions/`
2. Check conflicts with other shortcuts
3. Reinstall extension if necessary

#### Search finds no results
1. Verify `bookmarks` and `history` permissions
2. Check you have bookmarks/history
3. Try more specific searches

### 📈 Performance

#### Implemented Optimizations
- **Lazy loading**: Load elements on demand
- **Debounce**: Avoid excessive searches while typing (50ms)
- **Optimized indexes**: Fast search in large datasets
- **Memory management**: Automatic resource cleanup
- **Hybrid cache**: 5000 cache entries + access to 1000 complete history entries
- **Smart autocomplete**: Queries all your history, not just since installation

#### Metrics
- **Load time**: < 100ms
- **Search**: < 50ms for local results
- **Memory**: < 10MB typical usage

### 🔒 Privacy and Security

**CommandBar Pro is designed with privacy as a fundamental principle.**

#### 🛡️ Data Protection
- **100% Local**: All data remains on your device
- **No Servers**: We don't send information to external servers
- **No Tracking**: We don't track your browsing behavior
- **No Analytics**: We don't collect usage metrics
- **Open Source**: Total transparency for auditing

#### 📋 Data Access
- **History**: Only for smart autocomplete (temporary)
- **Bookmarks**: Only for searches (temporary)
- **Tabs**: Only for management and switching (temporary)
- **Configuration**: Only user preferences (local)

#### 🔐 What we DON'T do
- ❌ Don't send data to external servers
- ❌ Don't track your browsing
- ❌ Don't share personal information
- ❌ Don't show ads
- ❌ Don't use tracking cookies
- ❌ Don't implement telemetry

#### 📄 Privacy Policy
For detailed information about how we handle your data, see our [complete Privacy Policy](PRIVACY.md).

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🤝 Contributions

Contributions are welcome! Please:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📞 Support

- 🐛 **Issues**: [Report problems](https://github.com/kennysamuerto/commandbar-pro/issues)
- 📧 **Contact**: Open an issue for general questions
- 🔒 **Privacy**: Read our [Privacy Policy](PRIVACY.md)
- ☕ **Support**: [Buy me a coffee](https://coff.ee/vandertoorm)

### 🌟 Credits

Inspired by:
- **Arc Browser**: For its excellent CommandBar
- **Raycast**: For command design
- **Alfred**: For universal search

---

## Español

Una Command Bar avanzada para Chrome inspirada en Arc Browser que te permite navegar, buscar y controlar tu navegador de manera eficiente.

### ✨ Características

#### 🚀 Funcionalidades Principales
- **Atajos de teclado universales**: 
  - `Ctrl+K` (o `Cmd+K` en Mac) - Abrir Command Bar
  - `Ctrl+Shift+K` (o `Cmd+Shift+K` en Mac) - Editar URL actual
- **Multiidioma**: Interfaz completa en **Español** e **Inglés**
- **Búsqueda inteligente**: Encuentra pestañas, marcadores e historial
- **Navegación directa**: Escribe URLs para navegar instantáneamente
- **Comandos rápidos**: Ejecuta acciones con prefijo `/`
- **Búsqueda web**: Google, Bing, DuckDuckGo integrados
- **Gestión completa de pestañas**: Crear, pinear, duplicar, cerrar
- **Tema oscuro/claro**: Se adapta a tus preferencias
- **Interfaz responsive**: Funciona perfectamente en cualquier resolución
- **Popup optimizado**: 480px de ancho, completamente desplazable con diseño equilibrado
- **Configuración automática**: Se abre automáticamente al instalar
- **🧪 Experimental: Auto-abrir en Nueva Pestaña**: Abre CommandBar automáticamente al crear nuevas pestañas vacías

#### 🎯 Tipos de Búsqueda

##### 1. Navegación Directa
```
google.com → Navega a Google
https://github.com → Abre GitHub
marca.com → Detecta si está abierta o abre nueva pestaña
```

##### 2. Comandos con "/"
```
/nueva pestaña → Crea nueva pestaña
/pinear → Pinea la pestaña actual
/cerrar → Cierra la pestaña actual
/duplicar → Duplica la pestaña actual
/marcadores → Abre gestor de marcadores
/historial → Abre historial del navegador
/reload → Recarga la página actual
/editar url → Editar URL actual
```

##### 3. Búsqueda Universal
```
facebook → Busca en pestañas, marcadores, historial y web
proyecto trabajo → Encuentra pestañas relacionadas
documento importante → Busca en marcadores e historial
```

### 🛠️ Instalación

#### Método 1: Desde el código fuente
1. Descarga o clona este repositorio
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el "Modo de desarrollador" (esquina superior derecha)
4. Haz clic en "Cargar extensión sin empaquetar"
5. Selecciona la carpeta `commandbar`
6. ¡Listo! La extensión estará instalada
7. **Automáticamente se abrirá la página de configuración** para seleccionar tu idioma

#### Método 2: Desde la Chrome Store 
*Próximamente*

### 🎮 Uso

#### Abrir CommandBar
- **Atajo principal**: `Ctrl+K` (Windows/Linux) o `Cmd+K` (Mac)
- **Editar URL actual**: `Ctrl+Shift+K` (Windows/Linux) o `Cmd+Shift+K` (Mac)
- **Clic en icono**: Haz clic en el icono de la extensión
- **Botón del popup**: "Probar Command Bar"

#### Cambiar Idioma
- **Desde el popup**: Botón "Configurar Idioma" (abre opciones avanzadas)
- **Desde opciones**: Sección "Idioma" (primera opción) 
- **Cambio instantáneo**: Sin necesidad de recargar

#### Navegación por Teclado
- `Enter`: Ejecutar acción seleccionada
- `↑/↓`: Navegar entre sugerencias
- `Escape`: Cerrar CommandBar

#### Ejemplos de Uso

##### Buscar y Cambiar de Pestaña
1. Abre CommandBar (`Cmd+K` o `Ctrl+K`)
2. Escribe: `youtube`
3. Selecciona la pestaña de YouTube de la lista
4. Presiona `Enter`

##### Navegación Directa
1. Abre CommandBar (`Cmd+K` o `Ctrl+K`)
2. Escribe: `github.com`
3. Presiona `Enter`

##### Editar URL Actual
1. Presiona `Cmd+Shift+K` (o `Ctrl+Shift+K`)
2. Modifica la URL pre-rellenada
3. Presiona `Enter` para navegar en la misma pestaña

##### Búsqueda Web
1. Abre CommandBar (`Cmd+K` o `Ctrl+K`)
2. Escribe: `mejores prácticas javascript`
3. Selecciona "Buscar en Google"
4. Presiona `Enter`

### ⚙️ Configuración

Accede a la configuración desde:
- Popup de la extensión → "Configuración Avanzada"
- Popup de la extensión → "Configurar Idioma"
- O desde `chrome://extensions/` → CommandBar Pro → Opciones
- **¡Se abre automáticamente** al instalar la extensión!

#### Opciones Disponibles
- **Idioma**: Español e Inglés completos (primera opción en la página)
- **Tema Oscuro**: Interfaz con colores oscuros
- **Fuentes de búsqueda**: Personaliza dónde buscar
- **Motor de búsqueda**: Google, Bing, DuckDuckGo, Yahoo
- **🧪 Funciones Experimentales**: Auto-abrir en nueva pestaña (desactivado por defecto)

#### APIs Utilizadas
- **Chrome Tabs API**: Gestión de pestañas
- **Chrome Bookmarks API**: Acceso a marcadores
- **Chrome History API**: Búsqueda en historial
- **Chrome Storage API**: Configuración persistente
- **Chrome Commands API**: Atajos de teclado
- **Chrome Scripting API**: Inyección de scripts

#### Permisos Requeridos
- `tabs`: Acceso y gestión de pestañas
- `bookmarks`: Lectura de marcadores
- `history`: Búsqueda en historial
- `storage`: Guardar configuración
- `activeTab`: Interacción con pestaña activa
- `scripting`: Inyección de scripts
- `<all_urls>`: Funcionar en todos los sitios web

### 🔧 Desarrollo

#### Estructura del Proyecto
- **Manifest V3**: Última versión de extensiones de Chrome
- **Service Worker**: Funciona sin bloquear el navegador
- **Content Scripts**: Inyección no invasiva
- **Sistema i18n**: Internacionalización completa
- **Modern CSS**: Grid, Flexbox, variables CSS
- **Vanilla JavaScript**: Sin dependencias externas

#### Archivos Principales
- `i18n.js`: Sistema de traducciones
- `background.js`: Service worker principal
- `content.js`: Interfaz de CommandBar
- `popup.js/html`: Popup de la extensión
- `options.js/html`: Página de configuración
- `new_tab.js/html`: Página personalizada nueva pestaña (experimental)

### 🐛 Solución de Problemas

#### CommandBar no aparece
1. Verifica que la extensión esté habilitada
2. Refresca la página web
3. Comprueba la consola de errores (`F12`)

#### Atajos no funcionan
1. Verifica permisos en `chrome://extensions/`
2. Comprueba conflictos con otros atajos
3. Reinstala la extensión si es necesario

#### Búsqueda no encuentra resultados
1. Verifica permisos de `bookmarks` e `history`
2. Comprueba que tienes marcadores/historial
3. Intenta búsquedas más específicas

### 📈 Rendimiento

#### Optimizaciones Implementadas
- **Lazy loading**: Carga elementos bajo demanda
- **Debounce**: Evita búsquedas excesivas mientras escribes (50ms)
- **Índices optimizados**: Búsqueda rápida en grandes datasets
- **Memory management**: Limpieza automática de recursos
- **Cache híbrido**: 5000 entradas en cache + acceso a 1000 entradas del historial completo
- **Autocompletado inteligente**: Consulta todo tu historial, no solo desde instalación

#### Métricas
- **Tiempo de carga**: < 100ms
- **Búsqueda**: < 50ms para resultados locales
- **Memoria**: < 10MB en uso típico

### 🔒 Privacidad y Seguridad

**CommandBar Pro está diseñado con la privacidad como principio fundamental.**

#### 🛡️ Protección de Datos
- **100% Local**: Todos los datos permanecen en tu dispositivo
- **Sin Servidores**: No enviamos información a servidores externos
- **Sin Tracking**: No rastreamos tu comportamiento de navegación
- **Sin Analytics**: No recopilamos métricas de uso
- **Código Abierto**: Transparencia total para auditoría

#### 📋 Acceso a Datos
- **Historial**: Solo para autocompletado inteligente (temporal)
- **Marcadores**: Solo para búsquedas (temporal)
- **Pestañas**: Solo para gestión y cambio (temporal)
- **Configuración**: Solo preferencias del usuario (local)

#### 🔐 Lo que NO hacemos
- ❌ No enviamos datos a servidores externos
- ❌ No rastreamos tu navegación
- ❌ No compartimos información personal
- ❌ No mostramos anuncios
- ❌ No utilizamos cookies de seguimiento
- ❌ No implementamos telemetría

#### 📄 Política de Privacidad
Para información detallada sobre cómo manejamos tus datos, consulta nuestra [Política de Privacidad completa](PRIVACY.md).

### 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.

### 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### 📞 Soporte

- 🐛 **Issues**: [Reportar problemas](https://github.com/kennysamuerto/commandbar-pro/issues)
- 📧 **Contacto**: Abre un issue para preguntas generales
- 🔒 **Privacidad**: Lee nuestra [Política de Privacidad](PRIVACY.md)
- ☕ **Apoyo**: [Buy me a coffee](https://coff.ee/vandertoorm)

### 🌟 Créditos

Inspirado por:
- **Arc Browser**: Por su excelente CommandBar
- **Raycast**: Por el diseño de comandos
- **Alfred**: Por la búsqueda universal

---

**¿Te gusta CommandBar Pro?** ⭐ ¡Dale una estrella al repositorio! 