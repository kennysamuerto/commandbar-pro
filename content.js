// Content Script para CommandBar Pro
let commandBarContainer = null;
let isCommandBarVisible = false;
let editMode = false; // Modo edición de URL actual

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

// Manejar entrada de texto
let searchTimeout;
let autocompleteSuggestion = '';
let autocompleteData = null;
let isAutocompletingFromTyping = false;
let isDeleting = false;
let lastInputLength = 0;
let autocompleteTimeout = null; // Para debounce del autocompletado
let lastAutocompleteQuery = ''; // Para evitar autocompletados repetidos
let autocompleteCache = new Map(); // Cache para resultados frecuentes
let isAutocompletePending = false; // Para evitar solapamientos
let isDeletingTimeout = null; // Para extender el período de borrado
let isInDeletionMode = false; // Flag súper agresivo para borrado

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
  }, 50); // Súper rápido como Arc
}

// Autocompletado inteligente
// Autocompletado INSTANTÁNEO estilo Arc
async function performAutocompleteInstant(query) {
  if (query.length < 2 || isAutocompletePending || isDeleting || isInDeletionMode) {
    return; // No autocompletar si está borrando o en modo borrado
  }
  
  // Verificar cache primero (súper rápido) - PERO NO SI ESTÁ BORRANDO
  const cacheKey = query.toLowerCase();
  if (autocompleteCache.has(cacheKey) && !isDeleting && !isInDeletionMode) {
    const cached = autocompleteCache.get(cacheKey);
    if (cached.suggestion) {
      showArcStyleAutocomplete(query, cached.suggestion, cached.favicon, cached.title);
      return;
    }
  }
  
  // Si no está en cache, buscar con debounce mínimo solo para queries nuevas
  if (query !== lastAutocompleteQuery) {
    if (autocompleteTimeout) {
      clearTimeout(autocompleteTimeout);
    }
    
    lastAutocompleteQuery = query;
    isAutocompletePending = true;
    
    // Debounce súper agresivo: solo 50ms para no interferir
    autocompleteTimeout = setTimeout(async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'search_history_autocomplete',
          query: query
        });
        
        isAutocompletePending = false;
        
        if (response.success && response.suggestion) {
          // Guardar en cache
          autocompleteCache.set(cacheKey, {
            suggestion: response.suggestion,
            favicon: response.favicon,
            title: response.title
          });
          
          // Solo mostrar si el usuario no ha seguido escribiendo
          const currentInput = document.getElementById('commandbar-input');
          if (currentInput && currentInput.value.toLowerCase().startsWith(cacheKey)) {
            showArcStyleAutocomplete(query, response.suggestion, response.favicon, response.title);
          }
        } else {
          // Guardar respuesta vacía en cache
          autocompleteCache.set(cacheKey, { suggestion: null });
          clearAutocomplete();
        }
      } catch (error) {
        isAutocompletePending = false;
        console.error('Error en autocompletado:', error);
        clearAutocomplete();
      }
    }, 50); // Súper rápido: 50ms
  }
}

