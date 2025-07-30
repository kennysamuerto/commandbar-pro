// JavaScript para la página de opciones de CommandBar Pro

document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Esperar a que i18n se inicialice completamente
    await i18n.loadLanguage();
    
    // Pequeño delay para asegurar que el DOM esté completamente listo
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Inicializar elementos de la UI
    initializeOptions();
    
    // Cargar configuración guardada
    await loadSettings();
    
    // Delay adicional antes de actualizar interfaz para asegurar estabilidad
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Actualizar interfaz con traducciones (después de cargar configuración)
    updateInterface();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Fallback: re-intentar traducción después de 2 segundos para elementos que pueden no haberse encontrado
    setTimeout(() => {
      console.log('Re-attempting translation for any missed elements...');
      updateInterface();
    }, 2000);
    
    console.log('Options page initialized successfully');
  } catch (error) {
    console.error('Error during initialization:', error);
  }
});

// Configuración por defecto
const defaultSettings = {
  theme: 'auto',
  animationSpeed: 'normal',
  maxResults: 5,
  searchTabs: true,
  searchBookmarks: true,
  searchHistory: true,
  searchDelay: 150,
  defaultSearchEngine: 'google',
  preventSiteShortcuts: true,
  storeUsageStats: false,
  language: 'es'
};

let currentSettings = { ...defaultSettings };

// Detectar si es macOS
function isMacOS() {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

// Inicializar opciones
function initializeOptions() {
  // Configurar el range slider con valor dinámico
  const searchDelayRange = document.getElementById('search-delay');
  const searchDelayValue = document.getElementById('search-delay-value');
  
  searchDelayRange.addEventListener('input', function() {
    searchDelayValue.textContent = `${this.value}ms`;
  });
  
  // Actualizar atajos de teclado según la plataforma
  updateKeyboardShortcuts();
  
  // Agregar animaciones de entrada escalonadas
  const sections = document.querySelectorAll('.option-section');
  sections.forEach((section, index) => {
    section.style.animationDelay = `${index * 0.1}s`;
    section.style.animation = 'fadeInUp 0.6s ease-out both';
  });
}

// Actualizar atajos de teclado según la plataforma
function updateKeyboardShortcuts() {
  const isMac = isMacOS();
  const modifierKey = isMac ? 'Cmd' : 'Ctrl';
  
  // Actualizar atajos principales
  const shortcutDisplays = document.querySelectorAll('.shortcut-display');
  if (shortcutDisplays.length >= 1) {
    shortcutDisplays[0].innerHTML = `
      <kbd class="key">${modifierKey}</kbd> + <kbd class="key">K</kbd>
      <span class="shortcut-note">Abrir Command Bar</span>
    `;
  }
  
  if (shortcutDisplays.length >= 2) {
    shortcutDisplays[1].innerHTML = `
      <kbd class="key">${modifierKey}</kbd> + <kbd class="key">Shift</kbd> + <kbd class="key">K</kbd>
      <span class="shortcut-note">Editar URL actual</span>
    `;
  }
}

// Cargar configuración guardada
async function loadSettings() {
  try {
    const stored = await chrome.storage.sync.get(Object.keys(defaultSettings));
    currentSettings = { ...defaultSettings, ...stored };
    
    // Sincronizar idioma con i18n
    if (currentSettings.language) {
      await i18n.setLanguage(currentSettings.language);
    }
    
    // Aplicar configuración a los controles de la UI
    applySettingsToUI();
  } catch (error) {
    console.error('Error cargando configuración:', error);
    // No mostrar toast aquí para evitar errores de traducción antes de la inicialización
  }
}

// Aplicar configuración a la UI
function applySettingsToUI() {
  // Selects
  document.getElementById('theme-select').value = currentSettings.theme;
  document.getElementById('animation-speed').value = currentSettings.animationSpeed;
  document.getElementById('default-search-engine').value = currentSettings.defaultSearchEngine;
  document.getElementById('language-select').value = currentSettings.language;
  
  // Inputs
  document.getElementById('max-results').value = currentSettings.maxResults;
  document.getElementById('search-delay').value = currentSettings.searchDelay;
  document.getElementById('search-delay-value').textContent = `${currentSettings.searchDelay}ms`;
  
  // Checkboxes
  const checkboxMappings = {
    'search-tabs': 'searchTabs',
    'search-bookmarks': 'searchBookmarks',
    'search-history': 'searchHistory',
    'prevent-site-shortcuts': 'preventSiteShortcuts',
    'store-usage-stats': 'storeUsageStats'
  };
  
  Object.entries(checkboxMappings).forEach(([elementId, settingKey]) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.checked = currentSettings[settingKey];
    }
  });
}

