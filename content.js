// Content Script para CommandBar Pro
let commandBarContainer = null;
let isCommandBarVisible = false;
let editMode = false; // Modo edición de URL actual
let isInitialized = false; // Flag para evitar inicialización duplicada

// Variables globales
let userSettings = {};
let searchTimeout = null;
let autocompleteTimeout = null;
let isDeleting = false;
let lastInputLength = 0;
let isDeletingTimeout = null;
let isInDeletionMode = false;
let isAutocompletingFromTyping = false;

// Función para tracking de uso local (envía al background script)
async function trackUsageLocal(action, details = {}) {
  try {
    await chrome.runtime.sendMessage({
      action: 'track_usage',
      usage_action: action,
      usage_details: details
    });
  } catch (error) {
    // Ignorar errores de tracking para no interrumpir funcionalidad
  }
}

// Configuración de usuario (ya declarada arriba)
userSettings = {
  defaultSearchEngine: 'google',
  searchTabs: true,
  searchBookmarks: true,
  searchHistory: true,
  maxResults: 5,
  searchDelay: 50
};

// Función para cargar configuración
async function loadUserSettings() {
  try {
    const settings = await chrome.storage.sync.get(['defaultSearchEngine', 'searchTabs', 'searchBookmarks', 'searchHistory', 'maxResults', 'searchDelay', 'language']);
    userSettings.defaultSearchEngine = settings.defaultSearchEngine || 'google';
    userSettings.searchTabs = settings.searchTabs !== false; // Por defecto true
    userSettings.searchBookmarks = settings.searchBookmarks !== false; // Por defecto true
    userSettings.searchHistory = settings.searchHistory !== false; // Por defecto true
    userSettings.maxResults = settings.maxResults || 5;
    userSettings.searchDelay = settings.searchDelay || 50;
    userSettings.language = settings.language || 'es';
    
    // Sincronizar idioma con i18n
    if (typeof i18n !== 'undefined' && i18n && typeof i18n.setLanguage === 'function') {
      await i18n.setLanguage(userSettings.language);
    }
  } catch (error) {
    // Error silencioso para páginas donde chrome.storage no está disponible
    userSettings.defaultSearchEngine = 'google';
    userSettings.searchTabs = true;
    userSettings.searchBookmarks = true;
    userSettings.searchHistory = true;
    userSettings.maxResults = 5;
    userSettings.searchDelay = 50;
    userSettings.language = 'es';
  }
}

// Función para generar URL de búsqueda según el motor configurado
function getSearchUrl(query, engine = null) {
  const searchEngine = engine || userSettings.defaultSearchEngine;
  const encodedQuery = encodeURIComponent(query);
  
  switch (searchEngine) {
    case 'bing':
      return `https://www.bing.com/search?q=${encodedQuery}`;
    case 'duckduckgo':
      return `https://duckduckgo.com/?q=${encodedQuery}`;
    case 'yahoo':
      return `https://search.yahoo.com/search?p=${encodedQuery}`;
    case 'perplexity':
      return `https://www.perplexity.ai/?q=${encodedQuery}`;
    case 'google':
    default:
      return `https://www.google.com/search?q=${encodedQuery}`;
  }
}

