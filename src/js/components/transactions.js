// Transactions History & Ledger Component
import { store } from '../state.js';
import { formatMoney, formatDate } from '../utils/currency.js';
import { exportToCSV } from '../utils/exporter.js';

let filterType = 'all'; // all | expense | income | transfer
let filterCategory = 'all';
let filterAccount = 'all';
let searchQuery = '';

export function renderTransactions(container) {
  const state = store.getState();
  const currency = state.settings.currency;
  const hideBalances = state.settings.hideBalances;
  const mask = (val) => hideBalances ? '••••••' : val;

  const categoryMap = new Map(state.categories.map(c => [c.id, c]));
  const accountMap = new Map(state.accounts.map(a => [a.id, a]));

  // Filter logic
  let filtered = state.transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.categoryId !== filterCategory) return false;
    if (filterAccount !== 'all' && t.accountId !== filterAccount && t.toAccountId !== filterAccount) return false;
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const cat = categoryMap.get(t.categoryId);
      const acc = accountMap.get(t.accountId);
      const matchMerchant = (t.merchant || '').toLowerCase().includes(q);
      const matchNote = (t.note || '').toLowerCase().includes(q);
      const matchCategory = cat && cat.name.toLowerCase().includes(q);
      const matchAccount = acc && acc.name.toLowerCase().includes(q);
      const matchTags = (t.tags || []).some(tag => tag.toLowerCase().includes(q));
      return matchMerchant || matchNote || matchCategory || matchAccount || matchTags;
    }
    return true;
  });

  // Calculate filtered totals
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);

  container.innerHTML = `
    <div class="space-y-4 pb-24 animate-fadeIn">
      
      <!-- Top Title & Export Button -->
      <div class="flex items-center justify-between pt-2 px-1">
        <div>
          <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Historial Financiero</span>
          <h1 class="text-2xl font-extrabold text-slate-100">Libro Diario</h1>
        </div>
        <button id="btn-export-csv" class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold border border-slate-700 transition">
          <i data-lucide="download" class="w-4 h-4 text-emerald-400"></i> Exportar CSV
        </button>
      </div>

      <!-- Search Box -->
      <div class="relative">
        <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400"></i>
        <input id="tx-search-input" type="text" value="${searchQuery}" placeholder="Buscar por comercio, categoría, etiqueta o nota..." class="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition" />
      </div>

      <!-- Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button data-filter="all" class="filter-type-btn shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${filterType === 'all' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}">
          Todos (${filtered.length})
        </button>
        <button data-filter="expense" class="filter-type-btn shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${filterType === 'expense' ? 'bg-rose-500 border-rose-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}">
          Gastos
        </button>
        <button data-filter="income" class="filter-type-btn shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${filterType === 'income' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}">
          Ingresos
        </button>
        <button data-filter="transfer" class="filter-type-btn shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${filterType === 'transfer' ? 'bg-cyan-500 border-cyan-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}">
          Transferencias
        </button>
      </div>

      <!-- Filter Summary Bar -->
      <div class="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 text-xs">
        <div class="flex items-center gap-3">
          <span class="text-slate-400">Gastos: <strong class="text-rose-400 num-mono font-bold">${mask(formatMoney(totalExpense, currency))}</strong></span>
          <span class="text-slate-400">Ingresos: <strong class="text-emerald-400 num-mono font-bold">${mask(formatMoney(totalIncome, currency))}</strong></span>
        </div>
      </div>

      <!-- Transactions List -->
      <div class="space-y-2.5">
        ${filtered.length === 0 ? `
          <div class="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-500 text-xs space-y-2">
            <i data-lucide="inbox" class="w-10 h-10 mx-auto text-slate-600"></i>
            <p>No se encontraron transacciones con los filtros seleccionados.</p>
          </div>
        ` : filtered.map(tx => {
          const cat = categoryMap.get(tx.categoryId) || { name: 'Transferencia / General', color: '#06B6D4', icon: 'arrow-left-right' };
          const acc = accountMap.get(tx.accountId) || { name: 'Cuenta Principal' };
          const toAcc = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;
          const isIncome = tx.type === 'income';
          const isTransfer = tx.type === 'transfer';

          return `
            <div class="card-elevated p-3.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between relative group">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0" style="background: ${cat.color}25; color: ${cat.color}">
                  <i data-lucide="${cat.icon || 'tag'}" class="w-5 h-5"></i>
                </div>
                <div>
                  <div class="flex items-center gap-1.5">
                    <h4 class="text-xs font-bold text-slate-100 line-clamp-1">${tx.merchant || cat.name}</h4>
                    ${tx.isRecurring ? `<span class="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 text-[9px] font-bold rounded">Recurrente</span>` : ''}
                  </div>
                  <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>${formatDate(tx.date, 'medium')}</span>
                    <span>•</span>
                    <span>${isTransfer ? `${acc.name} → ${toAcc?.name || 'Destino'}` : acc.name}</span>
                  </div>
                  ${tx.note ? `<p class="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">"${tx.note}"</p>` : ''}
                  ${(tx.tags && tx.tags.length > 0) ? `
                    <div class="flex items-center gap-1 mt-1">
                      ${tx.tags.map(t => `<span class="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md font-mono">#${t}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <div class="text-right">
                  <span class="text-xs font-extrabold num-mono block ${isIncome ? 'text-emerald-400' : (isTransfer ? 'text-cyan-400' : 'text-rose-400')}">
                    ${isIncome ? '+' : (isTransfer ? '↔' : '-')}${mask(formatMoney(tx.amount, currency))}
                  </span>
                  <span class="text-[10px] text-slate-500 uppercase">${cat.name}</span>
                </div>
                <button data-delete-id="${tx.id}" class="btn-delete-tx p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition" title="Eliminar">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;

  // Attach search
  const searchInput = container.querySelector('#tx-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTransactions(container);
    });
  }

  // Filter Buttons
  container.querySelectorAll('.filter-type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterType = e.currentTarget.dataset.filter;
      renderTransactions(container);
    });
  });

  // Delete Action
  container.querySelectorAll('.btn-delete-tx').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.deleteId;
      if (confirm('¿Deseas eliminar esta transacción? Los saldos de tus cuentas se revertirán automáticamente.')) {
        store.deleteTransaction(id);
      }
    });
  });

  // Export CSV
  const btnExport = container.querySelector('#btn-export-csv');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      exportToCSV(state.transactions, state.categories, state.accounts);
    });
  }

  if (window.lucide) {
    window.lucide.createIcons({ root: container });
  }
}