// Función de autocompletado clásica (para compatibilidad)
async function performAutocomplete(query) {
  return performAutocompleteInstant(query);
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

// Mostrar favicon y hint
function showFaviconHint(favicon, title, url) {
  // Verificar si la URL contiene espacios (no es URL válida)
  const input = document.getElementById('commandbar-input');
  if (input && input.value.includes(' ')) {
    // No mostrar favicon si hay espacios
    return;
  }
  
  // Remover hint anterior
  const existingHint = document.getElementById('commandbar-favicon-hint');
  if (existingHint) {
    existingHint.remove();
  }
  
  const header = document.querySelector('.commandbar-header');
  if (!header) return;
  
  const hintEl = document.createElement('div');
  hintEl.id = 'commandbar-favicon-hint';
  hintEl.className = 'commandbar-favicon-hint';
  
  const faviconImg = favicon ? `<img src="${favicon}" class="favicon-img" onerror="this.style.display='none'">` : '';
  
  hintEl.innerHTML = `
    ${faviconImg}
    <div class="hint-content">
      <div class="hint-title">${title || url}</div>
      <div class="hint-url">${url}</div>
    </div>
    <div class="hint-action">${i18n.t('hints.pressEnter')}</div>
  `;
  
  header.appendChild(hintEl);
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
  autocompleteSuggestion = '';
  autocompleteData = null;
  lastAutocompleteQuery = '';
  isAutocompletePending = false;
  
  // Limpiar timeout si existe
  if (autocompleteTimeout) {
    clearTimeout(autocompleteTimeout);
    autocompleteTimeout = null;
  }
  
  // Limpiar timeout de borrado si existe
  if (isDeletingTimeout) {
    clearTimeout(isDeletingTimeout);
    isDeletingTimeout = null;
  }
  
  // Resetear flags de borrado
  isInDeletionMode = false;
  
  // Remover hint del favicon
  const faviconHint = document.getElementById('commandbar-favicon-hint');
  if (faviconHint) {
    faviconHint.remove();
  }
  
  // Remover elemento de autocompletado antiguo si existe
  const autocompleteEl = document.getElementById('commandbar-autocomplete');
  if (autocompleteEl) {
    autocompleteEl.style.display = 'none';
  }
}

// Función para limpiar cache periódicamente (evitar memory leaks)
function cleanAutocompleteCache() {
  if (autocompleteCache.size > 100) {
    // Mantener solo los 50 más recientes
    const entries = Array.from(autocompleteCache.entries());
    autocompleteCache.clear();
    entries.slice(-50).forEach(([key, value]) => {
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
      // Si hay autocompletado activo, aceptarlo
      if (autocompleteSuggestion && e.target.selectionStart !== e.target.value.length) {
        // Mover cursor al final
        e.target.setSelectionRange(e.target.value.length, e.target.value.length);
        clearAutocomplete();
      } else {
        // Si no hay autocompletado y es texto (no URL), buscar en Perplexity
        const query = e.target.value.trim();
        if (query && !isURL(query) && !query.startsWith('/')) {
          searchInPerplexity(query);
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
  
  // Buscar en pestañas existentes
  searchInTabs(url);
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
  const suggestions = document.getElementById('commandbar-suggestions');
  
  let html = `
    <div class="commandbar-section">
      <div class="commandbar-section-title">${i18n.t('sections.webSearch')}</div>
      <div class="commandbar-item" data-action="google-search" data-query="${query}">
        <span class="commandbar-icon">🔍</span>
        <span class="commandbar-text">${i18n.t('search.searchInGoogle', { query })}</span>
        <span class="commandbar-shortcut">Enter</span>
      </div>
      <div class="commandbar-item" data-action="perplexity-search" data-query="${query}">
        <span class="commandbar-icon">🤖</span>
        <span class="commandbar-text">${i18n.t('search.searchInPerplexity', { query })}</span>
        <span class="commandbar-shortcut">Tab</span>
      </div>
      <div class="commandbar-item" data-action="bing-search" data-query="${query}">
        <span class="commandbar-icon">🔍</span>
        <span class="commandbar-text">${i18n.t('search.searchInBing', { query })}</span>
      </div>
      <div class="commandbar-item" data-action="duckduckgo-search" data-query="${query}">
        <span class="commandbar-icon">🦆</span>
        <span class="commandbar-text">${i18n.t('search.searchInDuckDuckGo', { query })}</span>
      </div>
    </div>
  `;
  
  suggestions.innerHTML = html;
  
  // Buscar en pestañas, bookmarks e historial en paralelo
  Promise.all([
    searchInTabs(query),
    searchInBookmarks(query),
    searchInHistory(query)
  ]);
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
    }
  } catch (error) {
    console.error('Error buscando en pestañas:', error);
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
    }
  } catch (error) {
    console.error('Error buscando en bookmarks:', error);
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
    }
  } catch (error) {
    console.error('Error buscando en historial:', error);
  }
}

// Agregar resultados de pestañas
function appendTabResults(tabs) {
  const suggestions = document.getElementById('commandbar-suggestions');
  
  let html = `<div class="commandbar-section"><div class="commandbar-section-title">${i18n.t('sections.openTabs')}</div>`;
  tabs.slice(0, 5).forEach(tab => {
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
  bookmarks.slice(0, 5).forEach(bookmark => {
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
  history.slice(0, 5).forEach(item => {
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

// Manejar clicks en sugerencias
function handleSuggestionClick(e) {
  const item = e.target.closest('.commandbar-item');
  if (item) {
    executeAction(item);
  }
}

// Ejecutar acción
async function executeAction(item) {
  const action = item.dataset.action;
  
  try {
    switch (action) {
      case 'new-tab':
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: 'chrome://newtab/'
        });
        break;
        
      case 'new-window':
        window.open('', '_blank');
        break;
        
      case 'incognito':
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: 'chrome://newtab/',
          incognito: true
        });
        break;
        
      case 'pin-tab':
        await chrome.runtime.sendMessage({
          action: 'pin_tab',
          tabId: await getCurrentTabId()
        });
        break;
        
      case 'close-tab':
        await chrome.runtime.sendMessage({
          action: 'close_tab',
          tabId: await getCurrentTabId()
        });
        break;
        
      case 'duplicate-tab':
        await chrome.runtime.sendMessage({
          action: 'duplicate_tab',
          tabId: await getCurrentTabId()
        });
        break;
        
      case 'reload':
        location.reload();
        break;
        
      case 'open-url':
      case 'open-bookmark':
      case 'open-history':
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: item.dataset.url,
          active: true
        });
        break;
        
      case 'open-new-tab':
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: item.dataset.url,
          active: false
        });
        break;
        
      case 'switch-tab':
        await chrome.runtime.sendMessage({
          action: 'switch_tab',
          tabId: parseInt(item.dataset.tabId)
        });
        break;
        
      case 'google-search':
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: `https://www.google.com/search?q=${encodeURIComponent(item.dataset.query)}`
        });
        break;
        
      case 'bing-search':
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: `https://www.bing.com/search?q=${encodeURIComponent(item.dataset.query)}`
        });
        break;
        
      case 'duckduckgo-search':
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: `https://duckduckgo.com/?q=${encodeURIComponent(item.dataset.query)}`
        });
        break;
        
      case 'perplexity-search':
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: `https://www.perplexity.ai/search?q=${encodeURIComponent(item.dataset.query)}`
        });
        break;
        
      case 'show-bookmarks':
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: 'chrome://bookmarks/'
        });
        break;
        
      case 'show-history':
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: 'chrome://history/'
        });
        break;
        
      case 'show-downloads':
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: 'chrome://downloads/'
        });
        break;
        
      case 'show-settings':
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: 'chrome://settings/'
        });
        break;
        
      case 'show-extensions':
        await chrome.runtime.sendMessage({
          action: 'create_tab',
          url: 'chrome://extensions/'
        });
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
  } catch (error) {
    console.error('Error ejecutando acción:', error);
  }
  
  hideCommandBar();
}