// Detectar si es macOS
function isMacOS() {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

// Obtener tecla modificadora según la plataforma
function getModifierKey() {
  return isMacOS() ? 'Cmd' : 'Ctrl';
}

// Crear la estructura de la Command Bar
function createCommandBar() {
  if (commandBarContainer) return;

  // Crear contenedor principal
  commandBarContainer = document.createElement('div');
  commandBarContainer.id = 'commandbar-container';
  const modifierKey = getModifierKey();
  
  commandBarContainer.innerHTML = `
    <div class="commandbar-overlay" id="commandbar-overlay">
      <div class="commandbar-modal">
        <div class="commandbar-header">
          <input type="text" 
                 id="commandbar-input" 
                 placeholder="${i18n.t('searchPlaceholder')}"
                 autocomplete="off"
                 spellcheck="false">
          <button id="commandbar-close" class="commandbar-close-btn">✕</button>
        </div>
        <div class="commandbar-content">
          <div class="commandbar-suggestions" id="commandbar-suggestions">
            <div class="commandbar-section">
              <div class="commandbar-section-title">${i18n.t('sections.quickCommands')}</div>
              <div class="commandbar-item" data-action="new-tab">
                <span class="commandbar-icon">🆕</span>
                <span class="commandbar-text">${i18n.t('commands.newTab')}</span>
                <span class="commandbar-shortcut">${modifierKey}+T</span>
              </div>
              <div class="commandbar-item" data-action="new-window">
                <span class="commandbar-icon">🖼️</span>
                <span class="commandbar-text">${i18n.t('commands.newWindow')}</span>
                <span class="commandbar-shortcut">${modifierKey}+N</span>
              </div>
              <div class="commandbar-item" data-action="incognito">
                <span class="commandbar-icon">🕵️</span>
                <span class="commandbar-text">${i18n.t('commands.incognito')}</span>
                <span class="commandbar-shortcut">${modifierKey}+Shift+N</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(commandBarContainer);
  setupEventListeners();
}

// Configurar event listeners
function setupEventListeners() {
  const input = document.getElementById('commandbar-input');
  const overlay = document.getElementById('commandbar-overlay');
  const closeBtn = document.getElementById('commandbar-close');
  const suggestions = document.getElementById('commandbar-suggestions');

  // Input events
  input.addEventListener('input', handleInput);
  input.addEventListener('keydown', handleKeyDown);

  // Close events
  closeBtn.addEventListener('click', hideCommandBar);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideCommandBar();
  });

  // Suggestion clicks
  suggestions.addEventListener('click', handleSuggestionClick);
}

// Constantes de configuración del cache híbrido
const AUTOCOMPLETE_CACHE_SIZE = 5000; // Tamaño máximo del cache
const AUTOCOMPLETE_CACHE_TRIM_SIZE = 2500; // Tamaño al que se reduce cuando se limpia
const AUTOCOMPLETE_DEBOUNCE_MS = 50; // Tiempo de debounce para autocompletado rápido

// Variables para autocompletado
let autocompleteSuggestion = '';
let autocompleteData = null;
let lastAutocompleteQuery = ''; // Para evitar autocompletados repetidos
let autocompleteCache = new Map(); // Cache híbrido para resultados (hasta 5000 entradas)
let isAutocompletePending = false; // Para evitar solapamientos

// Manejar input
function handleInput(e) {
  const currentLength = e.target.value.length;
  const wasDeleting = isDeleting;
  isDeleting = currentLength < lastInputLength;
  lastInputLength = currentLength;
  
  // Extender el período de borrado para evitar autocompletado inmediato
  if (isDeleting) {
    isInDeletionMode = true;
    clearAutocomplete(); // Limpiar INMEDIATAMENTE al detectar borrado
    
    if (isDeletingTimeout) {
      clearTimeout(isDeletingTimeout);
    }
    // Mantener bloqueado por 500ms (más tiempo)
    isDeletingTimeout = setTimeout(() => {
      isDeleting = false;
      isInDeletionMode = false;
      isDeletingTimeout = null;
    }, 500);
  }
  
  // CRUCIAL: Si hay texto seleccionado y el usuario está escribiendo, 
  // significa que quiere cambiar la sugerencia, no aceptarla
  if (e.target.selectionStart !== e.target.selectionEnd) {
    // Hay texto seleccionado (autocompletado activo)
    clearAutocomplete();
    // Permitir que el input natural continúe
  }
  
  // Si estamos en medio de un autocompletado y el usuario sigue escribiendo
  if (isAutocompletingFromTyping) {
    isAutocompletingFromTyping = false;
    return;
  }
  
  const query = e.target.value.trim();
  
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (query) {
      performSearch(query);
      
      // Solo autocompletar si NO está borrando y no empieza con "/"
      if (!isDeleting && !isInDeletionMode && !query.startsWith('/') && query.length >= 2) {
        // Autocompletado INSTANTÁNEO estilo Arc
        performAutocompleteInstant(query);
      } else {
        // Limpiar timeout y autocompletado inmediatamente
        if (autocompleteTimeout) {
          clearTimeout(autocompleteTimeout);
          autocompleteTimeout = null;
        }
        clearAutocomplete();
      }
      
      // Mostrar comandos si empieza con "/"
      if (query.startsWith('/')) {
        showAllCommands(query.slice(1));
      }
    } else {
      showDefaultSuggestions();
      clearAutocomplete();
    }
  }, userSettings.searchDelay); // Usar configuración del usuario
}

// Manejar autocompletado en la barra de input
function handleInputAutocomplete(query, suggestion) {
  const input = document.getElementById('commandbar-input');
  if (!input || !suggestion) return;
  
  // Verificar si la query está al inicio de la sugerencia
  if (suggestion.toLowerCase().startsWith(query.toLowerCase())) {
    // Calcular el texto a autocompletar
    const autocompleteText = suggestion.substring(query.length);
    
    // Establecer el valor completo
    input.value = query + autocompleteText;
    
    // Seleccionar solo la parte autocompletada
    input.setSelectionRange(query.length, suggestion.length);
    
    // Marcar que estamos en modo autocompletado
    isAutocompletingFromTyping = true;
  }
}

// Función de autocompletado instantáneo usando el historial
async function performAutocompleteInstant(query) {
  if (!query || query.length < 2) {
    clearAutocomplete();
    return;
  }
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'search_history_autocomplete',
      query: query
    });
    
    if (response && response.success && response.suggestion) {
      showArcStyleAutocomplete(query, response.suggestion, response.favicon, response.title);
    } else {
      clearAutocomplete();
    }
  } catch (error) {
    clearAutocomplete();
  }
}

// Realizar autocompletado
async function performAutocomplete(query) {
  try {
    // Buscar en historial para autocompletado
    const response = await chrome.runtime.sendMessage({
      action: 'search_history_autocomplete',
      query: query
    });
    
    if (response.success && response.suggestion) {
      // Autocompletar en la barra de input
      handleInputAutocomplete(query, response.suggestion);
      
      // Mostrar sugerencias integradas en el menú (sin hint flotante)
      showIntegratedSuggestions(response.favicon, response.title, response.suggestion);
    } else {
      // Limpiar autocompletado si no hay sugerencias
      clearAutocomplete();
    }
  } catch (error) {
    // Error silencioso para no afectar la experiencia
    clearAutocomplete();
  }
}

// Autocompletado estilo Arc Browser
function showArcStyleAutocomplete(query, suggestion, favicon, title) {
  const input = document.getElementById('commandbar-input');
  if (!input) return;
  
  // Verificar que el usuario no esté escribiendo activamente
  const currentValue = input.value.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Solo proceder si el input actual coincide con la query
  if (!currentValue.startsWith(queryLower)) {
    return; // El usuario ha seguido escribiendo, no interferir
  }
  
  autocompleteSuggestion = suggestion;
  autocompleteData = { suggestion, favicon, title };
  
  const suggestionLower = suggestion.toLowerCase();
  
  if (suggestionLower.startsWith(queryLower) && suggestion.length > query.length) {
    // CRUCIAL: Solo autocompletar si no hay texto seleccionado y el input coincide exactamente
    if (input.selectionStart === input.selectionEnd && input.value === query) {
      // Rellena el input con la sugerencia completa
      isAutocompletingFromTyping = true;
      const cursorPosition = query.length;
      
      // Usar requestAnimationFrame para evitar conflictos con input events
      requestAnimationFrame(() => {
        // Verificar una vez más que el input no ha cambiado
        if (input.value === query) {
          input.value = suggestion;
          // Selecciona solo la parte autocompletada
          input.setSelectionRange(cursorPosition, suggestion.length);
        }
        isAutocompletingFromTyping = false;
      });
    }
    
    // Mostrar hint visual con favicon (siempre, incluso sin autocompletar)
    showFaviconHint(favicon, title, suggestion);
  }
}

// Mostrar sugerencia de autocompletado con favicon (solo integrada en menú)
function showFaviconHint(favicon, title, url) {
  // Solo mostrar la recomendación integrada en el menú
  showIntegratedSuggestions(favicon, title, url);
}



// Mostrar toast de notificación
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
  `;
  
  // Colores según tipo
  const colors = {
    success: '#10b981',
    error: '#ef4444', 
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  
  toast.style.backgroundColor = colors[type] || colors.info;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Animación de entrada
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Auto-remover después de 3 segundos
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}



// Limpiar autocompletado
function clearAutocomplete() {
  // Remover sección de autocompletado integrada
  const integratedSection = document.querySelector('.commandbar-section[data-type="integrated-autocomplete"]');
  if (integratedSection) {
    integratedSection.remove();
  }
}

// Función para limpiar cache periódicamente (evitar memory leaks)
function cleanAutocompleteCache() {
  if (autocompleteCache.size > AUTOCOMPLETE_CACHE_SIZE) {
    // Mantener solo los más recientes para optimizar memoria
    const entries = Array.from(autocompleteCache.entries());
    autocompleteCache.clear();
    entries.slice(-AUTOCOMPLETE_CACHE_TRIM_SIZE).forEach(([key, value]) => {
      autocompleteCache.set(key, value);
    });
  }
}

// Manejar teclas especiales
function handleKeyDown(e) {
  const suggestions = document.querySelectorAll('.commandbar-item');
  const selected = document.querySelector('.commandbar-item.selected');
  
  switch (e.key) {
    case 'Escape':
      hideCommandBar();
      break;
      
    case 'Tab':
      e.preventDefault();
      // Si hay autocompletado activo, aceptarlo primero
      if (autocompleteSuggestion && e.target.selectionStart < e.target.value.length) {
        e.target.setSelectionRange(e.target.value.length, e.target.value.length);
        clearAutocomplete();
      } else {
        // Si no hay autocompletado, buscar en Perplexity
        const query = e.target.value.trim();
        if (query) {
          executePerplexitySearch(query);
        }
      }
      break;
      
    case 'Enter':
      e.preventDefault();
      if (selected) {
        executeAction(selected);
      } else {
        const query = e.target.value.trim();
        if (query) {
          // Si hay autocompletado activo, navegar directamente
          if (autocompleteData && query === autocompleteData.suggestion) {
            navigateToUrl(query);
          } else {
            executeSearch(query);
          }
        }
      }
      break;
      
      case 'Backspace':
      case 'Delete':
      case ' ':
      case 'Space':
        // Limpiar autocompletado al borrar o poner espacio
        clearAutocomplete();
        if (e.key === 'Backspace' || e.key === 'Delete') {
          isDeleting = true;
          isInDeletionMode = true;
          
          // Extender período de borrado para evitar autocompletado inmediato
          if (isDeletingTimeout) {
            clearTimeout(isDeletingTimeout);
          }
          isDeletingTimeout = setTimeout(() => {
            isDeleting = false;
            isInDeletionMode = false;
            isDeletingTimeout = null;
          }, 500); // Más tiempo para borrado limpio
        }
        break;
        
      default:
        // Para cualquier tecla de escritura, si hay selección activa, limpiar autocompletado
        if (e.target && e.target.selectionStart !== e.target.selectionEnd && 
            e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          // El usuario está escribiendo sobre una selección - limpiar autocompletado
          clearAutocomplete();
        }
        break;
      
    case 'ArrowDown':
      e.preventDefault();
      navigateSuggestions('down');
      break;
      
    case 'ArrowUp':
      e.preventDefault();
      navigateSuggestions('up');
      break;
      
    case 'ArrowRight':
      // Aceptar autocompletado con flecha derecha
      if (autocompleteSuggestion && e.target.selectionStart < e.target.value.length) {
        e.preventDefault();
        e.target.setSelectionRange(e.target.value.length, e.target.value.length);
        clearAutocomplete();
      }
      break;
  }
}

// Navegar por sugerencias con teclado
function navigateSuggestions(direction) {
  const suggestions = document.querySelectorAll('.commandbar-item');
  const selected = document.querySelector('.commandbar-item.selected');
  
  if (suggestions.length === 0) return;
  
  let index = -1;
  if (selected) {
    selected.classList.remove('selected');
    index = Array.from(suggestions).indexOf(selected);
  }
  
  if (direction === 'down') {
    index = (index + 1) % suggestions.length;
  } else {
    index = index <= 0 ? suggestions.length - 1 : index - 1;
  }
  
  suggestions[index].classList.add('selected');
  suggestions[index].scrollIntoView({ block: 'nearest' });
}

// Realizar búsqueda
async function performSearch(query) {
  const suggestions = document.getElementById('commandbar-suggestions');
  
  // Trackear búsquedas (solo si está habilitado)
  trackUsageLocal('search_performed', { 
    type: isURL(query) ? 'url' : query.startsWith('/') ? 'command' : 'text',
    length: query.length 
  });
  
  // Detectar tipo de búsqueda
  if (isURL(query)) {
    showURLSuggestions(query);
  } else if (query.startsWith('/')) {
    showCommandSuggestions(query.slice(1));
  } else {
    showSearchSuggestions(query);
  }
}

// Verificar si es una URL
function isURL(text) {
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  return urlPattern.test(text) || text.includes('.');
}

// Mostrar sugerencias para URLs
function showURLSuggestions(url) {
  const suggestions = document.getElementById('commandbar-suggestions');
  const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
  
  suggestions.innerHTML = `
    <div class="commandbar-section">
      <div class="commandbar-section-title">${i18n.t('sections.navigation')}</div>
      <div class="commandbar-item" data-action="open-url" data-url="${cleanUrl}">
        <span class="commandbar-icon">🌐</span>
        <span class="commandbar-text">${i18n.t('search.goToUrl', { url: cleanUrl })}</span>
      </div>
      <div class="commandbar-item" data-action="open-new-tab" data-url="${cleanUrl}">
        <span class="commandbar-icon">🆕</span>
        <span class="commandbar-text">${i18n.t('search.openInNewTab')}</span>
      </div>
    </div>
  `;
  
  // Buscar en pestañas existentes solo si está habilitado
  if (userSettings.searchTabs) {
    searchInTabs(url);
  }
}



// Mostrar todos los comandos disponibles
function showAllCommands(filter = '') {
  const suggestions = document.getElementById('commandbar-suggestions');
  const modifierKey = getModifierKey();
  
  const commands = [
    { name: i18n.t('commands.newTab').toLowerCase(), icon: '🆕', action: 'new-tab', desc: i18n.t('commandDescs.newTab'), shortcut: `${modifierKey}+T` },
    { name: i18n.t('commands.newWindow').toLowerCase(), icon: '🖼️', action: 'new-window', desc: i18n.t('commandDescs.newWindow'), shortcut: `${modifierKey}+N` },
    { name: i18n.t('commands.incognito').toLowerCase(), icon: '🕵️', action: 'incognito', desc: i18n.t('commandDescs.incognito'), shortcut: `${modifierKey}+Shift+N` },
    { name: i18n.t('commands.pinTab').toLowerCase(), icon: '📌', action: 'pin-tab', desc: i18n.t('commandDescs.pinTab') },
    { name: i18n.t('commands.closeTab').toLowerCase(), icon: '❌', action: 'close-tab', desc: i18n.t('commandDescs.closeTab'), shortcut: `${modifierKey}+W` },
    { name: i18n.t('commands.duplicateTab').toLowerCase(), icon: '📄', action: 'duplicate-tab', desc: i18n.t('commandDescs.duplicateTab') },
    { name: i18n.t('commands.reload').toLowerCase(), icon: '🔄', action: 'reload', desc: i18n.t('commandDescs.reload'), shortcut: `${modifierKey}+R` },
    { name: i18n.t('commands.bookmarks').toLowerCase(), icon: '🔖', action: 'show-bookmarks', desc: i18n.t('commandDescs.bookmarks'), shortcut: `${modifierKey}+Shift+O` },
    { name: i18n.t('commands.history').toLowerCase(), icon: '📚', action: 'show-history', desc: i18n.t('commandDescs.history'), shortcut: `${modifierKey}+H` },
    { name: i18n.t('commands.downloads').toLowerCase(), icon: '⬇️', action: 'show-downloads', desc: i18n.t('commandDescs.downloads'), shortcut: `${modifierKey}+J` },
    { name: i18n.t('commands.settings').toLowerCase(), icon: '⚙️', action: 'show-settings', desc: i18n.t('commandDescs.settings') },
    { name: i18n.t('commands.extensions').toLowerCase(), icon: '🧩', action: 'show-extensions', desc: i18n.t('commandDescs.extensions') },
    { name: i18n.t('commands.readerMode').toLowerCase(), icon: '📖', action: 'reader-mode', desc: i18n.t('commandDescs.readerMode') },
    { name: i18n.t('commands.editCurrentUrl').toLowerCase(), icon: '✏️', action: 'edit-current-url', desc: i18n.t('commandDescs.editCurrentUrl'), shortcut: `${modifierKey}+Shift+K` }
  ];
  
  // Filtrar comandos si hay filtro
  const filtered = filter 
    ? commands.filter(cmd => 
        cmd.name.toLowerCase().includes(filter.toLowerCase()) ||
        cmd.desc.toLowerCase().includes(filter.toLowerCase())
      )
    : commands;
  
  let html = `<div class="commandbar-section"><div class="commandbar-section-title">${i18n.t('sections.availableCommands')}</div>`;
  
  if (filtered.length === 0) {
    html += `<div class="commandbar-no-results">${i18n.t('search.noResults')}</div>`;
  } else {
    filtered.forEach(cmd => {
      const shortcut = cmd.shortcut ? `<span class="commandbar-shortcut">${cmd.shortcut}</span>` : '';
      html += `
        <div class="commandbar-item" data-action="${cmd.action}">
          <span class="commandbar-icon">${cmd.icon}</span>
          <span class="commandbar-text">${cmd.desc}</span>
          ${shortcut}
        </div>
      `;
    });
  }
  
  html += '</div>';
  suggestions.innerHTML = html;
}

// Mostrar sugerencias de comandos (función legacy)
function showCommandSuggestions(command) {
  showAllCommands(command);
}

// Mostrar sugerencias de búsqueda
async function showSearchSuggestions(query) {
  const input = document.getElementById('commandbar-input');
  const suggestionsContainer = document.getElementById('commandbar-suggestions');
  
  if (!input || !suggestionsContainer) return;
  
  // Limpiar sugerencias anteriores
  suggestionsContainer.innerHTML = '';
  
  let hasResults = false;
  
  try {
    // Determinar qué fuentes buscar basado en configuración
    const searchPromises = [];
    
    if (userSettings.searchTabs) {
      searchPromises.push(searchInTabs(query));
    }
    
    if (userSettings.searchBookmarks) {
      searchPromises.push(searchInBookmarks(query));
    }
    
    if (userSettings.searchHistory) {
      searchPromises.push(searchInHistory(query));
    }
    
    // Ejecutar búsquedas en paralelo
    const results = await Promise.all(searchPromises);
    
    // Procesar resultados
    results.forEach(result => {
      if (result) {
        hasResults = true;
      }
    });
    
    // Agregar sugerencias de búsqueda web si hay texto pero pocos resultados
    if (query.trim() && (!hasResults || suggestionsContainer.children.length < 3)) {
      const engines = [
        { key: 'google', name: i18n.t('search.searchInGoogle', { query }) },
        { key: 'bing', name: i18n.t('search.searchInBing', { query }) },
        { key: 'duckduckgo', name: i18n.t('search.searchInDuckDuckGo', { query }) },
        { key: 'yahoo', name: i18n.t('search.searchInYahoo', { query }) },
        { key: 'perplexity', name: i18n.t('search.searchInPerplexity', { query }) }
      ];
      
      // Crear sección de búsqueda web
      const webSection = document.createElement('div');
      webSection.className = 'commandbar-section';
      webSection.innerHTML = `<div class="commandbar-section-title">${i18n.t('sections.webSearch')}</div>`;
      
      engines.forEach((engine, index) => {
        const item = document.createElement('div');
        item.className = 'commandbar-item';
        item.dataset.action = `${engine.key}-search`;
        item.dataset.query = query;
        
        // Determinar el atajo de teclado
        let shortcut = '';
        if (engine.key === 'perplexity') {
          shortcut = 'Tab';
        } else if (engine.key === userSettings.defaultSearchEngine) {
          shortcut = 'Enter';
        }
        
        item.innerHTML = `
          <span class="commandbar-icon">🔍</span>
          <span class="commandbar-text">${engine.name}</span>
          ${shortcut ? `<span class="commandbar-shortcut">${shortcut}</span>` : ''}
        `;
        webSection.appendChild(item);
      });
      
      suggestionsContainer.appendChild(webSection);
      hasResults = true;
    }
    
  } catch (error) {
    console.error('Error in search suggestions:', error);
  }
  
  // Si no hay resultados, mostrar mensaje
  if (!hasResults) {
    suggestionsContainer.innerHTML = `
      <div class="commandbar-no-results">
        <span>${i18n.t('search.noResults')}</span>
      </div>
    `;
  }
}

// Buscar en pestañas
async function searchInTabs(query) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'search_tabs',
      query: query
    });
    
    if (response.success && response.tabs.length > 0) {
      appendTabResults(response.tabs);
      return true; // Indicar que hubo resultados
    }
    return false; // Indicar que no hubo resultados
  } catch (error) {
    console.error('Error buscando en pestañas:', error);
    return false;
  }
}