// Configurar event listeners
function setupEventListeners() {
  // Botón guardar
  document.getElementById('save-options').addEventListener('click', saveSettings);
  
  // Botones de limpieza
  document.getElementById('clear-cache').addEventListener('click', () => showConfirmModal(
    i18n.t('options.confirmations.clearCache.title'),
    i18n.t('options.confirmations.clearCache.message'),
    clearCache
  ));
  
  document.getElementById('clear-stats').addEventListener('click', () => showConfirmModal(
    i18n.t('options.confirmations.clearStats.title'),
    i18n.t('options.confirmations.clearStats.message'),
    clearStats
  ));
  
  document.getElementById('reset-all').addEventListener('click', () => showConfirmModal(
    i18n.t('options.confirmations.resetAll.title'),
    i18n.t('options.confirmations.resetAll.message'),
    resetAllSettings
  ));
  
  // Botones de exportar/importar
  document.getElementById('export-settings').addEventListener('click', exportSettings);
  document.getElementById('import-settings').addEventListener('click', importSettings);
  
  // Enlaces del footer
  document.getElementById('view-changelog').addEventListener('click', viewChangelog);
  document.getElementById('report-bug').addEventListener('click', reportBug);
  document.getElementById('view-source').addEventListener('click', viewSource);
  
  // Modal
  document.getElementById('modal-close').addEventListener('click', hideModal);
  document.getElementById('modal-cancel').addEventListener('click', hideModal);
  document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) hideModal();
  });
  
  // Detectar cambios en tiempo real
  setupRealTimeUpdates();
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
}

// Configurar actualizaciones en tiempo real
function setupRealTimeUpdates() {
  // Selects
  const selects = ['theme-select', 'animation-speed', 'default-search-engine', 'language-select'];
  selects.forEach(id => {
    document.getElementById(id).addEventListener('change', async function() {
      const settingKey = getSettingKeyFromElementId(id);
      if (settingKey) {
        currentSettings[settingKey] = this.value;
        if (id === 'theme-select') {
          applyThemeChange(this.value);
        } else if (id === 'language-select') {
          await handleLanguageChange(this.value);
        }
      }
    });
  });
  
  // Number inputs
  document.getElementById('max-results').addEventListener('input', function() {
    currentSettings.maxResults = parseInt(this.value);
  });
  
  // Range input
  document.getElementById('search-delay').addEventListener('input', function() {
    currentSettings.searchDelay = parseInt(this.value);
  });
  
  // Checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const settingKey = getSettingKeyFromElementId(this.id);
      if (settingKey) {
        currentSettings[settingKey] = this.checked;
        

      }
    });
  });
}

// Mapear ID de elemento a clave de configuración
function getSettingKeyFromElementId(elementId) {
  const mappings = {
    'theme-select': 'theme',
    'animation-speed': 'animationSpeed',
    'max-results': 'maxResults',
    'search-tabs': 'searchTabs',
    'search-bookmarks': 'searchBookmarks',
    'search-history': 'searchHistory',
    'search-delay': 'searchDelay',
    'default-search-engine': 'defaultSearchEngine',
    'prevent-site-shortcuts': 'preventSiteShortcuts',
    'store-usage-stats': 'storeUsageStats',
    'language-select': 'language'
  };
  
  return mappings[elementId];
}

// Aplicar cambio de tema
function applyThemeChange(theme) {
  // Aplicar inmediatamente para vista previa
  const body = document.body;
  body.className = body.className.replace(/theme-\w+/g, '');
  
  if (theme !== 'auto') {
    body.classList.add(`theme-${theme}`);
  }
  
  showToast(i18n.t('options.messages.themeChanged', { theme }), 'success');
}

  // Manejar cambio de idioma
  async function handleLanguageChange(newLanguage) {
    try {
      await i18n.setLanguage(newLanguage);
      
      // Actualizar atributo lang del HTML
      document.documentElement.lang = newLanguage;
      
      // Forzar actualización completa de la interfaz
      setTimeout(() => {
        updateInterface();
      }, 100); // Pequeño delay para asegurar que el idioma esté completamente cargado
      
      // Notificar a todos los content scripts del cambio
      try {
        const tabs = await chrome.tabs.query({});
        const settings = { language: newLanguage };
        
        for (const tab of tabs) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              action: 'settings_updated',
              settings: settings
            });
          } catch (error) {
            // Ignorar errores de tabs que no pueden recibir mensajes
            console.log(`Could not send message to tab ${tab.id}:`, error);
          }
        }
      } catch (error) {
        console.error('Error notifying tabs of language change:', error);
      }
      
      const languageName = i18n.t(`options.languageSettings.languages.${newLanguage}`);
      showToast(i18n.t('options.messages.languageChanged', { language: languageName }), 'success');
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }

// Función helper para actualizar elemento con verificación
function updateElementText(elementId, translationKey, replacements = {}) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = i18n.t(translationKey, replacements);
  } else {
    console.warn(`Element with ID '${elementId}' not found`);
  }
}

// Actualizar interfaz con traducciones
function updateInterface() {
  // Verificar que i18n esté disponible
  if (typeof i18n === 'undefined') {
    console.error('i18n not available');
    return;
  }
  
  // Actualizar atributo lang del HTML
  document.documentElement.lang = i18n.getCurrentLanguage();
  
  // Título de página
  updateElementText('page-title', 'options.title');
  
  // Título y subtítulo
  updateElementText('options-app-name', 'appName');
  updateElementText('options-subtitle', 'options.subtitle');
  
  // Support section
  updateElementText('support-title', 'support.title');
  updateElementText('support-message', 'support.message');
  updateElementText('support-buy-coffee', 'support.buyMeACoffee');
  
  // Configuración General
  updateElementText('general-settings-title', 'options.generalSettings');
  document.getElementById('interface-theme-label').textContent = i18n.t('options.general.interfaceTheme');
  document.getElementById('interface-theme-desc').textContent = i18n.t('options.general.interfaceThemeDesc');
  document.getElementById('animation-speed-label').textContent = i18n.t('options.general.animationSpeed');
  document.getElementById('animation-speed-desc').textContent = i18n.t('options.general.animationSpeedDesc');
  document.getElementById('max-results-label').textContent = i18n.t('options.general.maxResults');
  document.getElementById('max-results-desc').textContent = i18n.t('options.general.maxResultsDesc');
  
  // Opciones de tema
  document.getElementById('theme-auto').textContent = i18n.t('options.general.themeOptions.auto');
  document.getElementById('theme-light').textContent = i18n.t('options.general.themeOptions.light');
  document.getElementById('theme-dark').textContent = i18n.t('options.general.themeOptions.dark');
  
  // Opciones de animación
  document.getElementById('animation-slow').textContent = i18n.t('options.general.animationOptions.slow');
  document.getElementById('animation-normal').textContent = i18n.t('options.general.animationOptions.normal');
  document.getElementById('animation-fast').textContent = i18n.t('options.general.animationOptions.fast');
  document.getElementById('animation-none').textContent = i18n.t('options.general.animationOptions.none');
  
  // Búsqueda y Resultados
  document.getElementById('search-settings-title').textContent = i18n.t('options.searchAndResults');
  document.getElementById('search-sources-label').textContent = i18n.t('options.searchSettings.searchSources');
  document.getElementById('search-sources-desc').textContent = i18n.t('options.searchSettings.searchSourcesDesc');
  document.getElementById('search-tabs-label').textContent = i18n.t('options.searchSettings.sources.openTabs');
  document.getElementById('search-bookmarks-label').textContent = i18n.t('options.searchSettings.sources.bookmarks');
  document.getElementById('search-history-label').textContent = i18n.t('options.searchSettings.sources.history');
  document.getElementById('search-delay-label').textContent = i18n.t('options.searchSettings.searchDelay');
  document.getElementById('search-delay-desc').textContent = i18n.t('options.searchSettings.searchDelayDesc');
  document.getElementById('default-search-engine-label').textContent = i18n.t('options.searchSettings.defaultSearchEngine');
  document.getElementById('default-search-engine-desc').textContent = i18n.t('options.searchSettings.defaultSearchEngineDesc');
  
  // Motores de búsqueda
  document.getElementById('engine-google').textContent = i18n.t('options.searchSettings.engines.google');
  document.getElementById('engine-bing').textContent = i18n.t('options.searchSettings.engines.bing');
  document.getElementById('engine-duckduckgo').textContent = i18n.t('options.searchSettings.engines.duckduckgo');
  document.getElementById('engine-yahoo').textContent = i18n.t('options.searchSettings.engines.yahoo');
  
  // Atajos de Teclado
  updateElementText('keyboard-shortcuts-title', 'options.keyboardShortcuts');
  updateElementText('main-shortcuts-label', 'options.keyboard.mainShortcuts');
  updateElementText('main-shortcuts-desc', 'options.keyboard.mainShortcutsDesc');
  updateElementText('open-commandbar-shortcut', 'options.keyboard.openCommandBar');
  updateElementText('edit-url-shortcut', 'options.keyboard.editCurrentUrl');
  updateElementText('additional-config-label', 'options.keyboard.additionalConfig');
  updateElementText('additional-config-desc', 'options.keyboard.additionalConfigDesc');
  updateElementText('prevent-site-shortcuts-label', 'options.keyboard.preventSiteShortcuts');
  
  // Privacidad y Datos
  updateElementText('privacy-title', 'options.privacyAndData');
  updateElementText('data-collection-label', 'options.privacy.dataCollection');
  updateElementText('data-collection-desc', 'options.privacy.dataCollectionDesc');
  updateElementText('usage-stats-label', 'options.privacy.usageStats');
  updateElementText('data-cleanup-label', 'options.privacy.dataCleanup');
  updateElementText('data-cleanup-desc', 'options.privacy.dataCleanupDesc');
  updateElementText('clear-cache-text', 'options.privacy.actions.clearCache');
  updateElementText('clear-stats-text', 'options.privacy.actions.clearStats');
  updateElementText('reset-all-text', 'options.privacy.actions.resetAll');
  
  // Idioma
  updateElementText('language-title', 'options.language');
  updateElementText('interface-language-label', 'options.languageSettings.interfaceLanguage');
  updateElementText('interface-language-desc', 'options.languageSettings.interfaceLanguageDesc');
  
  // Footer
  document.getElementById('footer-version').textContent = i18n.t('options.footer.version');
  document.querySelectorAll('.footer-link')[0].textContent = i18n.t('options.footer.changelog');
  document.querySelectorAll('.footer-link')[1].textContent = i18n.t('options.footer.reportBug');
  document.querySelectorAll('.footer-link')[2].textContent = i18n.t('options.footer.viewSource');
  document.getElementById('export-settings-text').textContent = i18n.t('options.buttons.exportSettings');
  document.getElementById('import-settings-text').textContent = i18n.t('options.buttons.importSettings');
  document.getElementById('save-changes-text').textContent = i18n.t('options.buttons.saveChanges');
  
  // Modal y botones
  document.getElementById('modal-cancel-text').textContent = i18n.t('options.buttons.cancel');
  document.getElementById('modal-confirm-text').textContent = i18n.t('options.buttons.confirm');
  
  // Actualizar atajos de teclado según la plataforma
  updateKeyboardShortcuts();
}