// Navegar directamente a URL
async function navigateToUrl(url) {
  const finalUrl = url.startsWith('http') ? url : `https://${url}`;
  
  if (editMode) {
    // En modo edición, navegar en la misma pestaña
    window.location.href = finalUrl;
  } else {
    // En modo normal, abrir en nueva pestaña
    await chrome.runtime.sendMessage({
      action: 'create_tab',
      url: finalUrl
    });
  }
  hideCommandBar();
}

// Buscar en Perplexity
async function searchInPerplexity(query) {
  if (editMode) {
    // En modo edición, buscar en la misma pestaña
    window.location.href = `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`;
  } else {
    // En modo normal, abrir en nueva pestaña
    await chrome.runtime.sendMessage({
      action: 'create_tab',
      url: `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`
    });
  }
  hideCommandBar();
}

// Ejecutar búsqueda directa
async function executeSearch(query) {
  if (isURL(query)) {
    await navigateToUrl(query);
  } else {
    if (editMode) {
      // En modo edición, buscar en la misma pestaña
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    } else {
      // En modo normal, abrir en nueva pestaña
      await chrome.runtime.sendMessage({
        action: 'create_tab',
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`
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
  
  commandBarContainer.style.display = 'block';
  isCommandBarVisible = true;
  
  // Focus en el input
  setTimeout(() => {
    const input = document.getElementById('commandbar-input');
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

// Inicialización del content script
async function initializeContentScript() {
  try {
    // Cargar idioma guardado
    const settings = await chrome.storage.sync.get(['language']);
    if (settings.language) {
      await i18n.setLanguage(settings.language);
    }
  } catch (error) {
    console.log('Error loading language in content script:', error);
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
} 