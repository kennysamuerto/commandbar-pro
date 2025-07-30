// Sistema de internacionalización para CommandBar Pro
class I18n {
  constructor() {
    this.currentLanguage = 'es'; // Por defecto español
    this.translations = {
      es: {
        // Interfaz principal
        appName: 'CommandBar Pro',
        appDescription: 'Command Bar avanzada para Chrome inspirada en Arc Browser',
        
        // Placeholders y textos del input
        searchPlaceholder: 'Escribe un comando, búsqueda o URL...',
        editUrlPlaceholder: 'Editar URL actual',
        
        // Comandos
        commands: {
          newTab: 'Nueva Pestaña',
          newWindow: 'Nueva Ventana',
          incognito: 'Ventana Incógnito',
          pinTab: 'Pinear Pestaña',
          closeTab: 'Cerrar Pestaña',
          duplicateTab: 'Duplicar Pestaña',
          reload: 'Recargar Página',
          bookmarks: 'Mostrar Marcadores',
          history: 'Mostrar Historial',
          downloads: 'Mostrar Descargas',
          settings: 'Abrir Configuración',
          extensions: 'Gestionar Extensiones',
          readerMode: 'Activar Modo Lectura',
          editCurrentUrl: 'Editar URL Actual'
        },
        
        // Descripciones de comandos
        commandDescs: {
          newTab: 'Crear nueva pestaña',
          newWindow: 'Crear nueva ventana',
          incognito: 'Ventana incógnito',
          pinTab: 'Pinear pestaña actual',
          closeTab: 'Cerrar pestaña actual',
          duplicateTab: 'Duplicar pestaña actual',
          reload: 'Recargar página',
          bookmarks: 'Mostrar marcadores',
          history: 'Mostrar historial',
          downloads: 'Mostrar descargas',
          settings: 'Abrir configuración',
          extensions: 'Gestionar extensiones',
          readerMode: 'Activar modo lectura',
          editCurrentUrl: 'Editar URL actual'
        },
        
        // Secciones
        sections: {
          quickCommands: 'Comandos Rápidos',
          quickAccess: 'Acceso Rápido',
          availableCommands: 'Comandos Disponibles',
          webSearch: 'Búsqueda Web',
          navigation: 'Navegación',
          openTabs: 'Pestañas Abiertas',
          bookmarks: 'Marcadores',
          history: 'Historial'
        },
        
        // Búsquedas
        search: {
          searchInGoogle: 'Buscar "{query}" en Google',
          searchInBing: 'Buscar "{query}" en Bing',
          searchInDuckDuckGo: 'Buscar "{query}" en DuckDuckGo',
          searchInPerplexity: 'Buscar "{query}" en Perplexity',
          goToUrl: 'Ir a {url}',
          openInNewTab: 'Abrir en nueva pestaña',
          noResults: 'No se encontraron comandos'
        },
        
        // Hints y ayuda
        hints: {
          pressEnter: 'Presiona Enter ↵',
          editMode: 'Modo edición - Los cambios se abren en esta pestaña',
          tabHint: 'Presiona Tab para buscar en Perplexity'
        },
        
        // Support section
        support: {
          title: '☕ Apoya el Desarrollo',
          message: 'Esta extensión ha sido desarrollada con cariño, y todas sus funciones son totalmente gratuitas. Desde lo más mínimo, puedes ayudarme a seguir manteniendo y actualizando la extensión, sería de gran ayuda.',
          buyMeACoffee: 'Comprar un Café',
          thankYou: 'Gracias por tu apoyo ❤️'
        },

        // Popup
        popup: {
          version: 'v1.2.0',
          keyboardShortcuts: 'Atajos de Teclado',
          openCommandBar: 'Abrir Command Bar',
          editCurrentUrl: 'Editar URL actual',
          features: 'Funcionalidades',
          availableCommands: 'Comandos Disponibles',
          searchTypes: 'Tipos de Búsqueda',
          configuration: 'Configuración',
          tryCommandBar: 'Probar Command Bar',
          advancedSettings: 'Configuración Avanzada',
          changeLanguage: 'Configurar Idioma',
          
          // Mensajes del popup
          messages: {
            openOptionsManually: 'Abre las opciones de la extensión para cambiar el idioma'
          },
          
          // Características
          featureItems: {
            universalSearch: 'Búsqueda Universal',
            quickNavigation: 'Navegación Rápida',
            tabManagement: 'Gestión de Pestañas',
            bookmarkAccess: 'Acceso a Marcadores',
            historySearch: 'Búsqueda en Historial',
            quickCommands: 'Comandos Rápidos'
          },
          
          // Tipos de búsqueda
          searchTypeItems: {
            webSearch: {
              title: 'Búsqueda Web',
              desc: 'Busca en Google, Bing o DuckDuckGo'
            },
            directNavigation: {
              title: 'Navegación Directa',
              desc: 'Escribe una URL para navegar'
            },
            openTabs: {
              title: 'Pestañas Abiertas',
              desc: 'Busca y cambia entre pestañas'
            },
            bookmarks: {
              title: 'Marcadores',
              desc: 'Busca en tus marcadores guardados'
            },
            history: {
              title: 'Historial',
              desc: 'Busca en tu historial de navegación'
            }
          },
          
          // Configuración
          settings: {
            darkTheme: 'Tema Oscuro',
            autoFocus: 'Auto-focus en Input',
            quickActions: 'Acciones Rápidas'
          },
          
          // Tips
          tips: {
            useSlash: 'Usa "/" al inicio para comandos específicos',
            directUrl: 'Escribe una URL para navegación directa'
          }
        },
        
        // Opciones
        options: {
          title: 'CommandBar Pro - Opciones',
          subtitle: 'Configuración Avanzada',
          
          // Secciones principales
          generalSettings: 'Configuración General',
          searchAndResults: 'Búsqueda y Resultados',
          keyboardShortcuts: 'Atajos de Teclado',
          privacyAndData: 'Privacidad y Datos',
          language: 'Idioma',
          
          // Configuración general
          general: {
            interfaceTheme: 'Tema de Interfaz',
            interfaceThemeDesc: 'Selecciona el tema visual de CommandBar',
            animationSpeed: 'Velocidad de Animaciones',
            animationSpeedDesc: 'Controla la velocidad de las transiciones',
            maxResults: 'Máximo de Resultados',
            maxResultsDesc: 'Número máximo de sugerencias por categoría',
            
            themeOptions: {
              auto: 'Automático (Sistema)',
              light: 'Claro',
              dark: 'Oscuro'
            },
            
            animationOptions: {
              slow: 'Lenta',
              normal: 'Normal',
              fast: 'Rápida',
              none: 'Sin animaciones'
            }
          },
          
          // Búsqueda
          searchSettings: {
            searchSources: 'Fuentes de Búsqueda',
            searchSourcesDesc: 'Selecciona dónde buscar resultados',
            searchDelay: 'Retraso de Búsqueda (ms)',
            searchDelayDesc: 'Tiempo de espera antes de ejecutar búsqueda',
            defaultSearchEngine: 'Buscador por Defecto',
            defaultSearchEngineDesc: 'Motor de búsqueda para consultas web',
            
            sources: {
              openTabs: 'Pestañas Abiertas',
              bookmarks: 'Marcadores',
              history: 'Historial'
            },
            
            engines: {
              google: 'Google',
              bing: 'Bing',
              duckduckgo: 'DuckDuckGo',
              yahoo: 'Yahoo'
            }
          },
          
          // Atajos de teclado
          keyboard: {
            mainShortcuts: 'Atajos Principales',
            mainShortcutsDesc: 'Combinaciones de teclado para CommandBar',
            openCommandBar: 'Abrir Command Bar',
            editCurrentUrl: 'Editar URL actual',
            additionalConfig: 'Configuración Adicional',
            additionalConfigDesc: 'Personaliza el comportamiento de los atajos',
            preventSiteShortcuts: 'Prevenir atajos del sitio web'
          },
          
          // Privacidad
          privacy: {
            dataCollection: 'Recopilación de Datos',
            dataCollectionDesc: 'Control sobre qué datos se almacenan localmente',
            dataCleanup: 'Limpieza de Datos',
            dataCleanupDesc: 'Gestionar datos almacenados',
            usageStats: 'Estadísticas de uso (local)',
            
            actions: {
              clearCache: 'Limpiar Cache',
              clearStats: 'Limpiar Estadísticas',
              resetAll: 'Restablecer Todo'
            }
          },
          
          // Idioma
          languageSettings: {
            interfaceLanguage: 'Idioma de la Interfaz',
            interfaceLanguageDesc: 'Selecciona el idioma de CommandBar',
            languages: {
              es: 'Español',
              en: 'English'
            }
          },
          
          // Botones
          buttons: {
            exportSettings: 'Exportar Configuración',
            importSettings: 'Importar Configuración',
            saveChanges: 'Guardar Cambios',
            cancel: 'Cancelar',
            confirm: 'Confirmar'
          },
          
          // Footer
          footer: {
            version: 'CommandBar Pro v1.2.0',
            changelog: 'Registro de cambios',
            reportBug: 'Reportar bug',
            viewSource: 'Ver código fuente'
          },
          
          // Mensajes
          messages: {
            settingsLoaded: 'Configuración cargada correctamente',
            settingsSaved: 'Configuración guardada correctamente',
            cacheCleared: 'Cache limpiado correctamente',
            statsCleared: 'Estadísticas limpiadas correctamente',
            settingsReset: 'Configuración restablecida correctamente',
            settingsExported: 'Configuración exportada correctamente',
            settingsImported: 'Configuración importada correctamente',
            invalidFile: 'Error: Archivo de configuración inválido',
            themeChanged: 'Tema cambiado a: {theme}',
            languageChanged: 'Idioma cambiado a: {language}',
            
            errors: {
              loadingSettings: 'Error cargando configuración',
              savingSettings: 'Error guardando configuración',
              clearingCache: 'Error limpiando cache',
              clearingStats: 'Error limpiando estadísticas',
              resettingSettings: 'Error restableciendo configuración',
              importingSettings: 'Error importando configuración'
            }
          },
          
          // Confirmaciones
          confirmations: {
            clearCache: {
              title: 'Limpiar Cache',
              message: '¿Estás seguro de que quieres limpiar todo el cache? Esto eliminará los resultados de búsqueda guardados.'
            },
            clearStats: {
              title: 'Limpiar Estadísticas',
              message: '¿Estás seguro de que quieres limpiar todas las estadísticas de uso?'
            },
            resetAll: {
              title: 'Restablecer Todo',
              message: '¿Estás seguro de que quieres restablecer toda la configuración? Esta acción no se puede deshacer.'
            }
          }
        },
        
        // Toasts y notificaciones
        notifications: {
          success: 'Éxito',
          error: 'Error',
          warning: 'Advertencia',
          info: 'Información'
        }
      },
      
      en: {
        // Main interface
        appName: 'CommandBar Pro',
        appDescription: 'Advanced Command Bar for Chrome inspired by Arc Browser',
        
        // Placeholders and input texts
        searchPlaceholder: 'Type a command, search or URL...',
        editUrlPlaceholder: 'Edit current URL',
        
        // Commands
        commands: {
          newTab: 'New Tab',
          newWindow: 'New Window',
          incognito: 'Incognito Window',
          pinTab: 'Pin Tab',
          closeTab: 'Close Tab',
          duplicateTab: 'Duplicate Tab',
          reload: 'Reload Page',
          bookmarks: 'Show Bookmarks',
          history: 'Show History',
          downloads: 'Show Downloads',
          settings: 'Open Settings',
          extensions: 'Manage Extensions',
          readerMode: 'Enable Reader Mode',
          editCurrentUrl: 'Edit Current URL'
        },
        
        // Command descriptions
        commandDescs: {
          newTab: 'Create new tab',
          newWindow: 'Create new window',
          incognito: 'Incognito window',
          pinTab: 'Pin current tab',
          closeTab: 'Close current tab',
          duplicateTab: 'Duplicate current tab',
          reload: 'Reload page',
          bookmarks: 'Show bookmarks',
          history: 'Show history',
          downloads: 'Show downloads',
          settings: 'Open settings',
          extensions: 'Manage extensions',
          readerMode: 'Enable reader mode',
          editCurrentUrl: 'Edit current URL'
        },
        
        // Sections
        sections: {
          quickCommands: 'Quick Commands',
          quickAccess: 'Quick Access',
          availableCommands: 'Available Commands',
          webSearch: 'Web Search',
          navigation: 'Navigation',
          openTabs: 'Open Tabs',
          bookmarks: 'Bookmarks',
          history: 'History'
        },
        
        // Search
        search: {
          searchInGoogle: 'Search "{query}" in Google',
          searchInBing: 'Search "{query}" in Bing',
          searchInDuckDuckGo: 'Search "{query}" in DuckDuckGo',
          searchInPerplexity: 'Search "{query}" in Perplexity',
          goToUrl: 'Go to {url}',
          openInNewTab: 'Open in new tab',
          noResults: 'No commands found'
        },
        
        // Hints and help
        hints: {
          pressEnter: 'Press Enter ↵',
          editMode: 'Edit mode - Changes open in this tab',
          tabHint: 'Press Tab to search in Perplexity'
        },
        
        // Support section
        support: {
          title: '☕ Support Development',
          message: 'This extension has been developed with love, and all its features are completely free. Even the smallest contribution can help me continue maintaining and updating the extension, it would be of great help.',
          buyMeACoffee: 'Buy me a Coffee',
          thankYou: 'Thank you for your support ❤️'
        },

        // Popup
        popup: {
          version: 'v1.2.0',
          keyboardShortcuts: 'Keyboard Shortcuts',
          openCommandBar: 'Open Command Bar',
          editCurrentUrl: 'Edit current URL',
          features: 'Features',
          availableCommands: 'Available Commands',
          searchTypes: 'Search Types',
          configuration: 'Configuration',
          tryCommandBar: 'Try Command Bar',
          advancedSettings: 'Advanced Settings',
          changeLanguage: 'Language Settings',
          
          // Popup messages
          messages: {
            openOptionsManually: 'Open extension options to change language'
          },
          
          // Features
          featureItems: {
            universalSearch: 'Universal Search',
            quickNavigation: 'Quick Navigation',
            tabManagement: 'Tab Management',
            bookmarkAccess: 'Bookmark Access',
            historySearch: 'History Search',
            quickCommands: 'Quick Commands'
          },
          
          // Search types
          searchTypeItems: {
            webSearch: {
              title: 'Web Search',
              desc: 'Search on Google, Bing or DuckDuckGo'
            },
            directNavigation: {
              title: 'Direct Navigation',
              desc: 'Type a URL to navigate'
            },
            openTabs: {
              title: 'Open Tabs',
              desc: 'Search and switch between tabs'
            },
            bookmarks: {
              title: 'Bookmarks',
              desc: 'Search your saved bookmarks'
            },
            history: {
              title: 'History',
              desc: 'Search your browsing history'
            }
          },
          
          // Settings
          settings: {
            darkTheme: 'Dark Theme',
            autoFocus: 'Auto-focus on Input',
            quickActions: 'Quick Actions'
          },
          
          // Tips
          tips: {
            useSlash: 'Use "/" at the start for specific commands',
            directUrl: 'Type a URL for direct navigation'
          }
        },
        
        // Options
        options: {
          title: 'CommandBar Pro - Options',
          subtitle: 'Advanced Configuration',
          
          // Main sections
          generalSettings: 'General Settings',
          searchAndResults: 'Search and Results',
          keyboardShortcuts: 'Keyboard Shortcuts',
          privacyAndData: 'Privacy and Data',
          language: 'Language',
          
          // General settings
          general: {
            interfaceTheme: 'Interface Theme',
            interfaceThemeDesc: 'Select CommandBar visual theme',
            animationSpeed: 'Animation Speed',
            animationSpeedDesc: 'Control transition speed',
            maxResults: 'Maximum Results',
            maxResultsDesc: 'Maximum number of suggestions per category',
            
            themeOptions: {
              auto: 'Automatic (System)',
              light: 'Light',
              dark: 'Dark'
            },
            
            animationOptions: {
              slow: 'Slow',
              normal: 'Normal',
              fast: 'Fast',
              none: 'No animations'
            }
          },
          
          // Search settings
          searchSettings: {
            searchSources: 'Search Sources',
            searchSourcesDesc: 'Select where to search for results',
            searchDelay: 'Search Delay (ms)',
            searchDelayDesc: 'Wait time before executing search',
            defaultSearchEngine: 'Default Search Engine',
            defaultSearchEngineDesc: 'Search engine for web queries',
            
            sources: {
              openTabs: 'Open Tabs',
              bookmarks: 'Bookmarks',
              history: 'History'
            },
            
            engines: {
              google: 'Google',
              bing: 'Bing',
              duckduckgo: 'DuckDuckGo',
              yahoo: 'Yahoo'
            }
          },
          
          // Keyboard shortcuts
          keyboard: {
            mainShortcuts: 'Main Shortcuts',
            mainShortcutsDesc: 'Keyboard combinations for CommandBar',
            openCommandBar: 'Open Command Bar',
            editCurrentUrl: 'Edit current URL',
            additionalConfig: 'Additional Configuration',
            additionalConfigDesc: 'Customize shortcut behavior',
            preventSiteShortcuts: 'Prevent website shortcuts'
          },
          
          // Privacy
          privacy: {
            dataCollection: 'Data Collection',
            dataCollectionDesc: 'Control over what data is stored locally',
            dataCleanup: 'Data Cleanup',
            dataCleanupDesc: 'Manage stored data',
            usageStats: 'Usage statistics (local)',
            
            actions: {
              clearCache: 'Clear Cache',
              clearStats: 'Clear Statistics',
              resetAll: 'Reset All'
            }
          },
          
          // Language
          languageSettings: {
            interfaceLanguage: 'Interface Language',
            interfaceLanguageDesc: 'Select CommandBar language',
            languages: {
              es: 'Español',
              en: 'English'
            }
          },
          
          // Buttons
          buttons: {
            exportSettings: 'Export Settings',
            importSettings: 'Import Settings',
            saveChanges: 'Save Changes',
            cancel: 'Cancel',
            confirm: 'Confirm'
          },
          
          // Footer
          footer: {
            version: 'CommandBar Pro v1.2.0',
            changelog: 'Changelog',
            reportBug: 'Report bug',
            viewSource: 'View source code'
          },
          
          // Messages
          messages: {
            settingsLoaded: 'Settings loaded successfully',
            settingsSaved: 'Settings saved successfully',
            cacheCleared: 'Cache cleared successfully',
            statsCleared: 'Statistics cleared successfully',
            settingsReset: 'Settings reset successfully',
            settingsExported: 'Settings exported successfully',
            settingsImported: 'Settings imported successfully',
            invalidFile: 'Error: Invalid settings file',
            themeChanged: 'Theme changed to: {theme}',
            languageChanged: 'Language changed to: {language}',
            
            errors: {
              loadingSettings: 'Error loading settings',
              savingSettings: 'Error saving settings',
              clearingCache: 'Error clearing cache',
              clearingStats: 'Error clearing statistics',
              resettingSettings: 'Error resetting settings',
              importingSettings: 'Error importing settings'
            }
          },
          
          // Confirmations
          confirmations: {
            clearCache: {
              title: 'Clear Cache',
              message: 'Are you sure you want to clear all cache? This will remove saved search results.'
            },
            clearStats: {
              title: 'Clear Statistics',
              message: 'Are you sure you want to clear all usage statistics?'
            },
            resetAll: {
              title: 'Reset All',
              message: 'Are you sure you want to reset all settings? This action cannot be undone.'
            }
          }
        },
        
        // Toasts and notifications
        notifications: {
          success: 'Success',
          error: 'Error',
          warning: 'Warning',
          info: 'Information'
        }
      }
    };
    
    // Cargar idioma guardado
    this.loadLanguage();
  }
  
  async loadLanguage() {
    try {
      const result = await chrome.storage.sync.get(['language']);
      if (result.language && this.translations[result.language]) {
        this.currentLanguage = result.language;
      }
    } catch (error) {
      console.log('Error loading language, using default');
    }
  }
  
  async setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      try {
        await chrome.storage.sync.set({ language: lang });
      } catch (error) {
        console.error('Error saving language:', error);
      }
    }
  }
  
  t(key, replacements = {}) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback a español si no existe la clave en inglés
        value = this.translations['es'];
        for (const fallbackK of keys) {
          if (value && typeof value === 'object' && fallbackK in value) {
            value = value[fallbackK];
          } else {
            return key; // Devolver la clave si no se encuentra
          }
        }
        break;
      }
    }
    
    // Reemplazar variables en el texto
    if (typeof value === 'string') {
      for (const [placeholder, replacement] of Object.entries(replacements)) {
        value = value.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), replacement);
      }
    }
    
    return value;
  }
  
  getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  getAvailableLanguages() {
    return Object.keys(this.translations);
  }
}

// Instancia global
const i18n = new I18n();

// Para uso en otros archivos
if (typeof window !== 'undefined') {
  window.i18n = i18n;
} 