// Guardar configuración
async function saveSettings() {
  try {
    await chrome.storage.sync.set(currentSettings);
    
    // Notificar a content scripts sobre cambios
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'settings_updated',
          settings: currentSettings
        }).catch(() => {
          // Ignorar errores de pestañas que no pueden recibir mensajes
        });
      });
    });
    
    showToast(i18n.t('options.messages.settingsSaved'), 'success');
    
    // Efecto visual en el botón
    const saveButton = document.getElementById('save-options');
    saveButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
      saveButton.style.transform = 'scale(1)';
    }, 150);
    
  } catch (error) {
    console.error('Error guardando configuración:', error);
    showToast(i18n.t('options.messages.errors.savingSettings'), 'error');
  }
}

// Limpiar cache
async function clearCache() {
  try {
    await chrome.storage.local.clear();
    showToast(i18n.t('options.messages.cacheCleared'), 'success');
  } catch (error) {
    console.error('Error limpiando cache:', error);
    showToast(i18n.t('options.messages.errors.clearingCache'), 'error');
  }
}

// Limpiar estadísticas
async function clearStats() {
  try {
    await chrome.storage.local.remove(['usage_stats', 'performance_metrics']);
    showToast(i18n.t('options.messages.statsCleared'), 'success');
  } catch (error) {
    console.error('Error limpiando estadísticas:', error);
    showToast(i18n.t('options.messages.errors.clearingStats'), 'error');
  }
}

// Restablecer toda la configuración
async function resetAllSettings() {
  try {
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
    
    currentSettings = { ...defaultSettings };
    applySettingsToUI();
    
    showToast(i18n.t('options.messages.settingsReset'), 'success');
  } catch (error) {
    console.error('Error restableciendo configuración:', error);
    showToast(i18n.t('options.messages.errors.resettingSettings'), 'error');
  }
}

