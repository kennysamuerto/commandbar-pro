// JavaScript para el Popup de CommandBar Pro

document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Esperar a que i18n se inicialice completamente
    await i18n.loadLanguage();
    
    // Pequeño delay para asegurar que el DOM esté completamente listo
    await new Promise(resolve => setTimeout(resolve, 50));
    
    initializePopup();
    await loadSettings();
    setupEventListeners();
    
    // Fallback: re-intentar traducción después de 1 segundo para elementos que pueden no haberse encontrado
    setTimeout(() => {
      console.log('Re-attempting translation for any missed elements in popup...');
      updateInterface();
    }, 1000);
    
    console.log('Popup initialized successfully');
  } catch (error) {
    console.error('Error during popup initialization:', error);
  }
});

// Detectar si es macOS
function isMacOS() {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

// Inicializar el popup
function initializePopup() {
  // Agregar efectos de entrada escalonados
  const animatedElements = document.querySelectorAll('.feature-item, .command-item, .search-type, .setting-item');
  animatedElements.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.05}s`;
  });
  
  // Actualizar atajos de teclado según la plataforma
  updateKeyboardShortcuts();
  
  // Mostrar tip del día
  showDailyTip();
}

// Actualizar atajos de teclado según la plataforma
function updateKeyboardShortcuts() {
  const isMac = isMacOS();
  const modifierKey = isMac ? 'Cmd' : 'Ctrl';
  const shortcutDisplays = document.querySelectorAll('.shortcut-display');
  
  if (shortcutDisplays.length >= 1) {
    shortcutDisplays[0].innerHTML = `
      <kbd class="key">${modifierKey}</kbd> + <kbd class="key">K</kbd>
      <span class="shortcut-desc">Abrir Command Bar</span>
    `;
  }
  
  if (shortcutDisplays.length >= 2) {
    shortcutDisplays[1].innerHTML = `
      <kbd class="key">${modifierKey}</kbd> + <kbd class="key">Shift</kbd> + <kbd class="key">K</kbd>
      <span class="shortcut-desc">Editar URL actual</span>
    `;
  }
}

// Cargar configuración guardada
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get([
      'darkMode',
      'autoFocus',
      'quickActions',
      'language'
    ]);
    
    // Cargar idioma
    if (settings.language) {
      await i18n.setLanguage(settings.language);
    }
    
    // Actualizar interfaz con traducciones
    updateInterface();
    
    // Aplicar configuración a los checkboxes
    document.getElementById('dark-mode').checked = settings.darkMode || false;
    document.getElementById('auto-focus').checked = settings.autoFocus !== false;
    document.getElementById('quick-actions').checked = settings.quickActions !== false;
    
    // Aplicar tema oscuro si está habilitado
    if (settings.darkMode) {
      document.body.classList.add('dark-theme');
    }
  } catch (error) {
    console.error('Error cargando configuración:', error);
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Botón para probar Command Bar
  document.getElementById('test-commandbar').addEventListener('click', testCommandBar);
  
  // Botón de configuración avanzada
  document.getElementById('open-options').addEventListener('click', openOptions);
  
  // Botón de cambiar idioma
  document.getElementById('change-language').addEventListener('click', changeLanguage);
  
  // Checkboxes de configuración
  const checkboxes = document.querySelectorAll('.setting-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleSettingChange);
  });
  
  // Efectos hover mejorados
  setupHoverEffects();
}

// Probar Command Bar
async function testCommandBar() {
  try {
    // Obtener la pestaña activa
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      const url = tabs[0].url;
      
      // Verificar si es una URL válida para content scripts
      if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || 
          url.startsWith('edge://') || url.startsWith('about:') ||
          url.includes('chrome.google.com/webstore')) {
        showNotification('⚠️ CommandBar no funciona en páginas del navegador. Prueba en cualquier sitio web.', 'warning');
        return;
      }
      
      // Intentar enviar mensaje para mostrar Command Bar
      try {
        await chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle_commandbar' });
        // Cerrar popup si funciona
        window.close();
      } catch (error) {
        // Si falla, intentar inyección forzada
        console.log('Intentando inyección forzada desde popup...');
        
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: function() {
              // CommandBar simplificado para sitios problemáticos
              const existingBar = document.getElementById('forced-commandbar');
              if (existingBar) {
                existingBar.remove();
                return;
              }
              
              const commandBar = document.createElement('div');
              commandBar.id = 'forced-commandbar';
                             commandBar.innerHTML = '<div style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(0,0,0,0.7) !important; backdrop-filter: blur(4px) !important; z-index: 999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif !important;"><div style="background: white !important; border-radius: 12px !important; box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important; width: 90% !important; max-width: 600px !important; overflow: hidden !important;"><div style="padding: 20px !important; border-bottom: 1px solid #eee !important;"><input type="text" id="forced-input" placeholder="🚀 CommandBar Pro - Escribe comando, búsqueda o URL..." style="width: 100% !important; border: none !important; outline: none !important; font-size: 18px !important; padding: 0 !important; background: transparent !important;"></div><div style="padding: 16px !important; color: #666 !important; font-size: 14px !important;"><div style="margin-bottom: 8px !important;">⚡ <strong>Funciona en cualquier sitio:</strong></div><div>• Escribe una URL para navegar</div><div>• Escribe texto para buscar en Google</div><div>• Presiona Tab para buscar en Perplexity</div><div>• Presiona Escape para cerrar</div></div></div></div>';
              
              document.body.appendChild(commandBar);
              
              const input = document.getElementById('forced-input');
              input.focus();
              
              function handleKeyDown(e) {
                if (e.key === 'Escape') {
                  commandBar.remove();
                  document.removeEventListener('keydown', handleKeyDown);
                } else if (e.key === 'Enter') {
                  const query = input.value.trim();
                  if (query) {
                    let url;
                    if (query.includes('.') && !query.includes(' ')) {
                      url = query.startsWith('http') ? query : 'https://' + query;
                    } else {
                      url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
                    }
                    window.open(url, '_blank');
                  }
                  commandBar.remove();
                  document.removeEventListener('keydown', handleKeyDown);
                } else if (e.key === 'Tab') {
                  e.preventDefault();
                  const query = input.value.trim();
                  if (query && !query.includes('.')) {
                    const perplexityUrl = 'https://www.perplexity.ai/search?q=' + encodeURIComponent(query);
                    window.open(perplexityUrl, '_blank');
                    commandBar.remove();
                    document.removeEventListener('keydown', handleKeyDown);
                  }
                }
              }
              
              document.addEventListener('keydown', handleKeyDown);
              
              commandBar.addEventListener('click', (e) => {
                if (e.target === commandBar) {
                  commandBar.remove();
                  document.removeEventListener('keydown', handleKeyDown);
                }
              });
            }
          });
          
          // Cerrar popup tras inyección exitosa
          window.close();
        } catch (injectionError) {
          console.log('Inyección forzada también falló:', injectionError);
          throw error; // Re-lanzar el error original para mostrar mensaje
        }
      }
    }
  } catch (error) {
    console.error('Error abriendo Command Bar:', error);
    
    // Obtener URL para mensaje específico
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tabs[0]?.url || '';
    
    // Mensajes específicos según el sitio
    if (url.includes('perplexity.ai') || url.includes('chatgpt.com') || 
        url.includes('claude.ai') || url.includes('bard.google.com')) {
             showNotification('🔒 Este sitio bloquea extensiones. Usa Cmd+K en otros sitios.', 'info');
    } else {
      showNotification('⚠️ Recarga la página o prueba en otro sitio web', 'warning');
    }
  }
}

// Abrir opciones avanzadas
function openOptions() {
  chrome.runtime.openOptionsPage();
}

// Abrir configuración de idioma (redirigir a opciones avanzadas)
async function changeLanguage() {
  try {
    // Abrir la página de opciones directamente en la sección de idioma
    await chrome.runtime.openOptionsPage();
    // Cerrar el popup
    window.close();
  } catch (error) {
    console.error('Error opening options page:', error);
    // Fallback: mostrar mensaje de que debe abrir manualmente
    showNotification(i18n.t('popup.messages.openOptionsManually'), 'info');
  }
}

// Manejar cambios en configuración
async function handleSettingChange(event) {
  const setting = event.target.id;
  const value = event.target.checked;
  
  try {
    // Guardar en storage
    await chrome.storage.sync.set({ [setting.replace('-', '')]: value });
    
    // Aplicar cambios inmediatos
    switch (setting) {
      case 'dark-mode':
        document.body.classList.toggle('dark-theme', value);
        showNotification(value ? 'Tema oscuro activado' : 'Tema claro activado', 'success');
        break;
        
      case 'auto-focus':
        showNotification(value ? 'Auto-focus activado' : 'Auto-focus desactivado', 'success');
        break;
        

        
      case 'quick-actions':
        showNotification(value ? 'Acciones rápidas activadas' : 'Acciones rápidas desactivadas', 'success');
        break;
    }
    
    // Animación del checkbox
    const settingItem = event.target.closest('.setting-item');
    settingItem.style.transform = 'scale(1.05)';
    setTimeout(() => {
      settingItem.style.transform = 'scale(1)';
    }, 150);
    
  } catch (error) {
    console.error('Error guardando configuración:', error);
    showNotification('Error guardando configuración', 'error');
  }
}

// Configurar efectos hover
function setupHoverEffects() {
  // Efectos para elementos interactivos
  const interactiveElements = document.querySelectorAll('.feature-item, .command-item, .search-type, .action-btn');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Efecto especial para el botón principal
  const primaryBtn = document.querySelector('.action-btn.primary');
  primaryBtn.addEventListener('click', function() {
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.style.transform = 'scale(1)';
    }, 100);
  });
}

// Mostrar tip del día
function showDailyTip() {
  const tips = [
    'Usa "/" al inicio para comandos específicos',
    'Escribe una URL para navegación directa',
    'Busca en pestañas escribiendo parte del título',
    'Accede rápido a marcadores con búsqueda',
    'Usa Cmd+K (Mac) o Ctrl+K en cualquier página web',
    'Cambia entre pestañas con búsqueda inteligente',
    'Pinea pestañas importantes con /pin',
    'Duplica pestañas rápidamente con /duplicar'
  ];
  
  const today = new Date().getDay();
  const tipIndex = today % tips.length;
  const selectedTip = tips[tipIndex];
  
  // Actualizar el tip mostrado
  const tipElements = document.querySelectorAll('.tip-text');
  if (tipElements.length > 0) {
    tipElements[0].textContent = `Tip del día: ${selectedTip}`;
  }
}

// Mostrar notificación
function showNotification(message, type = 'info') {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span class="notification-icon">${getNotificationIcon(type)}</span>
    <span class="notification-text">${message}</span>
  `;
  
  // Agregar estilos
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${getNotificationColor(type)};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
  `;
  
  // Agregar al DOM
  document.body.appendChild(notification);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Obtener icono de notificación
function getNotificationIcon(type) {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    default: return 'ℹ️';
  }
}

// Obtener color de notificación
function getNotificationColor(type) {
  switch (type) {
    case 'success': return '#28a745';
    case 'error': return '#dc3545';
    case 'warning': return '#ffc107';
    default: return '#007bff';
  }
}



// Función helper para actualizar elemento con verificación
function updateElementText(elementId, translationKey, replacements = {}) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = i18n.t(translationKey, replacements);
  } else {
    console.warn(`Element with ID '${elementId}' not found in popup`);
  }
}

// Actualizar interfaz con traducciones
function updateInterface() {
  // Verificar que i18n esté disponible
  if (typeof i18n === 'undefined') {
    console.error('i18n not available in popup');
    return;
  }
  
  // Actualizar atributo lang del HTML
  document.documentElement.lang = i18n.getCurrentLanguage();
  
  // Título de página
  updateElementText('popup-page-title', 'appName');
  
  // Título y versión
  updateElementText('popup-app-name', 'appName');
  updateElementText('popup-version', 'popup.version');
  
  // Support section
  updateElementText('support-title', 'support.title');
  updateElementText('support-message', 'support.message');
  updateElementText('support-buy-coffee', 'support.buyMeACoffee');
  
  // Atajos de teclado
  updateElementText('popup-keyboard-shortcuts', 'popup.keyboardShortcuts');
  updateElementText('popup-open-commandbar', 'popup.openCommandBar');
  updateElementText('popup-edit-current-url', 'popup.editCurrentUrl');
  
  // Funcionalidades
  updateElementText('popup-features', 'popup.features');
  updateElementText('popup-universal-search', 'popup.featureItems.universalSearch');
  updateElementText('popup-quick-navigation', 'popup.featureItems.quickNavigation');
  updateElementText('popup-tab-management', 'popup.featureItems.tabManagement');
  updateElementText('popup-bookmark-access', 'popup.featureItems.bookmarkAccess');
  updateElementText('popup-history-search', 'popup.featureItems.historySearch');
  updateElementText('popup-quick-commands', 'popup.featureItems.quickCommands');
  
  // Comandos disponibles
  updateElementText('popup-available-commands', 'popup.availableCommands');
  updateElementText('popup-cmd-new-tab', 'commands.newTab');
  updateElementText('popup-cmd-new-tab-desc', 'commandDescs.newTab');
  updateElementText('popup-cmd-pin', 'commands.pinTab');
  updateElementText('popup-cmd-pin-desc', 'commandDescs.pinTab');
  updateElementText('popup-cmd-close', 'commands.closeTab');
  updateElementText('popup-cmd-close-desc', 'commandDescs.closeTab');
  updateElementText('popup-cmd-duplicate', 'commands.duplicateTab');
  updateElementText('popup-cmd-duplicate-desc', 'commandDescs.duplicateTab');
  updateElementText('popup-cmd-bookmarks', 'commands.bookmarks');
  updateElementText('popup-cmd-bookmarks-desc', 'commandDescs.bookmarks');
  updateElementText('popup-cmd-history', 'commands.history');
  updateElementText('popup-cmd-history-desc', 'commandDescs.history');
  
  // Tipos de búsqueda
  updateElementText('popup-search-types', 'popup.searchTypes');
  updateElementText('popup-web-search-title', 'popup.searchTypeItems.webSearch.title');
  updateElementText('popup-web-search-desc', 'popup.searchTypeItems.webSearch.desc');
  updateElementText('popup-direct-nav-title', 'popup.searchTypeItems.directNavigation.title');
  updateElementText('popup-direct-nav-desc', 'popup.searchTypeItems.directNavigation.desc');
  updateElementText('popup-open-tabs-title', 'popup.searchTypeItems.openTabs.title');
  updateElementText('popup-open-tabs-desc', 'popup.searchTypeItems.openTabs.desc');
  updateElementText('popup-bookmarks-title', 'popup.searchTypeItems.bookmarks.title');
  updateElementText('popup-bookmarks-desc', 'popup.searchTypeItems.bookmarks.desc');
  updateElementText('popup-history-title', 'popup.searchTypeItems.history.title');
  updateElementText('popup-history-desc', 'popup.searchTypeItems.history.desc');
  
  // Configuración
  updateElementText('popup-configuration', 'popup.configuration');
  updateElementText('popup-dark-theme', 'popup.settings.darkTheme');
  updateElementText('popup-auto-focus', 'popup.settings.autoFocus');
  updateElementText('popup-quick-actions', 'popup.settings.quickActions');
  
  // Botones del footer
  updateElementText('popup-try-commandbar', 'popup.tryCommandBar');
  updateElementText('popup-advanced-settings', 'popup.advancedSettings');
  updateElementText('popup-change-language', 'popup.changeLanguage');
  
  // Tips
  updateElementText('popup-tip-slash', 'popup.tips.useSlash');
  updateElementText('popup-tip-url', 'popup.tips.directUrl');
  
  // Actualizar atajos de teclado según la plataforma
  updateKeyboardShortcuts();
}

// Agregar estilos de animación dinámicamente
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .dark-theme {
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  }
  
  .dark-theme .popup-container {
    background: #1e1e1e;
    color: #e0e0e0;
  }
  
  .dark-theme .popup-content {
    background: #1e1e1e;
  }
  
  .dark-theme .feature-section h2 {
    color: #e0e0e0;
    border-bottom-color: #404040;
  }
  
  .dark-theme .feature-item,
  .dark-theme .command-item,
  .dark-theme .search-type,
  .dark-theme .setting-item {
    background: #2d2d2d;
    border-color: #404040;
    color: #e0e0e0;
  }
  
  .dark-theme .feature-item:hover,
  .dark-theme .command-item:hover,
  .dark-theme .search-type:hover,
  .dark-theme .setting-item:hover {
    background: #3d3d3d;
  }
  
  .dark-theme .popup-footer {
    background: #2d2d2d;
    border-top-color: #404040;
  }
  
  .dark-theme .action-btn.secondary {
    background: #404040;
    color: #e0e0e0;
    border-color: #555;
  }
  
  .dark-theme .popup-tips {
    background: linear-gradient(135deg, #2d2d2d 0%, #404040 100%);
    border-top-color: #404040;
  }
  
  .dark-theme .tip-text {
    color: #ccc;
  }
`;
document.head.appendChild(style);

// Keyboard navigation
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    window.close();
  } else if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    testCommandBar();
  }
});

// Analytics y métricas (opcional)
function trackUsage(action) {
  try {
    chrome.storage.local.get(['usage_stats'], (result) => {
      const stats = result.usage_stats || {};
      const today = new Date().toDateString();
      
      if (!stats[today]) {
        stats[today] = {};
      }
      
      stats[today][action] = (stats[today][action] || 0) + 1;
      
      chrome.storage.local.set({ usage_stats: stats });
    });
  } catch (error) {
    console.log('Error tracking usage:', error);
  }
}

// Track popup open
trackUsage('popup_opened'); 