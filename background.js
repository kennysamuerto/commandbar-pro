// Service Worker para CommandBar Pro
chrome.runtime.onInstalled.addListener((details) => {
  console.log('CommandBar Pro instalado');
  
  // Abrir página de opciones al instalar
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

// Función para inyección forzada en sitios problemáticos
async function forceInjectCommandBar(tabId, action = 'toggle_commandbar', currentUrl = null) {
  try {
    // Intentar inyectar directamente el script
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: function(action, currentUrl) {
        // Verificar si ya existe CommandBar
        if (document.getElementById('commandbar-container')) {
          // Si existe, usar la función existente
          if (action === 'toggle_commandbar') {
            if (typeof toggleCommandBar === 'function') {
              toggleCommandBar();
              return;
            }
          } else if (action === 'edit_current_url') {
            if (typeof showCommandBar === 'function') {
              const cleanUrl = currentUrl.replace(/^https?:\/\/(www\.)?/, '').split('?')[0];
              showCommandBar(cleanUrl);
              return;
            }
          }
        }
        
        // Si no existe, crear CommandBar minimal inline
        const existingBar = document.getElementById('perplexity-commandbar');
        if (existingBar) {
          existingBar.remove();
        }
        
        const commandBar = document.createElement('div');
        commandBar.id = 'perplexity-commandbar';
        commandBar.innerHTML = `
          <div style="
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">
            <div style="
              background: white;
              border-radius: 12px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.3);
              width: 90%;
              max-width: 600px;
              overflow: hidden;
            ">
              <div style="padding: 20px; border-bottom: 1px solid #eee;">
                <input type="text" id="perplexity-input" placeholder="${action === 'edit_current_url' ? 'Editar URL actual' : 'Escribe comando, búsqueda o URL...'}" 
                       value="${action === 'edit_current_url' && currentUrl ? currentUrl.replace(/^https?:\/\/(www\.)?/, '').split('?')[0] : ''}"
                       style="
                         width: 100%;
                         border: none;
                         outline: none;
                         font-size: 18px;
                         padding: 0;
                         background: transparent;
                       ">
              </div>
              <div style="padding: 16px; color: #666; font-size: 14px;">
                <div style="margin-bottom: 8px;">💡 <strong>Acciones disponibles:</strong></div>
                <div>• Escribe una URL para navegar</div>
                <div>• Escribe texto para buscar en Google</div>
                <div>• Presiona Tab para buscar en Perplexity</div>
                <div>• Presiona Escape para cerrar</div>
              </div>
            </div>
          </div>
        `;
        
        document.body.appendChild(commandBar);
        
        const input = document.getElementById('perplexity-input');
        input.focus();
        if (action === 'edit_current_url') {
          input.select();
        }
        
        // Manejar eventos
        function handleKeyDown(e) {
          if (e.key === 'Escape') {
            commandBar.remove();
            document.removeEventListener('keydown', handleKeyDown);
          } else if (e.key === 'Enter') {
            const query = input.value.trim();
            if (query) {
              let url;
              if (query.includes('.') && !query.includes(' ')) {
                // Es una URL
                url = query.startsWith('http') ? query : 'https://' + query;
              } else {
                // Es una búsqueda
                url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
              }
              
              if (action === 'edit_current_url') {
                window.location.href = url;
              } else {
                window.open(url, '_blank');
              }
            }
            commandBar.remove();
            document.removeEventListener('keydown', handleKeyDown);
          } else if (e.key === 'Tab') {
            e.preventDefault();
            const query = input.value.trim();
            if (query && !query.includes('.')) {
              const perplexityUrl = 'https://www.perplexity.ai/search?q=' + encodeURIComponent(query);
              if (action === 'edit_current_url') {
                window.location.href = perplexityUrl;
              } else {
                window.open(perplexityUrl, '_blank');
              }
              commandBar.remove();
              document.removeEventListener('keydown', handleKeyDown);
            }
          }
        }
        
        document.addEventListener('keydown', handleKeyDown);
        
        // Cerrar al hacer clic fuera
        commandBar.addEventListener('click', (e) => {
          if (e.target === commandBar) {
            commandBar.remove();
            document.removeEventListener('keydown', handleKeyDown);
          }
        });
      },
      args: [action, currentUrl]
    });
    
    return true;
  } catch (error) {
    console.log('Error en inyección forzada:', error);
    return false;
  }
}