// Buscar en bookmarks
async function searchInBookmarks(query) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'search_bookmarks',
      query: query
    });
    
    if (response.success && response.bookmarks.length > 0) {
      appendBookmarkResults(response.bookmarks);
      return true; // Indicar que hubo resultados
    }
    return false; // Indicar que no hubo resultados
  } catch (error) {
    console.error('Error buscando en bookmarks:', error);
    return false;
  }
}

// Buscar en historial
async function searchInHistory(query) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'search_history',
      query: query
    });
    
    if (response.success && response.history.length > 0) {
      appendHistoryResults(response.history);
      return true; // Indicar que hubo resultados
    }
    return false; // Indicar que no hubo resultados
  } catch (error) {
    console.error('Error buscando en historial:', error);
    return false;
  }
}

// Agregar resultados de pestañas
function appendTabResults(tabs) {
  const suggestions = document.getElementById('commandbar-suggestions');
  
  let html = `<div class="commandbar-section"><div class="commandbar-section-title">${i18n.t('sections.openTabs')}</div>`;
  tabs.slice(0, userSettings.maxResults).forEach(tab => {
    const favicon = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="%23666" d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"/></svg>';
    html += `
      <div class="commandbar-item" data-action="switch-tab" data-tab-id="${tab.id}">
        <img class="commandbar-favicon" src="${favicon}" alt="">
        <span class="commandbar-text">${tab.title}</span>
        <span class="commandbar-url">${new URL(tab.url).hostname}</span>
      </div>
    `;
  });
  html += '</div>';
  
  suggestions.innerHTML += html;
}

