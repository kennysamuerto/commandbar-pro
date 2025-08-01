// Service Worker para CommandBar Pro
chrome.runtime.onInstalled.addListener((details) => {
  // Abrir página de opciones al instalar
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

// Trackear uso de la página de opciones
async function trackOptionsPageOpened() {
  try {
    // Verificar si el usuario tiene habilitadas las estadísticas
    const { storeUsageStats } = await chrome.storage.sync.get(['storeUsageStats']);
    
    if (storeUsageStats === true) {
      const result = await chrome.storage.local.get(['usage_stats']);
      const stats = result.usage_stats || {};
      const today = new Date().toDateString();
      
      if (!stats[today]) {
        stats[today] = {};
      }
      
      stats[today]['options_page_opened'] = (stats[today]['options_page_opened'] || 0) + 1;
      
      await chrome.storage.local.set({ usage_stats: stats });
    }
  } catch (error) {
    console.error('Error tracking options page:', error);
  }
}

// Función genérica para tracking de uso
async function trackUsage(action, details = {}) {
  try {
    // Verificar si el usuario tiene habilitadas las estadísticas
    const { storeUsageStats } = await chrome.storage.sync.get(['storeUsageStats']);
    
    if (storeUsageStats === true) {
      const result = await chrome.storage.local.get(['usage_stats']);
      const stats = result.usage_stats || {};
      const today = new Date().toDateString();
      
      if (!stats[today]) {
        stats[today] = {};
      }
      
      // Incrementar contador de la acción
      stats[today][action] = (stats[today][action] || 0) + 1;
      
      // Agregar detalles específicos si se proporcionan
      if (Object.keys(details).length > 0) {
        const detailsKey = `${action}_details`;
        if (!stats[today][detailsKey]) {
          stats[today][detailsKey] = {};
        }
        
        Object.entries(details).forEach(([key, value]) => {
          stats[today][detailsKey][key] = (stats[today][detailsKey][key] || 0) + 1;
        });
      }
      
      await chrome.storage.local.set({ usage_stats: stats });
    }
  } catch (error) {
    console.error('Error tracking usage:', error);
  }
}

// Función para inyección forzada en sitios problemáticos
async function forceInjectCommandBar(tabId, action = 'toggle_commandbar', currentUrl = null) {
  try {
    
    // Verificar que la pestaña sea accesible
    const tab = await chrome.tabs.get(tabId);
    
    // NUEVA LÓGICA: Permitir inyección en nuestras páginas de extensión
    const isOurExtensionPage = tab.url?.includes(chrome.runtime.id) && tab.url?.includes('new_tab.html');
    
    // Si es nuestra página, no necesita inyección - es auto-suficiente
    if (isOurExtensionPage) {
      return true; // Reportar éxito ya que la página se maneja sola
    }
    
    // No intentar inyectar en páginas internas de Chrome (EXCEPTO las nuestras)
    if ((tab.url?.startsWith('chrome://') || 
         tab.url?.startsWith('chrome-extension://') || 
         tab.url?.startsWith('edge://') ||
         tab.url?.startsWith('devtools://')) && !isOurExtensionPage) {
      return false;
    }
    
    
    // PASO 1: Inyectar i18n.js primero
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['i18n.js']
      });
    } catch (error) {
      console.error('Error inyectando i18n.js:', error.message);
    }
    
    // PASO 2: Inyectar styles.css
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['styles.css']
      });
    } catch (error) {
      console.error('Error inyectando styles.css:', error.message);
    }
    
    // PASO 3: Inyectar content.js completo
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
    } catch (error) {
      console.error('Error inyectando content.js:', error.message);
    }
    
    // PASO 4: Esperar un momento y activar CommandBar
    setTimeout(async () => {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: function(action, currentUrl) {
            
            // Verificar que las funciones del CommandBar estén disponibles
            if (typeof showCommandBar === 'function') {
              
              if (action === 'edit_current_url' && currentUrl) {
                // Limpiar URL para modo edición
                const cleanUrl = currentUrl.replace(/^https?:\/\/(www\.)?/, '').split('?')[0];
                showCommandBar(cleanUrl);
              } else {
                showCommandBar();
              }
              
            } else if (typeof toggleCommandBar === 'function') {
              toggleCommandBar();
            } else {
              
              // Fallback: crear versión básica mejorada solo si no hay otra opción
              
              // Verificar si ya existe CommandBar
              const existingBar = document.getElementById('commandbar-container') || document.getElementById('perplexity-commandbar');
              if (existingBar) {
                existingBar.remove();
              }
              
              const commandBar = document.createElement('div');
              commandBar.id = 'commandbar-container';
              commandBar.innerHTML = `
                <div style="
                  position: fixed;
                  top: 0; left: 0; right: 0; bottom: 0;
                  background: rgba(0,0,0,0.4);
                  backdrop-filter: blur(8px);
                  z-index: 999999;
                  display: flex;
                  align-items: flex-start;
                  justify-content: center;
                  padding-top: 10vh;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                  <div style="
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 32px 64px rgba(0,0,0,0.12);
                    width: 90%;
                    max-width: 640px;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.1);
                  ">
                    <div style="
                      padding: 24px;
                      border-bottom: 1px solid #f0f0f0;
                      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
                    ">
                      <input type="text" 
                             id="commandbar-input" 
                             placeholder="${action === 'edit_current_url' ? 'Editar URL actual...' : 'Escribe comando, búsqueda o URL...'}" 
                             value="${action === 'edit_current_url' && currentUrl ? currentUrl.replace(/^https?:\/\/(www\.)?/, '').split('?')[0] : ''}"
                             style="
                               width: 100%;
                               border: none;
                               outline: none;
                               font-size: 20px;
                               padding: 0;
                               background: transparent;
                               color: #1a1a1a;
                             ">
                    </div>
                    <div style="
                      padding: 20px;
                      color: #666;
                      font-size: 14px;
                      background: white;
                    ">
                      <div style="margin-bottom: 12px; font-weight: 600; color: #f59e0b;">⚠️ Modo de compatibilidad básico</div>
                      <div style="margin-bottom: 12px; font-weight: 600;">⚡ Acciones disponibles:</div>
                      <div style="display: grid; gap: 6px;">
                        <div>🌐 <strong>URLs:</strong> google.com, youtube.com, github.com</div>
                        <div>🔍 <strong>Búsquedas:</strong> recetas de pasta, noticias tecnología</div>
                        <div>⌨️ <strong>Comandos:</strong> /nueva, /marcadores, /historial, /configuracion</div>
                      </div>
                      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #888;">
                        Presiona <kbd style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: monospace;">Escape</kbd> para cerrar
                      </div>
                    </div>
                  </div>
                </div>
              `;
              
              document.body.appendChild(commandBar);
              
              // Enfocar el input
              const input = document.getElementById('commandbar-input');
              if (input) {
                input.focus();
                if (action === 'edit_current_url') {
                  input.select();
                }
              }
              
              // Manejar eventos básicos
              function handleKeyDown(e) {
                if (e.key === 'Escape') {
                  commandBar.remove();
                  document.removeEventListener('keydown', handleKeyDown);
                } else if (e.key === 'Enter') {
                  const query = input.value.trim();
                  if (query) {
                    handleQuery(query, action === 'edit_current_url');
                    commandBar.remove();
                    document.removeEventListener('keydown', handleKeyDown);
                  }
                }
              }
              
              function handleQuery(query, editMode = false) {
                let url;
                
                // Detectar si es URL
                if (query.includes('.') && !query.includes(' ')) {
                  url = query.startsWith('http') ? query : 'https://' + query;
                } else if (query.startsWith('/')) {
                  // Comandos básicos
                  switch (query.toLowerCase()) {
                    case '/nueva':
                    case '/new':
                      url = 'chrome://newtab/';
                      break;
                    case '/marcadores':
                    case '/bookmarks':
                      url = 'chrome://bookmarks/';
                      break;
                    case '/historial':
                    case '/history':
                      url = 'chrome://history/';
                      break;
                    case '/configuracion':
                    case '/settings':
                      url = 'chrome://settings/';
                      break;
                    default:
                      url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
                  }
                } else {
                  // Búsqueda web
                  url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
                }
                
                if (editMode) {
                  window.location.href = url;
                } else {
                  window.open(url, '_blank');
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
            }
          },
          args: [action, currentUrl]
        });
        
      } catch (activationError) {
        console.error('Error activando CommandBar tras inyección:', activationError);
      }
    }, 300); // Dar tiempo para que los scripts se inicialicen
    
    return true;
    
  } catch (error) {
    console.error('Error en inyección forzada:', error);
    return false;
  }
}