// Escuchar comandos de teclado
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle_commandbar') {
    // Obtener la pestaña activa
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        // Primer intento: content script normal
        try {
          await chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle_commandbar' });
        } catch (error) {
          console.log('Content script no disponible, intentando inyección forzada...');
          
          // Segundo intento: inyección forzada
          const forced = await forceInjectCommandBar(tabs[0].id, 'toggle_commandbar');
          
          if (!forced) {
            console.log('Inyección forzada falló, usando popup como último recurso');
            chrome.action.openPopup();
          }
        }
      }
    });
  } else if (command === 'edit_current_url') {
    // Obtener la pestaña activa para editar URL
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        // Primer intento: content script normal
        try {
          await chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'edit_current_url', 
            currentUrl: tabs[0].url 
          });
        } catch (error) {
          console.log('Content script no disponible para modo edición, intentando inyección forzada...');
          
          // Segundo intento: inyección forzada
          const forced = await forceInjectCommandBar(tabs[0].id, 'edit_current_url', tabs[0].url);
          
          if (!forced) {
            console.log('Inyección forzada falló, usando prompt nativo');
            // Fallback: prompt nativo
            const currentUrl = tabs[0].url;
            try {
              const url = new URL(currentUrl);
              const cleanUrl = url.hostname.replace('www.', '') + (url.pathname !== '/' ? url.pathname : '') + url.search;
              
              const newUrl = prompt(`Editar URL actual:\n\n${cleanUrl}\n\nIntroduce la nueva URL:`);
              if (newUrl) {
                const finalUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
                chrome.tabs.update(tabs[0].id, { url: finalUrl });
              }
            } catch (e) {
              const newUrl = prompt('Introduce nueva URL:');
              if (newUrl) {
                const finalUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
                chrome.tabs.update(tabs[0].id, { url: finalUrl });
              }
            }
          }
        }
      }
    });
  }
});

// Manejar mensajes desde content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'search_tabs':
      searchTabs(message.query, sendResponse);
      return true;
    
    case 'search_bookmarks':
      searchBookmarks(message.query, sendResponse);
      return true;
    
    case 'search_history':
      searchHistory(message.query, sendResponse);
      return true;
    
    case 'create_tab':
      createTab(message.url, message.active, sendResponse);
      return true;
    
    case 'switch_tab':
      switchToTab(message.tabId, sendResponse);
      return true;
    
    case 'close_tab':
      closeTab(message.tabId, sendResponse);
      return true;
    
    case 'pin_tab':
      pinTab(message.tabId, sendResponse);
      return true;
    
    case 'duplicate_tab':
      duplicateTab(message.tabId, sendResponse);
      return true;
    
    case 'get_all_tabs':
      getAllTabs(sendResponse);
      return true;
    
    case 'search_history_autocomplete':
      searchHistoryForAutocomplete(message.query, sendResponse);
      return true;
  }
});