// Agregar resultados de bookmarks
function appendBookmarkResults(bookmarks) {
  const suggestions = document.getElementById('commandbar-suggestions');
  
  let html = `<div class="commandbar-section"><div class="commandbar-section-title">${i18n.t('sections.bookmarks')}</div>`;
  bookmarks.slice(0, userSettings.maxResults).forEach(bookmark => {
    if (bookmark.url) {
      html += `
        <div class="commandbar-item" data-action="open-bookmark" data-url="${bookmark.url}">
          <span class="commandbar-icon">🔖</span>
          <span class="commandbar-text">${bookmark.title}</span>
          <span class="commandbar-url">${new URL(bookmark.url).hostname}</span>
        </div>
      `;
    }
  });
  html += '</div>';
  
  suggestions.innerHTML += html;
}

// Agregar resultados de historial
function appendHistoryResults(history) {
  const suggestions = document.getElementById('commandbar-suggestions');
  
  let html = `<div class="commandbar-section"><div class="commandbar-section-title">${i18n.t('sections.history')}</div>`;
  history.slice(0, userSettings.maxResults).forEach(item => {
    html += `
      <div class="commandbar-item" data-action="open-history" data-url="${item.url}">
        <span class="commandbar-icon">📚</span>
        <span class="commandbar-text">${item.title}</span>
        <span class="commandbar-url">${new URL(item.url).hostname}</span>
      </div>
    `;
  });
  html += '</div>';
  
  suggestions.innerHTML += html;
}

