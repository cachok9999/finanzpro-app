// Budgets Component - Zero-Based Budget Control
import { store } from '../state.js';
import { FinancialEngine } from '../financialEngine.js';
import { formatMoney, formatCompactNumber } from '../utils/currency.js';

export function renderBudgets(container) {
  const state = store.getState();
  const currency = state.settings.currency;
  const hideBalances = state.settings.hideBalances;
  const mask = (val) => hideBalances ? '••••••' : val;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyFlow = FinancialEngine.calculateMonthlyFlow(state.transactions, currentMonth, currentYear);

  const categoryMap = new Map(state.categories.map(c => [c.id, c]));

  // Calculate total budget allocated
  const totalBudgeted = state.budgets.reduce((sum, b) => sum + Number(b.limit || 0), 0);
  const totalSpentInBudgets = state.budgets.reduce((sum, b) => {
    return sum + (monthlyFlow.categorySpending[b.categoryId] || 0);
  }, 0);

  const budgetPct = totalBudgeted > 0 ? ((totalSpentInBudgets / totalBudgeted) * 100).toFixed(1) : 0;

  container.innerHTML = `
    <div class="space-y-4 pb-24 animate-fadeIn">
      
      <!-- Top Header -->
      <div class="flex items-center justify-between pt-2 px-1">
        <div>
          <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Planificación de Gastos</span>
          <h1 class="text-2xl font-extrabold text-slate-100">Presupuestos</h1>
        </div>
        <button id="btn-add-budget" class="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95">
          <i data-lucide="plus" class="w-4 h-4"></i> Crear Límite
        </button>
      </div>

      <!-- Global Budget Overview Card -->
      <div class="gradient-card-dark rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div class="flex items-center justify-between text-xs text-slate-300 mb-2">
          <span class="font-bold flex items-center gap-1.5 uppercase tracking-wide">
            <i data-lucide="pie-chart" class="w-4 h-4 text-indigo-400"></i> Presupuesto Mensual Total
          </span>
          <span class="font-mono font-bold ${budgetPct > 100 ? 'text-rose-400' : 'text-emerald-400'}">${budgetPct}% gastado</span>
        </div>

        <div class="flex items-baseline justify-between my-2">
          <div class="text-2xl font-extrabold text-white num-mono">
            ${mask(formatMoney(totalSpentInBudgets, currency))}
          </div>
          <div class="text-xs font-medium text-slate-400">
            de ${mask(formatMoney(totalBudgeted, currency))} asignados
          </div>
        </div>

        <!-- Master Progress Bar -->
        <div class="w-full h-3 bg-slate-800 rounded-full overflow-hidden my-3">
          <div class="h-full rounded-full transition-all duration-700 ${budgetPct > 95 ? 'bg-rose-500' : (budgetPct > 75 ? 'bg-amber-500' : 'bg-indigo-500')}" style="width: ${Math.min(100, budgetPct)}%"></div>
        </div>

        <div class="flex justify-between text-[11px] text-slate-400 pt-1">
          <span>Disponible Restante: <strong class="text-emerald-400 num-mono">${mask(formatMoney(Math.max(0, totalBudgeted - totalSpentInBudgets), currency))}</strong></span>
          <span>Ingreso Total: <strong class="text-slate-200 num-mono">${mask(formatMoney(monthlyFlow.totalIncome, currency))}</strong></span>
        </div>
      </div>

      <!-- Category Budgets List -->
      <div class="space-y-3 pt-1">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Límites por Categoría</h3>

        ${state.budgets.length === 0 ? `
          <div class="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-500 text-xs">
            No tienes presupuestos configurados. ¡Crea uno para controlar tus gastos en comida, ocio, transporte, etc.!
          </div>
        ` : state.budgets.map(b => {
          const cat = categoryMap.get(b.categoryId) || { name: 'General', color: '#6366F1', icon: 'tag' };
          const spent = monthlyFlow.categorySpending[b.categoryId] || 0;
          const limit = Number(b.limit) || 1;
          const pct = ((spent / limit) * 100).toFixed(0);
          const remaining = limit - spent;
          const isOver = spent > limit;

          let statusColor = '#10B981'; // Emerald
          if (pct >= 100) statusColor = '#F43F5E'; // Red
          else if (pct >= 80) statusColor = '#F59E0B'; // Amber

          return `
            <div class="card-elevated p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style="background: ${cat.color}25; color: ${cat.color}">
                    <i data-lucide="${cat.icon || 'tag'}" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-slate-200">${cat.name}</h4>
                    <span class="text-[10px] text-slate-400 font-medium">Límite mensual: ${mask(formatMoney(limit, currency))}</span>
                  </div>
                </div>

                <div class="text-right flex items-center gap-2">
                  <div>
                    <span class="text-xs font-extrabold num-mono block" style="color: ${statusColor}">
                      ${mask(formatMoney(spent, currency))}
                    </span>
                    <span class="text-[10px] font-bold ${isOver ? 'text-rose-400' : 'text-slate-400'}">
                      ${isOver ? `Excedido por ${mask(formatMoney(Math.abs(remaining), currency))}` : `Restan ${mask(formatMoney(remaining, currency))}`}
                    </span>
                  </div>
                  <button data-delete-budget="${b.id}" class="btn-del-budget p-1 text-slate-500 hover:text-rose-400 rounded-lg">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-3">
                <div class="h-full rounded-full transition-all duration-700" style="width: ${Math.min(100, pct)}%; background: ${statusColor}"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>

    <!-- Modal Form for New Budget -->
    <div id="modal-new-budget" class="bottom-sheet-backdrop">
      <div class="bottom-sheet p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-extrabold text-white flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-5 h-5 text-indigo-400"></i> Establecer Presupuesto
          </h3>
          <button id="btn-close-budget-modal" class="p-1 text-slate-400 hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-300 mb-1">Categoría a Presupuestar</label>
            <select id="new-budget-cat" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none">
              ${state.categories.filter(c => c.type === 'expense').map(c => `
                <option value="${c.id}">${c.name}</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-300 mb-1">Límite Mensual Máximo</label>
            <div class="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1">
              <span class="font-bold text-slate-400 font-mono">${currency}</span>
              <input id="new-budget-limit" type="number" step="10" placeholder="Ej: 500" class="w-full bg-transparent p-2 text-white outline-none font-mono text-sm font-bold" />
            </div>
          </div>

          <button id="btn-save-new-budget" type="button" class="w-full py-3.5 mt-2 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition">
            Guardar Presupuesto
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach Handlers
  const modal = container.querySelector('#modal-new-budget');
  const sheet = modal.querySelector('.bottom-sheet');
  const btnAdd = container.querySelector('#btn-add-budget');
  const btnClose = container.querySelector('#btn-close-budget-modal');

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

  const btnSave = container.querySelector('#btn-save-new-budget');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const catId = container.querySelector('#new-budget-cat').value;
      const limit = parseFloat(container.querySelector('#new-budget-limit').value);

      if (!limit || limit <= 0) {
        alert('Por favor ingresa un monto de límite válido mayor a 0.');
        return;
      }

      store.setBudget(catId, limit);
      closeModal();
      renderBudgets(container);
    });
  }

  // Delete budget
  container.querySelectorAll('.btn-del-budget').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.deleteBudget;
      if (confirm('¿Eliminar este presupuesto?')) {
        store.deleteBudget(id);
        renderBudgets(container);
      }
    });
  });

  if (window.lucide) {
    window.lucide.createIcons({ root: container });
  }
}