// Buscar en pestañas
async function searchTabs(query, sendResponse) {
  try {
    const tabs = await chrome.tabs.query({});
    const filteredTabs = tabs.filter(tab => 
      tab.title.toLowerCase().includes(query.toLowerCase()) ||
      tab.url.toLowerCase().includes(query.toLowerCase())
    );
    sendResponse({ success: true, tabs: filteredTabs });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Buscar en bookmarks
async function searchBookmarks(query, sendResponse) {
  try {
    const bookmarks = await chrome.bookmarks.search(query);
    sendResponse({ success: true, bookmarks });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Buscar en historial
async function searchHistory(query, sendResponse) {
  try {
    const history = await chrome.history.search({
      text: query,
      maxResults: 20
    });
    sendResponse({ success: true, history });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Crear nueva pestaña
async function createTab(url, active = true, sendResponse) {
  try {
    const tab = await chrome.tabs.create({ url, active });
    sendResponse({ success: true, tab });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Cambiar a pestaña
async function switchToTab(tabId, sendResponse) {
  try {
    await chrome.tabs.update(tabId, { active: true });
    const tab = await chrome.tabs.get(tabId);
    await chrome.windows.update(tab.windowId, { focused: true });
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Cerrar pestaña
async function closeTab(tabId, sendResponse) {
  try {
    await chrome.tabs.remove(tabId);
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Pinear/despinear pestaña
async function pinTab(tabId, sendResponse) {
  try {
    const tab = await chrome.tabs.get(tabId);
    await chrome.tabs.update(tabId, { pinned: !tab.pinned });
    sendResponse({ success: true, pinned: !tab.pinned });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Duplicar pestaña
async function duplicateTab(tabId, sendResponse) {
  try {
    const tab = await chrome.tabs.duplicate(tabId);
    sendResponse({ success: true, tab });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Obtener todas las pestañas
async function getAllTabs(sendResponse) {
  try {
    const tabs = await chrome.tabs.query({});
    sendResponse({ success: true, tabs });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Cache local para background script
let historyCache = new Map();
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 segundos

// Buscar en historial para autocompletado inteligente
async function searchHistoryForAutocomplete(query, sendResponse) {
  try {
    const now = Date.now();
    const cacheKey = query.toLowerCase();
    
    // Verificar cache primero
    if (historyCache.has(cacheKey) && (now - cacheTimestamp) < CACHE_DURATION) {
      const cached = historyCache.get(cacheKey);
      sendResponse(cached);
      return;
    }
    
    // Limpiar cache si es muy viejo
    if ((now - cacheTimestamp) > CACHE_DURATION) {
      historyCache.clear();
      cacheTimestamp = now;
    }
    
    // Buscar URLs que empiecen con la query o contengan el dominio
    const history = await chrome.history.search({
      text: query,
      maxResults: 50 // Optimizado para velocidad
    });
    
    // Filtrar y ordenar con algoritmo inteligente (frecuencia + recencia)
    const relevantUrls = history
      .filter(item => {
        try {
          const url = new URL(item.url);
          const domain = url.hostname.replace('www.', '');
          const fullUrl = item.url.toLowerCase();
          const queryLower = query.toLowerCase();
          
          // Coincidencias: dominio empieza con query, o URL contiene query
          return domain.startsWith(queryLower) || 
                 url.pathname.toLowerCase().includes(queryLower) ||
                 fullUrl.includes(queryLower);
        } catch (e) {
          return false;
        }
      })
      // Ordenación inteligente: combina frecuencia (visitCount) con recencia (lastVisitTime)
      .sort((a, b) => {
        const queryLower = query.toLowerCase();
        
        try {
          const urlA = new URL(a.url);
          const urlB = new URL(b.url);
          const domainA = urlA.hostname.replace('www.', '');
          const domainB = urlB.hostname.replace('www.', '');
          
          // Prioridad máxima: coincidencia exacta al inicio del dominio
          const exactMatchA = domainA.startsWith(queryLower);
          const exactMatchB = domainB.startsWith(queryLower);
          
          if (exactMatchA && !exactMatchB) return -1;
          if (!exactMatchA && exactMatchB) return 1;
        } catch (e) {
          // Continuar con ordenación normal si hay error
        }
        
        // Score híbrido: 70% frecuencia + 30% recencia
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000;
        
        // Score de recencia (0-1, donde 1 = visitado hoy)
        const recencyScoreA = Math.max(0, 1 - ((now - a.lastVisitTime) / (30 * dayInMs)));
        const recencyScoreB = Math.max(0, 1 - ((now - b.lastVisitTime) / (30 * dayInMs)));
        
        // Score de frecuencia normalizado (log para evitar dominancia extrema)
        const freqScoreA = Math.log(a.visitCount + 1);
        const freqScoreB = Math.log(b.visitCount + 1);
        
        // Score final combinado
        const scoreA = (freqScoreA * 0.7) + (recencyScoreA * 0.3);
        const scoreB = (freqScoreB * 0.7) + (recencyScoreB * 0.3);
        
        return scoreB - scoreA;
      });
    
    if (relevantUrls.length > 0) {
      const bestMatch = relevantUrls[0];
      let suggestion = '';
      
      // Determinar la mejor sugerencia
      const url = new URL(bestMatch.url);
      const domain = url.hostname.replace('www.', '');
      const queryLower = query.toLowerCase();
      
      if (domain.startsWith(queryLower)) {
        // Si el dominio empieza con la query, sugerir el dominio completo
        suggestion = domain;
      } else if (url.pathname.length > 1) {
        // Si tiene path, sugerir dominio + path
        suggestion = domain + url.pathname;
      } else {
        // Fallback al dominio
        suggestion = domain;
      }
      
      // Intentar obtener favicon
      let favicon = null;
      try {
        favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
      } catch (e) {
        console.log('No se pudo obtener favicon');
      }
      
      const response = { 
        success: true, 
        suggestion: suggestion,
        visitCount: bestMatch.visitCount,
        lastVisit: bestMatch.lastVisitTime,
        title: bestMatch.title,
        favicon: favicon
      };
      
      // Guardar en cache
      historyCache.set(cacheKey, response);
      sendResponse(response);
    } else {
      const response = { success: true, suggestion: null };
      historyCache.set(cacheKey, response);
      sendResponse(response);
    }
  } catch (error) {
    console.error('Error en autocompletado:', error);
    sendResponse({ success: false, error: error.message });
  }
} 