// Mostrar sugerencias por defecto
function showDefaultSuggestions() {
  const suggestions = document.getElementById('commandbar-suggestions');
  const modifierKey = getModifierKey();
  
  suggestions.innerHTML = `
    <div class="commandbar-section">
      <div class="commandbar-section-title">${i18n.t('sections.quickCommands')}</div>
      <div class="commandbar-item" data-action="new-tab">
        <span class="commandbar-icon">🆕</span>
        <span class="commandbar-text">${i18n.t('commands.newTab')}</span>
        <span class="commandbar-shortcut">${modifierKey}+T</span>
      </div>
      <div class="commandbar-item" data-action="new-window">
        <span class="commandbar-icon">🖼️</span>
        <span class="commandbar-text">${i18n.t('commands.newWindow')}</span>
        <span class="commandbar-shortcut">${modifierKey}+N</span>
      </div>
      <div class="commandbar-item" data-action="incognito">
        <span class="commandbar-icon">🕵️</span>
        <span class="commandbar-text">${i18n.t('commands.incognito')}</span>
        <span class="commandbar-shortcut">${modifierKey}+Shift+N</span>
      </div>
      <div class="commandbar-item" data-action="pin-tab">
        <span class="commandbar-icon">📌</span>
        <span class="commandbar-text">${i18n.t('commands.pinTab')}</span>
      </div>
      <div class="commandbar-item" data-action="reload">
        <span class="commandbar-icon">🔄</span>
        <span class="commandbar-text">${i18n.t('commands.reload')}</span>
        <span class="commandbar-shortcut">${modifierKey}+R</span>
      </div>
    </div>
    <div class="commandbar-section">
      <div class="commandbar-section-title">${i18n.t('sections.quickAccess')}</div>
      <div class="commandbar-item" data-action="show-bookmarks">
        <span class="commandbar-icon">🔖</span>
        <span class="commandbar-text">${i18n.t('commands.bookmarks')}</span>
      </div>
      <div class="commandbar-item" data-action="show-history">
        <span class="commandbar-icon">📚</span>
        <span class="commandbar-text">${i18n.t('commands.history')}</span>
      </div>
      <div class="commandbar-item" data-action="show-downloads">
        <span class="commandbar-icon">⬇️</span>
        <span class="commandbar-text">${i18n.t('commands.downloads')}</span>
      </div>
    </div>
  `;
}

