// Savings Goals and Vaults Component (Metas Financieras & Alcancías)
import { store } from '../state.js';
import { formatMoney, formatDate } from '../utils/currency.js';

export function renderGoals(container) {
  const state = store.getState();
  const currency = state.settings.currency;
  const hideBalances = state.settings.hideBalances;
  const mask = (val) => hideBalances ? '••••••' : val;

  const totalSaved = state.goals.reduce((sum, g) => sum + Number(g.currentAmount || 0), 0);
  const totalTarget = state.goals.reduce((sum, g) => sum + Number(g.targetAmount || 0), 0);
  const overallPct = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0;

  container.innerHTML = `
    <div class="space-y-4 pb-24 animate-fadeIn">
      
      <!-- Top Title -->
      <div class="flex items-center justify-between pt-2 px-1">
        <div>
          <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Ahorro con Propósito</span>
          <h1 class="text-2xl font-extrabold text-slate-100">Metas Financieras</h1>
        </div>
        <button id="btn-add-goal" class="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition active:scale-95">
          <i data-lucide="plus" class="w-4 h-4"></i> Nueva Meta
        </button>
      </div>

      <!-- Master Progress Overview -->
      <div class="gradient-card-emerald rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div class="flex items-center justify-between text-xs text-emerald-200 mb-2">
          <span class="font-bold flex items-center gap-1.5 uppercase tracking-wide">
            <i data-lucide="piggy-bank" class="w-4 h-4 text-emerald-300"></i> Progreso Acumulado
          </span>
          <span class="font-mono font-bold">${overallPct}% completado</span>
        </div>

        <div class="text-2xl font-black text-white num-mono my-2">
          ${mask(formatMoney(totalSaved, currency))}
          <span class="text-xs font-normal text-emerald-200/80">de ${mask(formatMoney(totalTarget, currency))} objetivo</span>
        </div>

        <!-- Master Progress Bar -->
        <div class="w-full h-2.5 bg-emerald-950/60 rounded-full overflow-hidden my-3 border border-emerald-500/20">
          <div class="h-full bg-emerald-400 rounded-full transition-all duration-700" style="width: ${Math.min(100, overallPct)}%"></div>
        </div>

        <div class="text-[11px] text-emerald-200 flex items-center justify-between">
          <span>${state.goals.length} alcancías activas</span>
          <span>Faltan: ${mask(formatMoney(Math.max(0, totalTarget - totalSaved), currency))}</span>
        </div>
      </div>

      <!-- Goals List -->
      <div class="space-y-3 pt-1">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Tus Objetivos & Alcancías</h3>

        ${state.goals.length === 0 ? `
          <div class="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-500 text-xs">
            No tienes metas creadas. ¡Crea una meta para tu fondo de emergencia, viaje o inversión!
          </div>
        ` : state.goals.map(g => {
          const current = Number(g.currentAmount) || 0;
          const target = Number(g.targetAmount) || 1;
          const pct = Math.min(100, ((current / target) * 100)).toFixed(0);
          const remaining = Math.max(0, target - current);

          return `
            <div class="card-elevated p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style="background: ${g.color || '#10B981'}25; color: ${g.color || '#10B981'}">
                    <i data-lucide="${g.icon || 'piggy-bank'}" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <h4 class="text-xs font-extrabold text-slate-100">${g.name}</h4>
                    <span class="text-[11px] text-slate-400 font-medium">
                      Meta: ${mask(formatMoney(target, currency))} ${g.deadline ? `• Fecha: ${g.deadline}` : ''}
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button data-contribute-goal="${g.id}" class="btn-contribute px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold border border-emerald-500/30 transition active:scale-95 flex items-center gap-1">
                    <i data-lucide="plus" class="w-3.5 h-3.5"></i> Aportar
                  </button>
                  <button data-delete-goal="${g.id}" class="btn-del-goal p-1.5 text-slate-500 hover:text-rose-400 rounded-lg">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <!-- Progress & Numbers -->
              <div class="flex justify-between text-xs font-semibold mb-1.5">
                <span class="text-emerald-400 font-mono">${mask(formatMoney(current, currency))} (${pct}%)</span>
                <span class="text-slate-400 font-mono text-[11px]">Resta: ${mask(formatMoney(remaining, currency))}</span>
              </div>

              <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700" style="width: ${pct}%; background: ${g.color || '#10B981'}"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>

    <!-- Modal Form for New Goal -->
    <div id="modal-new-goal" class="bottom-sheet-backdrop">
      <div class="bottom-sheet p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-extrabold text-white flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-5 h-5 text-emerald-400"></i> Crear Nueva Meta de Ahorro
          </h3>
          <button id="btn-close-goal-modal" class="p-1 text-slate-400 hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-300 mb-1">Nombre del Objetivo</label>
            <input id="new-goal-name" type="text" placeholder="Ej: Fondo de Emergencia, Viaje a Brasil, Coche..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-300 mb-1">Monto Objetivo</label>
              <input id="new-goal-target" type="number" step="50" placeholder="Ej: 5000" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Ahorro Inicial (Opcional)</label>
              <input id="new-goal-current" type="number" step="50" placeholder="0.00" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-300 mb-1">Fecha Límite Deseada</label>
            <input id="new-goal-deadline" type="date" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
          </div>

          <button id="btn-save-new-goal" type="button" class="w-full py-3.5 mt-2 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 active:scale-95 transition">
            Crear Meta
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form for Contributing to Goal -->
    <div id="modal-contribute-goal" class="bottom-sheet-backdrop">
      <div class="bottom-sheet p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-extrabold text-white flex items-center gap-2">
            <i data-lucide="coins" class="w-5 h-5 text-emerald-400"></i> Aportar a Alcancía
          </h3>
          <button id="btn-close-contribute-modal" class="p-1 text-slate-400 hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <input type="hidden" id="contribute-target-id" />

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-300 mb-1">Monto a Depositar</label>
            <div class="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1">
              <span class="font-bold text-slate-400 font-mono">${currency}</span>
              <input id="contribute-amount" type="number" step="10" placeholder="0.00" class="w-full bg-transparent p-2 text-white outline-none font-mono text-sm font-bold" />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-300 mb-1">Debitar de la Cuenta</label>
            <select id="contribute-from-account" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none">
              ${state.accounts.filter(a => a.type !== 'credit').map(a => `
                <option value="${a.id}">${a.name} (${formatMoney(a.balance, currency)})</option>
              `).join('')}
            </select>
          </div>

          <button id="btn-save-contribution" type="button" class="w-full py-3.5 mt-2 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 active:scale-95 transition">
            Confirmar Depósito
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach New Goal Modal
  const modal = container.querySelector('#modal-new-goal');
  const sheet = modal.querySelector('.bottom-sheet');
  const btnAdd = container.querySelector('#btn-add-goal');
  const btnClose = container.querySelector('#btn-close-goal-modal');

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

  // Save new goal
  const btnSave = container.querySelector('#btn-save-new-goal');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const name = container.querySelector('#new-goal-name').value.trim();
      const target = parseFloat(container.querySelector('#new-goal-target').value);
      const current = parseFloat(container.querySelector('#new-goal-current').value) || 0;
      const deadline = container.querySelector('#new-goal-deadline').value;

      if (!name || !target || target <= 0) {
        alert('Por favor ingresa un nombre y un monto objetivo válido.');
        return;
      }

      store.addGoal({
        name,
        targetAmount: target,
        currentAmount: current,
        deadline,
        color: '#10B981',
        icon: 'piggy-bank'
      });

      closeModal();
      renderGoals(container);
    });
  }

  // Contribute Modal Handlers
  const contribModal = container.querySelector('#modal-contribute-goal');
  const contribSheet = contribModal.querySelector('.bottom-sheet');
  const btnCloseContrib = container.querySelector('#btn-close-contribute-modal');

  const closeContribModal = () => {
    contribModal.classList.remove('active');
    contribSheet.classList.remove('active');
  };

  if (btnCloseContrib) btnCloseContrib.addEventListener('click', closeContribModal);
  if (contribModal) {
    contribModal.addEventListener('click', (e) => {
      if (e.target === contribModal) closeContribModal();
    });
  }

  container.querySelectorAll('.btn-contribute').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const goalId = e.currentTarget.dataset.contributeGoal;
      container.querySelector('#contribute-target-id').value = goalId;
      contribModal.classList.add('active');
      contribSheet.classList.add('active');
      setTimeout(() => {
        container.querySelector('#contribute-amount').focus();
      }, 100);
    });
  });

  const btnConfirmContrib = container.querySelector('#btn-save-contribution');
  if (btnConfirmContrib) {
    btnConfirmContrib.addEventListener('click', () => {
      const goalId = container.querySelector('#contribute-target-id').value;
      const amount = parseFloat(container.querySelector('#contribute-amount').value);
      const fromAcc = container.querySelector('#contribute-from-account').value;

      if (!amount || amount <= 0) {
        alert('Por favor ingresa un monto válido a aportar.');
        return;
      }

      store.contributeToGoal(goalId, amount, fromAcc);
      closeContribModal();
      renderGoals(container);
    });
  }

  // Delete goal
  container.querySelectorAll('.btn-del-goal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.deleteGoal;
      if (confirm('¿Eliminar esta meta de ahorro?')) {
        store.deleteGoal(id);
        renderGoals(container);
      }
    });
  });

  if (window.lucide) {
    window.lucide.createIcons({ root: container });
  }
}
