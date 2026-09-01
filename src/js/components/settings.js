// Settings, Privacy & Customization Component
import { store } from '../state.js';
import { CURRENCIES } from '../utils/currency.js';
import { exportFullBackupJSON } from '../utils/exporter.js';

export function renderSettings(container) {
  const state = store.getState();
  const settings = state.settings;

  container.innerHTML = `
    <div class="space-y-4 pb-24 animate-fadeIn">
      
      <!-- Top Title -->
      <div class="pt-2 px-1">
        <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Preferencias</span>
        <h1 class="text-2xl font-extrabold text-slate-100">Configuración</h1>
      </div>

      <!-- User Profile Card -->
      <div class="card-elevated p-4 bg-slate-900/90 border border-slate-800 space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-lg">
            ${(settings.userName || 'U')[0].toUpperCase()}
          </div>
          <div class="flex-1">
            <label class="text-[10px] text-slate-400 font-bold uppercase block">Nombre de Usuario</label>
            <input id="setting-username" type="text" value="${settings.userName || 'Usuario Pro'}" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      <!-- Regional & Currency Settings -->
      <div class="card-elevated p-4 bg-slate-900/90 border border-slate-800 space-y-3">
        <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <i data-lucide="globe" class="w-4 h-4 text-indigo-400"></i> Moneda Principal
        </h3>

        <div>
          <select id="setting-currency" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none">
            ${Object.values(CURRENCIES).map(c => `
              <option value="${c.code}" ${c.code === settings.currency ? 'selected' : ''}>
                ${c.name} (${c.symbol})
              </option>
            `).join('')}
          </select>
          <span class="text-[10px] text-slate-500 mt-1 block">Todos los balances y reportes se calcularán en esta divisa.</span>
        </div>
      </div>

      <!-- Category Management Shortcut -->
      <div class="card-elevated p-4 bg-slate-900/90 border border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <i data-lucide="tag" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-xs font-bold text-slate-200">Categorías de Gastos e Ingresos</h3>
              <span class="text-[10px] text-slate-400">Crea, edita y personaliza a tu gusto (${state.categories.length} categorías)</span>
            </div>
          </div>
          <button id="btn-goto-categories" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1">
            Gestionar <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      <!-- Theme & Appearance -->
      <div class="card-elevated p-4 bg-slate-900/90 border border-slate-800 space-y-3">
        <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <i data-lucide="palette" class="w-4 h-4 text-indigo-400"></i> Apariencia y Seguridad
        </h3>

        <div class="flex items-center justify-between py-2 border-b border-slate-800/80">
          <div>
            <span class="text-xs font-bold text-slate-200 block">Tema Oscuro Fintech</span>
            <span class="text-[10px] text-slate-400">Diseño optimizado para pantallas OLED</span>
          </div>
          <input id="setting-theme-toggle" type="checkbox" ${settings.theme === 'dark' ? 'checked' : ''} class="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700">
        </div>

        <div class="flex items-center justify-between py-2">
          <div>
            <span class="text-xs font-bold text-slate-200 block">Ocultar Saldos por Defecto</span>
            <span class="text-[10px] text-slate-400">Protección de privacidad en lugares públicos</span>
          </div>
          <input id="setting-hide-toggle" type="checkbox" ${settings.hideBalances ? 'checked' : ''} class="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700">
        </div>
      </div>

      <!-- Data Backup & Reset -->
      <div class="card-elevated p-4 bg-slate-900/90 border border-slate-800 space-y-3">
        <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <i data-lucide="hard-drive" class="w-4 h-4 text-indigo-400"></i> Copias de Seguridad & Datos
        </h3>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button id="btn-export-backup" class="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-1.5">
            <i data-lucide="download" class="w-4 h-4 text-emerald-400"></i> Descargar Backup
          </button>
          
          <label for="import-file-input" class="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer">
            <i data-lucide="upload" class="w-4 h-4 text-cyan-400"></i> Restaurar JSON
          </label>
          <input id="import-file-input" type="file" accept=".json" class="hidden" />
        </div>

        <div class="pt-3 border-t border-slate-800 flex flex-col gap-2">
          <button id="btn-reset-sample" class="py-2.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-xs font-bold border border-indigo-500/30 transition">
            🔄 Recargar Datos de Demostración
          </button>
          <button id="btn-wipe-data" class="py-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold border border-rose-500/20 transition">
            ⚠️ Borrar Todos Mis Datos (Reiniciar a Cero)
          </button>
        </div>
      </div>

      <!-- Financial Principles Card -->
      <div class="bg-indigo-950/40 border border-indigo-800/40 rounded-3xl p-4 text-xs text-slate-300 space-y-2">
        <h4 class="font-bold text-indigo-300 flex items-center gap-1.5">
          <i data-lucide="book-open" class="w-4 h-4 text-indigo-400"></i> Principios Financieros Clave
        </h4>
        <p class="text-[11px] leading-relaxed text-slate-400">
          • <strong>Regla 50/30/20:</strong> Mantén tus necesidades bajo control y ahorra al menos el 20% mes a mes.<br/>
          • <strong>Fondo de Emergencia:</strong> Al menos 3 a 6 meses de gastos fijos en cuenta líquida.<br/>
          • <strong>Interés Compuesto:</strong> Empieza a invertir temprano y de forma periódica (DCA).
        </p>
      </div>

    </div>
  `;

  // Attach Listeners
  const inputUser = container.querySelector('#setting-username');
  if (inputUser) {
    inputUser.addEventListener('change', (e) => {
      store.updateSettings({ userName: e.target.value });
    });
  }

  const selectCur = container.querySelector('#setting-currency');
  if (selectCur) {
    selectCur.addEventListener('change', (e) => {
      store.updateSettings({ currency: e.target.value });
      if (window.showToast) window.showToast(`Moneda cambiada a ${e.target.value}`);
    });
  }

  const toggleTheme = container.querySelector('#setting-theme-toggle');
  if (toggleTheme) {
    toggleTheme.addEventListener('change', (e) => {
      const theme = e.target.checked ? 'dark' : 'light';
      store.updateSettings({ theme });
      document.documentElement.setAttribute('data-theme', theme);
    });
  }

  const toggleHide = container.querySelector('#setting-hide-toggle');
  if (toggleHide) {
    toggleHide.addEventListener('change', (e) => {
      store.updateSettings({ hideBalances: e.target.checked });
    });
  }

  // Backup Export
  const btnExport = container.querySelector('#btn-export-backup');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      exportFullBackupJSON(state);
    });
  }

  // Backup Import
  const fileInput = container.querySelector('#import-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const success = store.importJSON(event.target.result);
        if (success) {
          alert('¡Copia de seguridad restaurada con éxito!');
          renderSettings(container);
        } else {
          alert('Error: el archivo JSON no tiene un formato válido.');
        }
      };
      reader.readAsText(file);
    });
  }

  // Reset demo
  const btnReset = container.querySelector('#btn-reset-sample');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('¿Deseas restaurar los datos de demostración? Se sobreescribirán los datos actuales.')) {
        store.resetToSampleData();
        if (window.showToast) window.showToast('Datos de demostración cargados');
        renderSettings(container);
      }
    });
  }

  // Goto categories
  const btnGotoCat = container.querySelector('#btn-goto-categories');
  if (btnGotoCat) {
    btnGotoCat.addEventListener('click', () => {
      if (window.router) window.router.navigate('categories');
    });
  }

  // Wipe data
  const btnWipe = container.querySelector('#btn-wipe-data');
  if (btnWipe) {
    btnWipe.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas eliminar TODOS tus registros financieros? Esta acción no se puede deshacer.')) {
        store.clearAllData();
        if (window.showToast) window.showToast('Todos los datos han sido borrados');
        renderSettings(container);
      }
    });
  }

  if (window.lucide) {
    window.lucide.createIcons({ root: container });
  }
}