// Manejar clics en sugerencias
function handleSuggestionClick(e) {
  if (e.target.closest('.commandbar-item')) {
    executeAction(e.target.closest('.commandbar-item'));
  }
}

async function executeAction(item) {
  if (!item) return;
  
  const action = item.dataset.action;
  
  trackUsageLocal('command_executed', { command: action });
  
  switch (action) {
    case 'new-tab':
      await chrome.runtime.sendMessage({ action: 'create_tab', url: 'chrome://newtab/' });
      break;
      
    case 'pin-tab':
      const currentTabId = await getCurrentTabId();
      if (currentTabId) {
        await chrome.runtime.sendMessage({ action: 'pin_tab', tabId: currentTabId });
      }
      break;
      
    case 'close-tab':
      const currentTabId2 = await getCurrentTabId();
      if (currentTabId2) {
        await chrome.runtime.sendMessage({ action: 'close_tab', tabId: currentTabId2 });
      }
      break;
      
    case 'duplicate-tab':
      const currentTabId3 = await getCurrentTabId();
      if (currentTabId3) {
        await chrome.runtime.sendMessage({ action: 'duplicate_tab', tabId: currentTabId3 });
      }
      break;
      
    case 'switch-tab':
      const tabId = parseInt(item.dataset.tabId);
      await chrome.runtime.sendMessage({ action: 'switch_tab', tabId });
      break;
      
    case 'close-target-tab':
      const targetTabId = parseInt(item.dataset.tabId);
      await chrome.runtime.sendMessage({ action: 'close_tab', tabId: targetTabId });
      break;
      
    case 'open-bookmark':
    case 'open-history':
      if (isOurExtensionPage()) {
        // En nuestra página de extensión, navegar en la misma pestaña
        window.location.href = item.dataset.url;
      } else {
        // En otras páginas, abrir en nueva pestaña (MARCADA COMO DESDE COMMANDBAR)
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: item.dataset.url,
          active: true,
          fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
        });
      }
      break;
      
    case 'open-bookmark-background':
      await chrome.runtime.sendMessage({
        action: 'create_tab',
        url: item.dataset.url,
        active: false,
        fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
      });
      break;
      
    case 'open-new-tab':
      await chrome.runtime.sendMessage({
        action: 'create_tab',
        url: item.dataset.url,
        active: false,
        fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
      });
      break;
      
    case 'google-search':
      if (isOurExtensionPage()) {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(item.dataset.query)}`;
      } else {
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: `https://www.google.com/search?q=${encodeURIComponent(item.dataset.query)}`,
          fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
        });
      }
      break;
      
    case 'bing-search':
      if (isOurExtensionPage()) {
        window.location.href = `https://www.bing.com/search?q=${encodeURIComponent(item.dataset.query)}`;
      } else {
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: `https://www.bing.com/search?q=${encodeURIComponent(item.dataset.query)}`,
          fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
        });
      }
      break;
      
    case 'duckduckgo-search':
      if (isOurExtensionPage()) {
        window.location.href = `https://duckduckgo.com/?q=${encodeURIComponent(item.dataset.query)}`;
      } else {
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: `https://duckduckgo.com/?q=${encodeURIComponent(item.dataset.query)}`,
          fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
        });
      }
      break;
      
    case 'yahoo-search':
      if (isOurExtensionPage()) {
        window.location.href = `https://search.yahoo.com/search?p=${encodeURIComponent(item.dataset.query)}`;
      } else {
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: `https://search.yahoo.com/search?p=${encodeURIComponent(item.dataset.query)}`,
          fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
        });
      }
      break;
      
    case 'perplexity-search':
      if (isOurExtensionPage()) {
        window.location.href = `https://www.perplexity.ai/search?q=${encodeURIComponent(item.dataset.query)}`;
      } else {
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: `https://www.perplexity.ai/search?q=${encodeURIComponent(item.dataset.query)}`,
          fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
        });
      }
      break;
      
    case 'show-bookmarks':
      if (isOurExtensionPage()) {
        window.location.href = 'chrome://bookmarks/';
      } else {
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: 'chrome://bookmarks/',
          fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
        });
      }
      break;
      
    case 'show-history':
      if (isOurExtensionPage()) {
        window.location.href = 'chrome://history/';
      } else {
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: 'chrome://history/',
          fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
        });
      }
      break;
      
    case 'show-downloads':
      if (isOurExtensionPage()) {
        window.location.href = 'chrome://downloads/';
      } else {
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: 'chrome://downloads/',
          fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
        });
      }
      break;
      
    case 'show-settings':
      if (isOurExtensionPage()) {
        window.location.href = 'chrome://settings/';
      } else {
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: 'chrome://settings/',
          fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
        });
      }
      break;
      
    case 'show-extensions':
      if (isOurExtensionPage()) {
        window.location.href = 'chrome://extensions/';
      } else {
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: 'chrome://extensions/',
          fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
        });
      }
      break;
      
    case 'reader-mode':
      // Intentar activar modo lectura (experimental)
      document.body.style.filter = document.body.style.filter ? '' : 'contrast(1.2) brightness(0.9)';
      break;
      
    case 'edit-current-url':
      // Triggerar el modo edición de URL
      const currentUrl = window.location.href;
      let cleanUrl = currentUrl;
      try {
        const url = new URL(cleanUrl);
        cleanUrl = url.hostname.replace('www.', '') + (url.pathname !== '/' ? url.pathname : '') + url.search;
      } catch (e) {
        // Si no es una URL válida, usar como está
      }
      hideCommandBar();
      showCommandBar(cleanUrl);
      break;

  }
  
  hideCommandBar();
}

// Detectar si estamos en nuestra página de extensión
function isOurExtensionPage() {
  return window.location.href.includes('new_tab.html');
}

// Navegar directamente a URL
async function navigateToUrl(url) {
  const finalUrl = url.startsWith('http') ? url : `https://${url}`;
  
  if (editMode || isOurExtensionPage()) {
    // En modo edición O en nuestra página de extensión, navegar en la misma pestaña
    window.location.href = finalUrl;
  } else {
    // En modo normal en otras páginas, abrir en nueva pestaña (MARCADA COMO DESDE COMMANDBAR)
    await chrome.runtime.sendMessage({
      action: 'create_tab',
      url: finalUrl,
      active: true,
      fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
    });
  }
  hideCommandBar();
}