// Exportar configuración
function exportSettings() {
  const dataStr = JSON.stringify(currentSettings, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `commandbar-settings-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showToast(i18n.t('options.messages.settingsExported'), 'success');
}

// Importar configuración
function importSettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedSettings = JSON.parse(e.target.result);
        
        // Validar configuración
        const validSettings = {};
        Object.keys(defaultSettings).forEach(key => {
          if (importedSettings.hasOwnProperty(key)) {
            validSettings[key] = importedSettings[key];
          }
        });
        
        currentSettings = { ...defaultSettings, ...validSettings };
        applySettingsToUI();
        
        showToast(i18n.t('options.messages.settingsImported'), 'success');
      } catch (error) {
        console.error('Error importando configuración:', error);
        showToast(i18n.t('options.messages.invalidFile'), 'error');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// Mostrar modal de confirmación
function showConfirmModal(title, message, onConfirm) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-message').textContent = message;
  
  // Actualizar textos de botones con traducciones actuales
  document.getElementById('modal-cancel-text').textContent = i18n.t('options.buttons.cancel');
  document.getElementById('modal-confirm-text').textContent = i18n.t('options.buttons.confirm');
  
  document.getElementById('modal-overlay').style.display = 'flex';
  
  // Configurar botón de confirmación
  const confirmButton = document.getElementById('modal-confirm');
  const cancelButton = document.getElementById('modal-cancel');
  const closeButton = document.getElementById('modal-close');
  
  confirmButton.onclick = function() {
    onConfirm();
    hideModal();
  };
  
  cancelButton.onclick = hideModal;
  closeButton.onclick = hideModal;
}

// Ocultar modal
function hideModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

// Mostrar toast
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  const messageEl = document.getElementById('toast-message');
  
  // Iconos por tipo
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  // Colores por tipo
  const colors = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#007bff'
  };
  
  icon.textContent = icons[type] || icons.info;
  messageEl.textContent = message;
  toast.style.background = colors[type] || colors.info;
  toast.style.display = 'flex';
  
  // Auto-hide después de 4 segundos
  setTimeout(() => {
    toast.style.display = 'none';
  }, 4000);
}

// Manejar teclado
function handleKeyboard(e) {
  // Ctrl+S para guardar
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveSettings();
  }
  
  // Escape para cerrar modal
  if (e.key === 'Escape') {
    hideModal();
  }
}

// Enlaces del footer
function viewChangelog() {
  const changelogWindow = window.open('', '_blank', 'width=800,height=600');
  changelogWindow.document.write(`
    <html>
      <head><title>CommandBar Pro - Registro de Cambios</title></head>
      <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px;">
        <h1>📋 Registro de Cambios</h1>
        
        <h2>v1.0.0 - Lanzamiento Inicial</h2>
        <ul>
          <li>✨ Command Bar con atajo Cmd+K (Mac) o Ctrl+K</li>
          <li>🔍 Búsqueda universal en pestañas, marcadores e historial</li>
          <li>🌐 Navegación directa por URL</li>
          <li>⚡ Comandos rápidos con prefijo "/"</li>
          <li>🎨 Tema claro y oscuro</li>
          <li>📱 Diseño responsive</li>
          <li>⚙️ Página de opciones completa</li>
          <li>🔒 Privacidad total (sin envío de datos externos)</li>
        </ul>
        
        <h2>Próximas Características</h2>
        <ul>
          <li>🤖 Sugerencias con IA</li>
          <li>🎤 Comandos de voz</li>
          <li>📊 Agrupación inteligente de resultados</li>
          <li>🔗 Integración con servicios web</li>
          <li>🎯 Comandos personalizados</li>
        </ul>
      </body>
    </html>
  `);
}

function reportBug() {
  const subject = encodeURIComponent('CommandBar Pro - Reporte de Bug');
  const body = encodeURIComponent(`
Describe el problema:


Pasos para reproducir:
1. 
2. 
3. 

Comportamiento esperado:


Comportamiento actual:


Información del sistema:
- Chrome: ${navigator.userAgent}
- Extensión: v1.0.0
- OS: ${navigator.platform}
  `);
  
  window.open(`mailto:soporte@commandbarpro.com?subject=${subject}&body=${body}`);
}

function viewSource() {
  window.open('https://github.com/usuario/commandbar-pro', '_blank');
}

// Agregar estilos de animación dinámicamente
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .theme-light {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;
  }
  
  .theme-dark {
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%) !important;
    color: #e0e0e0 !important;
  }
  
  .theme-dark .options-container {
    background: #1e1e1e !important;
  }
  
  .theme-dark .option-section {
    background: #2d2d2d !important;
    border-color: #404040 !important;
  }
`;
document.head.appendChild(style);

// Trackear uso de la página de opciones
chrome.storage.local.get(['usage_stats'], (result) => {
  const stats = result.usage_stats || {};
  const today = new Date().toDateString();
  
  if (!stats[today]) {
    stats[today] = {};
  }
  
  stats[today]['options_page_opened'] = (stats[today]['options_page_opened'] || 0) + 1;
  
  chrome.storage.local.set({ usage_stats: stats });
}); 