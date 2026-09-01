// Accounts & Cards Management Component
import { store } from '../state.js';
import { formatMoney, formatCompactNumber } from '../utils/currency.js';

export function renderAccounts(container) {
  const state = store.getState();
  const currency = state.settings.currency;
  const hideBalances = state.settings.hideBalances;
  const mask = (val) => hideBalances ? '••••••' : val;

  const assets = state.accounts.filter(a => a.type !== 'credit' && a.balance >= 0);
  const liabilities = state.accounts.filter(a => a.type === 'credit' || a.balance < 0);

  const totalAssets = assets.reduce((sum, a) => sum + Number(a.balance), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + Math.abs(Number(a.balance)), 0);

  container.innerHTML = `
    <div class="space-y-4 pb-24 animate-fadeIn">
      
      <!-- Top Title & Add Account Button -->
      <div class="flex items-center justify-between pt-2 px-1">
        <div>
          <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Gestión Patrimonial</span>
          <h1 class="text-2xl font-extrabold text-slate-100">Cuentas y Tarjetas</h1>
        </div>
        <button id="btn-add-account" class="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95">
          <i data-lucide="plus" class="w-4 h-4"></i> Nueva Cuenta
        </button>
      </div>

      <!-- Assets vs Liabilities Summary Card -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span class="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Activos Líquidos
          </span>
          <div class="text-xl font-extrabold text-emerald-400 num-mono mt-1">
            ${mask(formatMoney(totalAssets, currency))}
          </div>
          <span class="text-[10px] text-slate-500">${assets.length} cuentas y billeteras</span>
        </div>

        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span class="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Pasivos / Tarjetas
          </span>
          <div class="text-xl font-extrabold text-rose-400 num-mono mt-1">
            ${mask(formatMoney(totalLiabilities, currency))}
          </div>
          <span class="text-[10px] text-slate-500">${liabilities.length} tarjetas de crédito</span>
        </div>
      </div>

      <!-- Accounts Grid / Visual Cards -->
      <div class="space-y-3 pt-1">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Tus Billeteras & Cuentas</h3>

        ${state.accounts.map(acc => {
          const isCredit = acc.type === 'credit';
          const cardGradient = isCredit ? 'gradient-card-dark border-rose-500/30' : 
            (acc.type === 'savings' ? 'gradient-card-emerald' : 
            (acc.type === 'investment' ? 'gradient-card-purple' : 'gradient-card-dark'));

          return `
            <div class="${cardGradient} rounded-3xl p-5 shadow-lg relative overflow-hidden transition hover:border-indigo-500/50">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                    <i data-lucide="${acc.icon || 'wallet'}" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <h4 class="text-sm font-extrabold text-white">${acc.name}</h4>
                    <span class="text-[11px] text-slate-300 font-medium uppercase">${acc.type}</span>
                  </div>
                </div>

                <button data-delete-acc="${acc.id}" class="btn-delete-acc p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/10 transition">
                  <i data-lucide="trash" class="w-4 h-4"></i>
                </button>
              </div>

              <!-- Balance Display -->
              <div>
                <span class="text-[11px] text-slate-300 font-medium">${isCredit ? 'Deuda Acumulada Actual' : 'Saldo Disponible'}</span>
                <div class="text-2xl font-black font-mono tracking-tight text-white mt-0.5">
                  ${isCredit ? `-${mask(formatMoney(Math.abs(acc.balance), currency))}` : mask(formatMoney(acc.balance, currency))}
                </div>
              </div>

              ${isCredit ? `
                <!-- Credit Limit Bar -->
                <div class="mt-4 pt-3 border-t border-white/10">
                  <div class="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Límite de Crédito: ${mask(formatMoney(acc.creditLimit || 3000, currency))}</span>
                    <span>Corte día ${acc.cutoffDay || 15}</span>
                  </div>
                  <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-rose-500 rounded-full" style="width: ${Math.min(100, (Math.abs(acc.balance) / (acc.creditLimit || 3000)) * 100)}%"></div>
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

    </div>

    <!-- Modal Form for New Account -->
    <div id="modal-new-account" class="bottom-sheet-backdrop">
      <div class="bottom-sheet p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-extrabold text-white flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-5 h-5 text-indigo-400"></i> Registrar Nueva Cuenta
          </h3>
          <button id="btn-close-acc-modal" class="p-1 text-slate-400 hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-300 mb-1">Nombre de la Cuenta o Banco</label>
            <input id="new-acc-name" type="text" placeholder="Ej: Cuenta Sueldo Santander, Ahorros Nu..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-500" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-300 mb-1">Tipo de Cuenta</label>
              <select id="new-acc-type" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none">
                <option value="checking">Cuenta Corriente / Débito</option>
                <option value="savings">Cuenta de Ahorros</option>
                <option value="credit">Tarjeta de Crédito</option>
                <option value="investment">Fondo de Inversión / ETFs</option>
                <option value="cash">Efectivo</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Saldo Inicial</label>
              <input id="new-acc-balance" type="number" step="0.01" placeholder="0.00" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
            </div>
          </div>

          <button id="btn-save-new-acc" type="button" class="w-full py-3.5 mt-2 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition">
            Guardar Cuenta
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach Event Handlers
  const modal = container.querySelector('#modal-new-account');
  const sheet = modal.querySelector('.bottom-sheet');
  const btnAdd = container.querySelector('#btn-add-account');
  const btnClose = container.querySelector('#btn-close-acc-modal');

  if (btnAdd && modal) {
    btnAdd.addEventListener('click', () => {
      modal.classList.add('active');
      sheet.classList.add('active');
    });
  }

  const closeModal = () => {
    modal.classList.remove('active');
    sheet.classList.remove('active');
  };

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Save new account
  const btnSave = container.querySelector('#btn-save-new-acc');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const name = container.querySelector('#new-acc-name').value.trim();
      const type = container.querySelector('#new-acc-type').value;
      const balance = parseFloat(container.querySelector('#new-acc-balance').value) || 0;

      if (!name) {
        alert('Por favor ingresa un nombre para la cuenta.');
        return;
      }

      store.addAccount({
        name,
        type,
        balance: type === 'credit' ? -Math.abs(balance) : balance,
        icon: type === 'credit' ? 'credit-card' : (type === 'savings' ? 'shield' : (type === 'investment' ? 'trending-up' : (type === 'cash' ? 'banknote' : 'building-2')))
      });

      closeModal();
      renderAccounts(container);
    });
  }

  // Delete account
  container.querySelectorAll('.btn-delete-acc').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.deleteAcc;
      if (confirm('¿Eliminar esta cuenta? Sus transacciones no se borrarán pero se desvincularán.')) {
        store.deleteAccount(id);
        renderAccounts(container);
      }
    });
  });

  if (window.lucide) {
    window.lucide.createIcons({ root: container });
  }
}