// Buscar en Perplexity
async function searchInPerplexity(query) {
  if (editMode || isOurExtensionPage()) {
    // En modo edición O en nuestra página de extensión, buscar en la misma pestaña
    window.location.href = `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`;
  } else {
    // En modo normal en otras páginas, abrir en nueva pestaña (MARCADA COMO DESDE COMMANDBAR)
    await chrome.runtime.sendMessage({
      action: 'create_tab',
      url: `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`,
      fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
    });
  }
  hideCommandBar();
}

// Ejecutar búsqueda directa
async function executeSearch(query) {
  if (isURL(query)) {
    await navigateToUrl(query);
  } else {
    const searchUrl = getSearchUrl(query);
    
    if (editMode || isOurExtensionPage()) {
      // En modo edición O en nuestra página de extensión, buscar en la misma pestaña
      window.location.href = searchUrl;
    } else {
      // En modo normal en otras páginas, abrir en nueva pestaña (MARCADA COMO DESDE COMMANDBAR)
      await chrome.runtime.sendMessage({
        action: 'create_tab',
        url: searchUrl,
        fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
      });
    }
    hideCommandBar();
  }
}

// Ejecutar búsqueda específica en Perplexity
async function executePerplexitySearch(query) {
  if (isURL(query)) {
    await navigateToUrl(query);
  } else {
    const perplexityUrl = getSearchUrl(query, 'perplexity');
    
    if (editMode || isOurExtensionPage()) {
      // En modo edición O en nuestra página de extensión, buscar en la misma pestaña
      window.location.href = perplexityUrl;
    } else {
      // En modo normal en otras páginas, abrir en nueva pestaña
      await chrome.runtime.sendMessage({
        action: 'create_tab',
        url: perplexityUrl,
        fromCommandBar: true // Marcar que viene de CommandBar para evitar auto-open
      });
    }
    hideCommandBar();
  }
}

// Obtener ID de pestaña actual
async function getCurrentTabId() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'get_current_tab' }, (response) => {
      resolve(response.tabId);
    });
  });
}

// Mostrar Command Bar
function showCommandBar(prefillUrl = null) {
  
  if (!commandBarContainer) {
    createCommandBar();
  }
  
  // Trackear apertura de CommandBar
  trackUsageLocal('commandbar_opened', { 
    method: prefillUrl ? 'edit_mode' : 'normal',
    prefilled: !!prefillUrl 
  });
  
  commandBarContainer.style.display = 'block';
  isCommandBarVisible = true;
  
  // Focus en el input
  setTimeout(() => {
    const input = document.getElementById('commandbar-input');
    if (!input) {
      console.error('❌ No se encontró commandbar-input');
      return;
    }
    
    input.focus();
    
    if (prefillUrl) {
      // Modo edición: rellenar con URL actual
      editMode = true;
      input.value = prefillUrl;
      input.select(); // Seleccionar todo el texto
      input.placeholder = i18n.t('editUrlPlaceholder');
      
      // Mostrar hint de modo edición
      showEditModeHint();
    } else {
      // Modo normal
      editMode = false;
      input.select();
      input.placeholder = i18n.t('searchPlaceholder');
      showDefaultSuggestions();
    }
  }, 50);
}

// Ocultar Command Bar
function hideCommandBar() {
  if (commandBarContainer) {
    commandBarContainer.style.display = 'none';
    isCommandBarVisible = false;
    editMode = false;
    
    // Limpiar input
    const input = document.getElementById('commandbar-input');
    input.value = '';
    
    // Limpiar autocompletado
    clearAutocomplete();
    
    // Limpiar cache periódicamente para evitar memory leaks
    cleanAutocompleteCache();
    
    // Limpiar hint de modo edición
    clearEditModeHint();
    
    // Remover selección
    const selected = document.querySelector('.commandbar-item.selected');
    if (selected) {
      selected.classList.remove('selected');
    }
  }
}

// Toggle Command Bar
function toggleCommandBar() {
  if (isCommandBarVisible) {
    hideCommandBar();
  } else {
    showCommandBar();
  }
}

// Mostrar hint de modo edición
function showEditModeHint() {
  clearEditModeHint(); // Limpiar hint anterior
  
  const header = document.querySelector('.commandbar-header');
  if (!header) return;
  
  const hintEl = document.createElement('div');
  hintEl.id = 'commandbar-edit-hint';
  hintEl.className = 'commandbar-edit-hint';
  hintEl.innerHTML = `
    <span class="edit-hint-icon">✏️</span>
    <span class="edit-hint-text">${i18n.t('hints.editMode')}</span>
  `;
  
  header.appendChild(hintEl);
}

// Limpiar hint de modo edición
function clearEditModeHint() {
  const editHint = document.getElementById('commandbar-edit-hint');
  if (editHint) {
    editHint.remove();
  }
}

