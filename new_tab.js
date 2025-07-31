// JavaScript para la página de nueva pestaña de CommandBar Pro

// Crear partículas flotantes
function createParticles() {
  const container = document.getElementById('particles');
  
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    container.appendChild(particle);
  }
}

// Función para intentar abrir el CommandBar completo
function openFullCommandBar() {
  // Intentar usar la función del CommandBar completo primero
  let attempts = 0;
  const maxAttempts = 15;
  
  function tryOpenCommandBar() {
    attempts++;
    
    // Verificar si showCommandBar está disponible (desde content.js)
    if (typeof showCommandBar === 'function' && typeof i18n !== 'undefined') {
      try {
        showCommandBar();
        return true;
      } catch (error) {
        console.error('Error llamando showCommandBar:', error);
      }
    }
    
    // Si no está disponible y no hemos alcanzado el máximo de intentos
    if (attempts < maxAttempts) {
      setTimeout(tryOpenCommandBar, 200);
    } else {
      // Fallback: usar el CommandBar básico interno
      createCommandBarDirectly();
    }
  }
  
  tryOpenCommandBar();
}

// Función fallback para crear CommandBar básico directamente
function createCommandBarDirectly() {
  // Si ya existe, no crear otro
  if (document.getElementById('commandbar-container')) {
    return;
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
      padding-top: 15vh;
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
                 id="basic-commandbar-input" 
                 placeholder="Escribe comando, búsqueda o URL..." 
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
          <div style="margin-bottom: 12px; font-weight: 600; color: #3b82f6;">⚡ CommandBar en nueva pestaña</div>
          <div style="margin-bottom: 12px; font-weight: 600;">📝 Acciones disponibles:</div>
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
  const input = document.getElementById('basic-commandbar-input');
  if (input) {
    input.focus();
  }
  
  // Manejar eventos básicos
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      commandBar.remove();
      document.removeEventListener('keydown', handleKeyDown);
    } else if (e.key === 'Enter') {
      const query = input.value.trim();
      if (query) {
        handleQuery(query);
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
}

// Manejar consultas del CommandBar básico
function handleQuery(query) {
  
  // Detectar tipo de consulta
  if (query.includes('.') && !query.includes(' ')) {
    // Es una URL - navegar en la misma pestaña (estamos en nuestra new_tab.html)
    const url = query.startsWith('http') ? query : 'https://' + query;
    window.location.href = url;
  } else if (query.startsWith('/')) {
    // Es un comando
    handleCommand(query);
  } else {
    // Es una búsqueda - navegar en la misma pestaña (estamos en nuestra new_tab.html)
    const searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
    window.location.href = searchUrl;
  }
}

// Manejar comandos básicos
function handleCommand(command) {
  const cmd = command.toLowerCase();
  
  switch (cmd) {
    case '/nueva':
    case '/new':
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'create_tab', url: 'chrome://newtab/' });
      }
      break;
    case '/marcadores':
    case '/bookmarks':
      // Navegar en la misma pestaña (estamos en nuestra new_tab.html)
      window.location.href = 'chrome://bookmarks/';
      break;
    case '/historial':
    case '/history':
      // Navegar en la misma pestaña (estamos en nuestra new_tab.html)
      window.location.href = 'chrome://history/';
      break;
    default:
      // Búsqueda del comando - navegar en la misma pestaña
      const searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(command);
      window.location.href = searchUrl;
  }
}

// Event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  
  // Auto-trigger del CommandBar después de un delay para permitir que content.js se cargue
  setTimeout(() => {
    openFullCommandBar();
  }, 1000);
});

// Listener para mensajes desde background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle_commandbar') {
    openFullCommandBar();
  }
  sendResponse({ success: true });
}); 