// Escuchar comandos de teclado
chrome.commands.onCommand.addListener(async (command) => {
  // Trackear uso de comandos
  await trackUsage('keyboard_command', { command: command });
  
  if (command === 'toggle_commandbar') {
    // Trackear específicamente apertura de CommandBar
    await trackUsage('commandbar_opened', { method: 'keyboard' });
    
    // Obtener la pestaña activa
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        // Primer intento: content script normal
        try {
          await chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle_commandbar' });
        } catch (error) {
          // Segundo intento: inyección forzada
          const forced = await forceInjectCommandBar(tabs[0].id, 'toggle_commandbar');
          
          if (!forced) {
            chrome.action.openPopup();
          }
        }
      }
    });
  } else if (command === 'edit_current_url') {
    // Trackear específicamente modo edición de URL
    await trackUsage('url_edit_mode', { method: 'keyboard' });
    
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
          // Segundo intento: inyección forzada
          const forced = await forceInjectCommandBar(tabs[0].id, 'edit_current_url', tabs[0].url);
          
          if (!forced) {
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
    case 'track_usage':
      trackUsage(message.usage_action, message.usage_details);
      sendResponse({ success: true });
      return true;
      
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
      createTab(message.url, message.active, sendResponse, message.fromCommandBar);
      return true;
    
    case 'create_window':
      createWindow(message.url, sendResponse);
      return true;
    
    case 'create_incognito_window':
      createIncognitoWindow(message.url, sendResponse);
      return true;
    
    case 'reload_tab':
      reloadTab(message.tabId, sendResponse);
      return true;
    
    case 'toggle_devtools':
      toggleDevTools(sendResponse);
      return true;
    
    case 'get_current_tab':
      getCurrentTab(sendResponse);
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
      
    case 'request_commandbar_open':
      // Solicitud directa desde nuestra página de extensión
      if (sender.tab?.id) {
        setTimeout(async () => {
          try {
            await chrome.tabs.sendMessage(sender.tab.id, { action: 'toggle_commandbar' });
          } catch (error) {
            await forceInjectCommandBar(sender.tab.id, 'toggle_commandbar');
          }
        }, 100);
      }
      sendResponse({ success: true });
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
async function createTab(url, active = true, sendResponse, fromCommandBar = false) {
  try {
    const tab = await chrome.tabs.create({ url, active });
    
    // Si la pestaña fue creada desde CommandBar, marcarla para evitar auto-open
    if (fromCommandBar) {
      commandBarCreatedTabs.add(tab.id);
      
      // Limpiar marca después de 10 segundos (tiempo suficiente para que la pestaña cargue)
      setTimeout(() => {
        commandBarCreatedTabs.delete(tab.id);
      }, 10000);
    }
    
    sendResponse({ success: true, tab });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Crear nueva ventana
async function createWindow(url, sendResponse) {
  try {
    const window = await chrome.windows.create({ url });
    sendResponse({ success: true, window });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Crear nueva ventana de incognito
async function createIncognitoWindow(url, sendResponse) {
  try {
    const window = await chrome.windows.create({ 
      url, 
      incognito: true 
    });
    sendResponse({ success: true, window });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Recargar pestaña
async function reloadTab(tabId, sendResponse) {
  try {
    await chrome.tabs.reload(tabId);
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Alternar herramientas de desarrollador
async function toggleDevTools(sendResponse) {
  try {
    const currentTab = await chrome.tabs.query({ active: true, currentWindow: true });
    if (currentTab[0]) {
      await chrome.tabs.sendMessage(currentTab[0].id, { action: 'toggle_devtools' });
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'No active tab found' });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Obtener pestaña actual
async function getCurrentTab(sendResponse) {
  try {
    const currentTab = await chrome.tabs.query({ active: true, currentWindow: true });
    if (currentTab[0]) {
      sendResponse({ success: true, tabId: currentTab[0].id });
    } else {
      sendResponse({ success: false, error: 'No active tab found' });
    }
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
const MAX_HISTORY_RESULTS = 1000; // Máximo de entradas del historial a consultar

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
      maxResults: MAX_HISTORY_RESULTS // Ampliado para acceso completo al historial
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
        // Error silencioso para favicon
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

// Set para trackear pestañas creadas por nosotros (evitar bucles)
let extensionCreatedTabs = new Set();

// Set para trackear pestañas creadas por CommandBar para navegación (evitar auto-open innecesario)
let commandBarCreatedTabs = new Set();

// Función para verificar si es una pestaña nueva vacía válida
function isValidNewTab(tab) {
  
  // URLs que consideramos "nuevas pestañas vacías"
  const newTabUrls = [
    'chrome://newtab/',
    'chrome://new-tab-page/',
    'about:blank',
    'chrome://welcome/',
    'edge://newtab/'
  ];
  
  // NUEVA LÓGICA: También considerar nuestras páginas de extensión como válidas
  const isOurExtensionPage = tab.url?.includes(chrome.runtime.id) && tab.url?.includes('new_tab.html');
  
  // Verificar si es una URL válida de nueva pestaña
  const isNewTabUrl = newTabUrls.some(url => tab.url?.startsWith(url)) || !tab.url || tab.url === '' || isOurExtensionPage;
  
  // Verificar que no sea una pestaña especial (EXCEPTO nuestras páginas)
  const isSpecialTab = tab.url?.startsWith('chrome://') && 
                      !tab.url.includes('newtab') && 
                      !tab.url.includes('new-tab-page') &&
                      !tab.url.includes('welcome');
  
  // Las páginas de extensión son válidas SOLO si son nuestras
  const isExtensionTab = tab.url?.startsWith('chrome-extension://') && !isOurExtensionPage;
  
  const isDevToolsTab = tab.url?.startsWith('devtools://');
  
  const result = isNewTabUrl && !isSpecialTab && !isExtensionTab && !isDevToolsTab;
  
  return result;
}

// Función para auto-abrir CommandBar en nueva pestaña
async function autoOpenCommandBarInNewTab(tabId, delay = 100) {
  try {
    
    // Verificar que la pestaña aún existe y está activa
    const tab = await chrome.tabs.get(tabId);
    if (!tab || !tab.active) {
      return; // No abrir si la pestaña ya no está activa
    }
    
    // Verificar que sigue siendo una pestaña nueva válida
    if (!isValidNewTab(tab)) {
      return; // El usuario ya navegó a algún lugar
    }
    
    
    // Esperar el delay configurado
    setTimeout(async () => {
      try {
        
        // Verificar nuevamente que la pestaña sigue válida
        const currentTab = await chrome.tabs.get(tabId);
        if (!currentTab || !currentTab.active || !isValidNewTab(currentTab)) {
          return;
        }
        
        
        // OPTIMIZACIÓN: Si es nuestra página de extensión, usar lógica simplificada
        const isOurExtensionPage = currentTab.url?.includes(chrome.runtime.id) && currentTab.url?.includes('new_tab.html');
        
        if (isOurExtensionPage) {
          return; // No hacer nada, la página se maneja a sí misma
        }
        
        // Verificar si es una página chrome:// que no admite content scripts
        const isChromeInternalPage = currentTab.url?.startsWith('chrome://') || 
                                   currentTab.url?.startsWith('chrome-extension://') ||
                                   currentTab.url?.startsWith('edge://');
        
        if (isChromeInternalPage) {
          
          // MÉTODO ALTERNATIVO: Crear nueva pestaña con página de la extensión
          try {
            // Usar página HTML de la extensión en lugar de about:blank
            const extensionUrl = chrome.runtime.getURL('new_tab.html');
            const newTab = await chrome.tabs.create({ 
              url: extensionUrl, 
              active: true 
            });
            
            // IMPORTANTE: Marcar esta pestaña como creada por nosotros para evitar bucle
            extensionCreatedTabs.add(newTab.id);
            
            // Cerrar la pestaña chrome:// original
            await chrome.tabs.remove(tabId);
            
            // Esperar un momento para que la página de extensión cargue
            setTimeout(async () => {
              try {
                await chrome.tabs.sendMessage(newTab.id, { action: 'toggle_commandbar' });
              } catch (error) {
                console.error('❌ Content script aún no disponible, intentando inyección...');
                const injected = await forceInjectCommandBar(newTab.id, 'toggle_commandbar');
                if (injected) {
                  // Éxito silencioso
                } else {
                  console.error('❌ Inyección también falló en página de extensión - Esto es muy raro, reintentando...');
                  
                  // Último recurso: Esperar más tiempo y reintentar
                  setTimeout(async () => {
                    try {
                      const finalInjected = await forceInjectCommandBar(newTab.id, 'toggle_commandbar');
                      if (finalInjected) {
                        // Éxito silencioso en reintento
                      } else {
                        console.error('❌ Todos los intentos fallaron para página de extensión');
                      }
                    } catch (finalError) {
                      console.error('❌ Error en reintento final:', finalError);
                    }
                  }, 1000);
                }
                
                // Limpiar marca después de un tiempo
                setTimeout(() => {
                  extensionCreatedTabs.delete(newTab.id);
                }, 5000);
              }
            }, 50); // Tiempo reducido para transición más rápida
            
          } catch (error) {
            console.error('❌ Error creando pestaña de extensión alternativa:', error);
          }
          
        } else {
          // Método normal para páginas regulares
          try {
            await chrome.tabs.sendMessage(tabId, { action: 'toggle_commandbar' });
          } catch (error) {
            // Si falla el content script, intentar inyección forzada
            console.error('❌ Content script falló, intentando inyección forzada:', error.message);
            const injected = await forceInjectCommandBar(tabId, 'toggle_commandbar');
            if (injected) {
              // Éxito silencioso
            } else {
              console.error('❌ Inyección forzada también falló');
            }
          }
        }
        
      } catch (error) {
        // La pestaña ya no existe o hubo otro error
        console.error('❌ Error durante la ejecución post-delay:', error);
      }
    }, delay);
    
  } catch (error) {
    console.error('❌ Error verificando nueva pestaña:', error);
  }
}

// Listener para nuevas pestañas creadas
chrome.tabs.onCreated.addListener(async (tab) => {
  try {
    
    // PREVENIR BUCLE: Si esta pestaña fue creada por nosotros, saltear auto-open
    if (extensionCreatedTabs.has(tab.id)) {
      return;
    }
    
    // PREVENIR AUTO-OPEN INNECESARIO: Si esta pestaña fue creada por CommandBar para navegación, saltear auto-open
    if (commandBarCreatedTabs.has(tab.id)) {
      return;
    }
    
    // Verificar si la función experimental está habilitada
    let { autoOpenNewTab, autoOpenDelay } = await chrome.storage.sync.get(['autoOpenNewTab', 'autoOpenDelay']);
    
    // SOLUCIÓN: Si los valores son undefined, usar defaults y guardar
    if (autoOpenNewTab === undefined || autoOpenDelay === undefined) {
      
      // Establecer valores por defecto
      autoOpenNewTab = autoOpenNewTab !== undefined ? autoOpenNewTab : false;
      autoOpenDelay = autoOpenDelay !== undefined ? autoOpenDelay : 100;
      
      // Guardar en storage para futuras referencias
      await chrome.storage.sync.set({ autoOpenNewTab, autoOpenDelay });
    }
    
    if (!autoOpenNewTab) {
      return; // Función desactivada
    }
    
    // Verificar si es una pestaña nueva válida
    const isValid = isValidNewTab(tab);
    
    if (!isValid) {
      return; // No es una pestaña nueva vacía
    }
    
    // Solo abrir si la pestaña está activa (es la pestaña actual)
    if (!tab.active) {
      return; // No interferir con pestañas en background
    }
    
    // Auto-abrir CommandBar con el delay configurado
    const delay = autoOpenDelay || 100;
    await autoOpenCommandBarInNewTab(tab.id, delay);
    
  } catch (error) {
    console.error('❌ Error en auto-apertura de nueva pestaña:', error);
  }
});

// Trackear uso de la página de opciones (ejecutar al cargar)
trackOptionsPageOpened(); 