// Mostrar sugerencias integradas en el menú (independiente del autocompletado en la barra)
function showIntegratedSuggestions(favicon, title, url) {
  const suggestionsContainer = document.getElementById('commandbar-suggestions');
  if (!suggestionsContainer) return;
  
  // Función interna para crear la sugerencia integrada
  function createIntegratedSuggestion() {
    // Verificar si ya existe una sección de autocompletado integrada
    let existingSection = suggestionsContainer.querySelector('.commandbar-section[data-type="integrated-autocomplete"]');
    
    if (!existingSection) {
      // Crear nueva sección de autocompletado integrada
      existingSection = document.createElement('div');
      existingSection.className = 'commandbar-section';
      existingSection.setAttribute('data-type', 'integrated-autocomplete');
      
      // Usar traducción con fallback más robusto
      let sectionTitle = 'Autocompletado'; // Fallback por defecto
      try {
        if (typeof i18n !== 'undefined' && i18n && typeof i18n.t === 'function') {
          const translated = i18n.t('sections.autocomplete');
          if (translated && translated !== 'sections.autocomplete') {
            sectionTitle = translated;
          }
        }
      } catch (error) {
        // Error silencioso, usar fallback
      }
      
      existingSection.innerHTML = `
        <div class="commandbar-section-title">${sectionTitle}</div>
      `;
      
      // Insertar al principio del contenedor de sugerencias
      suggestionsContainer.insertBefore(existingSection, suggestionsContainer.firstChild);
    }
    
    // Limpiar contenido anterior de la sección
    let sectionTitle = 'Autocompletado'; // Fallback por defecto
    try {
      if (typeof i18n !== 'undefined' && i18n && typeof i18n.t === 'function') {
        const translated = i18n.t('sections.autocomplete');
        if (translated && translated !== 'sections.autocomplete') {
          sectionTitle = translated;
        }
      }
    } catch (error) {
      // Error silencioso, usar fallback
    }
    
    existingSection.innerHTML = `
      <div class="commandbar-section-title">${sectionTitle}</div>
    `;
    
    // Crear elemento de autocompletado integrado
    const autocompleteItem = document.createElement('div');
    autocompleteItem.className = 'commandbar-item commandbar-autocomplete-item';
    autocompleteItem.dataset.action = 'navigate';
    autocompleteItem.dataset.url = url;
    
    // Usar traducción con fallback más robusto
    let actionText = 'Abrir'; // Fallback por defecto
    try {
      if (typeof i18n !== 'undefined' && i18n && typeof i18n.t === 'function') {
        const translated = i18n.t('actions.open');
        if (translated && translated !== 'actions.open') {
          actionText = translated;
        }
      }
    } catch (error) {
      // Error silencioso, usar fallback
    }
    
    autocompleteItem.innerHTML = `
      <span class="commandbar-favicon">
        <img src="${favicon}" alt="" onerror="this.style.display='none'">
      </span>
      <div class="commandbar-text">
        <div class="commandbar-title">${title}</div>
        <div class="commandbar-url">${url}</div>
      </div>
      <span class="commandbar-shortcut">${actionText}</span>
    `;
    
    // Agregar evento de clic
    autocompleteItem.addEventListener('click', () => {
      navigateToUrl(url);
    });
    
    // Agregar a la sección
    existingSection.appendChild(autocompleteItem);
  }
  
  // Intentar crear inmediatamente, si falla, esperar un poco
  try {
    createIntegratedSuggestion();
  } catch (error) {
    // Si hay error, esperar un poco y reintentar
    setTimeout(() => {
      try {
        createIntegratedSuggestion();
      } catch (retryError) {
        // Si aún falla, crear con fallbacks por defecto
        createIntegratedSuggestion();
      }
    }, 100);
  }
}

// Escuchar mensajes del background script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  
  if (message.action === 'toggle_commandbar') {
    toggleCommandBar();
  } else if (message.action === 'edit_current_url') {
    // Convertir URL completa a formato simple para edición
    let cleanUrl = message.currentUrl;
    try {
      const url = new URL(cleanUrl);
      // Mostrar dominio + path si no es la raíz
      cleanUrl = url.hostname.replace('www.', '') + (url.pathname !== '/' ? url.pathname : '') + url.search;
    } catch (e) {
      // Si no es una URL válida, usar como está
    }
    showCommandBar(cleanUrl);
  } else if (message.action === 'settings_updated') {
    // Actualizar configuración local
    if (message.settings) {
      if (message.settings.defaultSearchEngine !== undefined) {
        userSettings.defaultSearchEngine = message.settings.defaultSearchEngine;
      }
      if (message.settings.searchTabs !== undefined) {
        userSettings.searchTabs = message.settings.searchTabs;
      }
      if (message.settings.searchBookmarks !== undefined) {
        userSettings.searchBookmarks = message.settings.searchBookmarks;
      }
      if (message.settings.searchHistory !== undefined) {
        userSettings.searchHistory = message.settings.searchHistory;
      }
      if (message.settings.maxResults !== undefined) {
        userSettings.maxResults = message.settings.maxResults;
      }
      if (message.settings.searchDelay !== undefined) {
        userSettings.searchDelay = message.settings.searchDelay;
      }
    }
    
    // Actualizar configuración del idioma
    if (message.settings && message.settings.language) {
      await i18n.setLanguage(message.settings.language);
      
      // Si CommandBar está visible, actualizarlo
      if (isCommandBarVisible) {
        const input = document.getElementById('commandbar-input');
        const currentValue = input ? input.value : '';
        
        // Recrear CommandBar con nuevo idioma
        if (commandBarContainer) {
          commandBarContainer.remove();
          commandBarContainer = null;
        }
        
        createCommandBar();
        showCommandBar();
        
        // Restaurar valor del input si había algo
        if (currentValue && input) {
          setTimeout(() => {
            const newInput = document.getElementById('commandbar-input');
            if (newInput) {
              newInput.value = currentValue;
              newInput.focus();
            }
          }, 50);
        }
      }
    }
  }
});

// Prevenir que el sitio capture Cmd+K / Ctrl+K
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    e.stopPropagation();
    // No llamamos showCommandBar() aquí porque ya lo maneja el background script
  }
}, true);

// Función de inicialización principal
async function initializeContentScript() {
  try {
    // Verificar si ya está inicializado
    if (isInitialized) {
      return;
    }
    
    // Verificar si estamos en una página donde podemos ejecutarnos
    if (!window.chrome || !chrome.storage) {
      return; // Salir silenciosamente si no hay APIs disponibles
    }
    
    // Cargar configuración del usuario
    await loadUserSettings();
    
    // Esperar un poco más para asegurar que i18n esté completamente cargado
    if (typeof i18n !== 'undefined' && i18n && typeof i18n.setLanguage === 'function') {
      // Verificar que el idioma esté correctamente cargado
      const currentLanguage = i18n.getCurrentLanguage();
      if (currentLanguage !== userSettings.language) {
        await i18n.setLanguage(userSettings.language);
      }
    }
    
    // Marcar como inicializado
    isInitialized = true;
    
  } catch (error) {
    // Error silencioso para evitar spam en consola de páginas problemáticas
    // Solo registrar errores críticos que realmente necesiten atención
    if (error.message && !error.message.includes('Extension context invalidated')) {
      console.error('CommandBar initialization failed:', error.message);
    }
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  // Usar setTimeout para evitar errores de timing
  setTimeout(initializeContentScript, 0);
} 