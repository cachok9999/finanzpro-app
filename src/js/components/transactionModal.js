// Transaction Modal - Comprehensive Detail Entry
import { store } from '../state.js';
import { formatMoney, getNowGMT3String } from '../utils/currency.js';

export class TransactionModal {
  constructor() {
    this.currentType = 'expense'; // expense | income | transfer
    this.selectedCategoryId = null;
    this.selectedAccountId = null;
    this.selectedToAccountId = null;
    this.initDOM();
  }

  initDOM() {
    const backdrop = document.createElement('div');
    backdrop.id = 'tx-modal-backdrop';
    backdrop.className = 'bottom-sheet-backdrop';
    
    const sheet = document.createElement('div');
    sheet.id = 'tx-modal-sheet';
    sheet.className = 'bottom-sheet';

    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);

    this.backdrop = backdrop;
    this.sheet = sheet;

    this.backdrop.addEventListener('click', () => this.close());
  }

  open(type = 'expense') {
    this.currentType = type;
    const state = store.getState();
    
    // Pick sensible default category & account
    const availableCategories = state.categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'));
    this.selectedCategoryId = availableCategories[0]?.id || null;
    this.selectedAccountId = state.accounts[0]?.id || null;
    this.selectedToAccountId = state.accounts[1]?.id || state.accounts[0]?.id || null;

    this.render();
    this.backdrop.classList.add('active');
    this.sheet.classList.add('active');
    
    // Focus amount input
    setTimeout(() => {
      const input = this.sheet.querySelector('#tx-amount-input');
      if (input) input.focus();
    }, 150);
  }

  close() {
    this.backdrop.classList.remove('active');
    this.sheet.classList.remove('active');
  }

  render() {
    const state = store.getState();
    const currency = state.settings.currency;
    const isTransfer = this.currentType === 'transfer';
    const isIncome = this.currentType === 'income';

    const categories = state.categories.filter(c => c.type === (isIncome ? 'income' : 'expense'));
    const nowIso = getNowGMT3String();

    this.sheet.innerHTML = `
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          <button type="button" data-type="expense" class="tx-type-tab px-3 py-1.5 rounded-xl text-xs font-bold transition ${this.currentType === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
            Gasto
          </button>
          <button type="button" data-type="income" class="tx-type-tab px-3 py-1.5 rounded-xl text-xs font-bold transition ${this.currentType === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
            Ingreso
          </button>
          <button type="button" data-type="transfer" class="tx-type-tab px-3 py-1.5 rounded-xl text-xs font-bold transition ${this.currentType === 'transfer' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
            Transferencia
          </button>
        </div>
        <button id="btn-close-modal" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-4 overflow-y-auto max-h-[75vh] space-y-4">
        <!-- Amount Big Display -->
        <div class="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 text-center">
          <span class="text-xs text-slate-400 font-semibold block mb-1">Monto de la Operación</span>
          <div class="flex items-center justify-center gap-2">
            <span class="text-2xl font-bold font-mono text-slate-400">${currency}</span>
            <input id="tx-amount-input" type="number" step="0.01" placeholder="0.00" class="w-48 text-center text-3xl font-extrabold font-mono text-white bg-transparent outline-none border-b-2 border-indigo-500/50 focus:border-indigo-400" />
          </div>
          <!-- Quick Amount Chips -->
          <div class="flex items-center justify-center gap-2 mt-3">
            <button type="button" class="chip-amt px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300 hover:bg-slate-700 active:scale-95" data-add="10">+10</button>
            <button type="button" class="chip-amt px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300 hover:bg-slate-700 active:scale-95" data-add="50">+50</button>
            <button type="button" class="chip-amt px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300 hover:bg-slate-700 active:scale-95" data-add="100">+100</button>
            <button type="button" class="chip-amt px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300 hover:bg-slate-700 active:scale-95" data-add="500">+500</button>
          </div>
        </div>

        <!-- Account / Wallet Selector -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5">
            ${isTransfer ? 'Desde la Cuenta (Origen)' : 'Cuenta / Billetera'}
          </label>
          <select id="tx-account-select" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500">
            ${state.accounts.map(acc => `
              <option value="${acc.id}" ${acc.id === this.selectedAccountId ? 'selected' : ''}>
                ${acc.name} (${formatMoney(acc.balance, currency)})
              </option>
            `).join('')}
          </select>
        </div>

        ${isTransfer ? `
          <!-- Destination Account for Transfers -->
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">Hacia la Cuenta (Destino)</label>
            <select id="tx-to-account-select" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500">
              ${state.accounts.map(acc => `
                <option value="${acc.id}" ${acc.id === this.selectedToAccountId ? 'selected' : ''}>
                  ${acc.name} (${formatMoney(acc.balance, currency)})
                </option>
              `).join('')}
            </select>
          </div>
        ` : `
          <!-- Category Grid Selector -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-slate-300">Categoría Financiera</label>
              <button id="btn-modal-add-cat" type="button" class="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i> + Nueva Categoría
              </button>
            </div>
            <div class="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950/60 rounded-2xl border border-slate-800">
              ${categories.map(cat => `
                <div data-cat-id="${cat.id}" class="cat-pill cursor-pointer p-2 rounded-xl flex flex-col items-center justify-center text-center transition border ${cat.id === this.selectedCategoryId ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200'}">
                  <div class="w-7 h-7 rounded-lg flex items-center justify-center mb-1" style="background: ${cat.color}25; color: ${cat.color}">
                    <i data-lucide="${cat.icon || 'tag'}" class="w-4 h-4"></i>
                  </div>
                  <span class="text-[10px] font-semibold line-clamp-1">${cat.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `}

        <!-- Merchant / Beneficiary -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5">
            ${isIncome ? 'Fuente / Emisor' : (isTransfer ? 'Concepto de Transferencia' : 'Comercio / Beneficiario')}
          </label>
          <input id="tx-merchant-input" type="text" placeholder="Ej: Supermercado, Salario, Netflix, Gasolinera..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500" />
        </div>

        <!-- Date & Time -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5">Fecha y Hora</label>
          <input id="tx-date-input" type="datetime-local" value="${nowIso}" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500" />
        </div>

        <!-- Tags & Notes -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">Etiquetas (Separar con coma)</label>
            <input id="tx-tags-input" type="text" placeholder="ej: vacaciones, trabajo" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">Notas adicionales</label>
            <input id="tx-note-input" type="text" placeholder="Detalles de la compra..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500" />
          </div>
        </div>

        <!-- Recurring Switch -->
        <div class="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-slate-800">
          <div class="flex items-center gap-2">
            <i data-lucide="repeat" class="w-4 h-4 text-indigo-400"></i>
            <div>
              <span class="text-xs font-bold text-slate-200 block">Movimiento Fijo / Recurrente</span>
              <span class="text-[10px] text-slate-400">Se proyectará automáticamente en el flujo de caja</span>
            </div>
          </div>
          <input id="tx-recurring-toggle" type="checkbox" class="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500">
        </div>

        <!-- Submit Button -->
        <button id="btn-save-tx" type="button" class="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition flex items-center justify-center gap-2">
          <i data-lucide="check" class="w-4 h-4"></i> Guardar Movimiento
        </button>
      </div>
    `;

    // Attach internal events
    this.sheet.querySelector('#btn-close-modal').addEventListener('click', () => this.close());

    // Type Tabs
    this.sheet.querySelectorAll('.tx-type-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const newType = e.currentTarget.dataset.type;
        this.open(newType);
      });
    });

    // Quick chip additions
    this.sheet.querySelectorAll('.chip-amt').forEach(chip => {
      chip.addEventListener('click', () => {
        const input = this.sheet.querySelector('#tx-amount-input');
        const current = parseFloat(input.value) || 0;
        const add = parseFloat(chip.dataset.add) || 0;
        input.value = (current + add).toFixed(2);
      });
    });

    // Category selection
    this.sheet.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.sheet.querySelectorAll('.cat-pill').forEach(p => {
          p.classList.remove('bg-indigo-600/30', 'border-indigo-500', 'text-white');
          p.classList.add('bg-slate-900/80', 'border-slate-800/80', 'text-slate-400');
        });
        pill.classList.remove('bg-slate-900/80', 'border-slate-800/80', 'text-slate-400');
        pill.classList.add('bg-indigo-600/30', 'border-indigo-500', 'text-white');
        this.selectedCategoryId = pill.dataset.catId;
      });
    });

    // Add category shortcut
    const btnAddCat = this.sheet.querySelector('#btn-modal-add-cat');
    if (btnAddCat) {
      btnAddCat.addEventListener('click', () => {
        this.close();
        if (window.router) window.router.navigate('categories');
      });
    }

    // Save action
    this.sheet.querySelector('#btn-save-tx').addEventListener('click', () => this.saveTransaction());

    if (window.lucide) {
      window.lucide.createIcons({ root: this.sheet });
    }
  }

  saveTransaction() {
    const amountInput = this.sheet.querySelector('#tx-amount-input');
    const amount = parseFloat(amountInput.value);

    if (!amount || isNaN(amount) || amount <= 0) {
      amountInput.focus();
      amountInput.classList.add('border-rose-500');
      alert('Por favor, ingresa un monto válido mayor a 0.');
      return;
    }

    const accountSelect = this.sheet.querySelector('#tx-account-select');
    const accountId = accountSelect.value;
    const toAccountSelect = this.sheet.querySelector('#tx-to-account-select');
    const toAccountId = toAccountSelect ? toAccountSelect.value : null;
    const merchant = this.sheet.querySelector('#tx-merchant-input').value.trim();
    const date = this.sheet.querySelector('#tx-date-input').value;
    const note = this.sheet.querySelector('#tx-note-input').value.trim();
    const tagsRaw = this.sheet.querySelector('#tx-tags-input').value;
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
    const isRecurring = this.sheet.querySelector('#tx-recurring-toggle').checked;

    store.addTransaction({
      type: this.currentType,
      amount,
      accountId,
      toAccountId,
      categoryId: this.currentType === 'transfer' ? null : this.selectedCategoryId,
      merchant,
      date: new Date(date).toISOString(),
      note,
      tags,
      isRecurring
    });

    this.close();
    
    // Quick notification toast
    if (window.showToast) {
      window.showToast(`✅ Movimiento de ${formatMoney(amount, store.getState().settings.currency)} guardado con éxito.`);
    }
  }
}
