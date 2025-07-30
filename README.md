# CommandBar Pro - Chrome Extension

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue?style=for-the-badge&logo=googlechrome)](https://chrome.google.com/webstore/detail/commandbar-pro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.2.0-brightgreen?style=for-the-badge)](https://github.com/kennysamuerto/commandbar-pro)
[![Privacy First](https://img.shields.io/badge/Privacy-First-ff69b4?style=for-the-badge&logo=shield)](PRIVACY.md)

Una Command Bar avanzada para Chrome inspirada en Arc Browser que te permite navegar, buscar y controlar tu navegador de manera eficiente.

## ✨ Características

### 🚀 Funcionalidades Principales
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

### 🎯 Tipos de Búsqueda

#### 1. Navegación Directa
```
google.com → Navega a Google
https://github.com → Abre GitHub
marca.com → Detecta si está abierta o abre nueva pestaña
```

#### 2. Comandos con "/"
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

#### 3. Búsqueda Universal
```
facebook → Busca en pestañas, marcadores, historial y web
proyecto trabajo → Encuentra pestañas relacionadas
documento importante → Busca en marcadores e historial
```

## 🛠️ Instalación

### Método 1: Desde el código fuente
1. Descarga o clona este repositorio
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el "Modo de desarrollador" (esquina superior derecha)
4. Haz clic en "Cargar extensión sin empaquetar"
5. Selecciona la carpeta `commandbar`
6. ¡Listo! La extensión estará instalada
7. **Automáticamente se abrirá la página de configuración** para seleccionar tu idioma

### Método 2: Desde la Chrome Store 


## 🎮 Uso

### Abrir CommandBar
- **Atajo principal**: `Ctrl+K` (Windows/Linux) o `Cmd+K` (Mac)
- **Editar URL actual**: `Ctrl+Shift+K` (Windows/Linux) o `Cmd+Shift+K` (Mac)
- **Clic en icono**: Haz clic en el icono de la extensión
- **Botón del popup**: "Probar Command Bar" / "Try Command Bar"

### Cambiar Idioma
- **Desde el popup**: Botón "Configurar Idioma" / "Language Settings" (abre opciones avanzadas)
- **Desde opciones**: Sección "Idioma" / "Language" (primera opción) 
- **Cambio instantáneo**: Sin necesidad de recargar

### Navegación por Teclado
- `Enter`: Ejecutar acción seleccionada
- `↑/↓`: Navegar entre sugerencias
- `Escape`: Cerrar CommandBar

### Ejemplos de Uso

#### Buscar y Cambiar de Pestaña
1. Abre CommandBar (`Cmd+K` o `Ctrl+K`)
2. Escribe: `youtube`
3. Selecciona la pestaña de YouTube de la lista
4. Presiona `Enter`

#### Navegación Directa
1. Abre CommandBar (`Cmd+K` o `Ctrl+K`)
2. Escribe: `github.com`
3. Presiona `Enter`

#### Editar URL Actual
1. Presiona `Cmd+Shift+K` (o `Ctrl+Shift+K`)
2. Modifica la URL pre-rellenada
3. Presiona `Enter` para navegar en la misma pestaña

#### Búsqueda Web
1. Abre CommandBar (`Cmd+K` o `Ctrl+K`)
2. Escribe: `mejores prácticas javascript`
3. Selecciona "Buscar en Google"
4. Presiona `Enter`

## ⚙️ Configuración

Accede a la configuración desde:
- Popup de la extensión → "Configuración Avanzada" / "Advanced Settings"
- Popup de la extensión → "Configurar Idioma" / "Language Settings"
- O desde `chrome://extensions/` → CommandBar Pro → Opciones
- **¡Se abre automáticamente** al instalar la extensión!

### Opciones Disponibles
- **Idioma**: Español e Inglés completos (primera opción en la página)
- **Tema Oscuro**: Interfaz con colores oscuros
- **Auto-focus**: Foco automático en el campo de búsqueda
- **Acciones Rápidas**: Comandos de acceso directo
- **Fuentes de búsqueda**: Personaliza dónde buscar
- **Motor de búsqueda**: Google, Bing, DuckDuckGo, Yahoo

### APIs Utilizadas
- **Chrome Tabs API**: Gestión de pestañas
- **Chrome Bookmarks API**: Acceso a marcadores
- **Chrome History API**: Búsqueda en historial
- **Chrome Storage API**: Configuración persistente
- **Chrome Commands API**: Atajos de teclado
- **Chrome Scripting API**: Inyección de scripts

### Permisos Requeridos
- `tabs`: Acceso y gestión de pestañas
- `bookmarks`: Lectura de marcadores
- `history`: Búsqueda en historial
- `storage`: Guardar configuración
- `activeTab`: Interacción con pestaña activa
- `scripting`: Inyección de scripts
- `<all_urls>`: Funcionar en todos los sitios web

## 🔧 Desarrollo

### Estructura del Proyecto
- **Manifest V3**: Última versión de extensiones de Chrome
- **Service Worker**: Funciona sin bloquear el navegador
- **Content Scripts**: Inyección no invasiva
- **Sistema i18n**: Internacionalización completa
- **Modern CSS**: Grid, Flexbox, variables CSS
- **Vanilla JavaScript**: Sin dependencias externas

### Archivos Principales
- `i18n.js`: Sistema de traducciones
- `background.js`: Service worker principal
- `content.js`: Interfaz de CommandBar
- `popup.js/html`: Popup de la extensión
- `options.js/html`: Página de configuración

## 🐛 Solución de Problemas

### CommandBar no aparece
1. Verifica que la extensión esté habilitada
2. Refresca la página web
3. Comprueba la consola de errores (`F12`)

### Atajos no funcionan
1. Verifica permisos en `chrome://extensions/`
2. Comprueba conflictos con otros atajos
3. Reinstala la extensión si es necesario

### Búsqueda no encuentra resultados
1. Verifica permisos de `bookmarks` e `history`
2. Comprueba que tienes marcadores/historial
3. Intenta búsquedas más específicas

## 📈 Rendimiento

### Optimizaciones Implementadas
- **Lazy loading**: Carga elementos bajo demanda
- **Debounce**: Evita búsquedas excesivas mientras escribes
- **Índices optimizados**: Búsqueda rápida en grandes datasets
- **Memory management**: Limpieza automática de recursos

### Métricas
- **Tiempo de carga**: < 100ms
- **Búsqueda**: < 50ms para resultados locales
- **Memoria**: < 10MB en uso típico

## 🔒 Privacidad y Seguridad

**CommandBar Pro está diseñado con la privacidad como principio fundamental.**

### 🛡️ Protección de Datos
- **100% Local**: Todos los datos permanecen en tu dispositivo
- **Sin Servidores**: No enviamos información a servidores externos
- **Sin Tracking**: No rastreamos tu comportamiento de navegación
- **Sin Analytics**: No recopilamos métricas de uso
- **Código Abierto**: Transparencia total para auditoría

### 📋 Acceso a Datos
- **Historial**: Solo para autocompletado inteligente (temporal)
- **Marcadores**: Solo para búsquedas (temporal)
- **Pestañas**: Solo para gestión y cambio (temporal)
- **Configuración**: Solo preferencias del usuario (local)

### 🔐 Lo que NO hacemos
- ❌ No enviamos datos a servidores externos
- ❌ No rastreamos tu navegación
- ❌ No compartimos información personal
- ❌ No mostramos anuncios
- ❌ No utilizamos cookies de seguimiento
- ❌ No implementamos telemetría

### 📄 Política de Privacidad
Para información detallada sobre cómo manejamos tus datos, consulta nuestra [Política de Privacidad completa](PRIVACY.md).


## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

- 🐛 **Issues**: [Reportar problemas](https://github.com/kennysamuerto/commandbar-pro/issues)
- 📧 **Contacto**: Abre un issue para preguntas generales
- 🔒 **Privacidad**: Lee nuestra [Política de Privacidad](PRIVACY.md)
- ☕ **Apoyo**: [Buy me a coffee](https://coff.ee/vandertoorm)

## 🌟 Créditos

Inspirado por:
- **Arc Browser**: Por su excelente CommandBar
- **Raycast**: Por el diseño de comandos
- **Alfred**: Por la búsqueda universal

---

**¿Te gusta CommandBar Pro?** ⭐ ¡Dale una estrella al repositorio! 