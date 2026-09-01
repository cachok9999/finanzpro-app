// Debts Component - Smart Payoff Simulator (Snowball vs Avalanche)
import { store } from '../state.js';
import { FinancialEngine } from '../financialEngine.js';
import { formatMoney } from '../utils/currency.js';

let selectedMethod = 'avalanche'; // avalanche | snowball
let extraPayment = 100;

export function renderDebts(container) {
  const state = store.getState();
  const currency = state.settings.currency;
  const hideBalances = state.settings.hideBalances;
  const mask = (val) => hideBalances ? '••••••' : val;

  const totalDebt = state.debts.reduce((sum, d) => sum + Number(d.totalAmount || 0), 0);
  const totalMinPayment = state.debts.reduce((sum, d) => sum + Number(d.minimumPayment || 0), 0);

  // Run simulation
  const payoffSimulation = FinancialEngine.simulateDebtPayoff(state.debts, extraPayment);
  const currentPlan = selectedMethod === 'avalanche' ? payoffSimulation.avalanche : payoffSimulation.snowball;

  container.innerHTML = `
    <div class="space-y-4 pb-24 animate-fadeIn">
      
      <!-- Top Title -->
      <div class="flex items-center justify-between pt-2 px-1">
        <div>
          <span class="text-xs font-semibold text-rose-400 uppercase tracking-wider">Libertad Financiera</span>
          <h1 class="text-2xl font-extrabold text-slate-100">Gestor de Deudas</h1>
        </div>
        <button id="btn-add-debt" class="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition active:scale-95">
          <i data-lucide="plus" class="w-4 h-4"></i> Nueva Deuda
        </button>
      </div>

      <!-- Debt Summary Card -->
      <div class="gradient-card-dark rounded-3xl p-5 shadow-2xl relative overflow-hidden border-rose-500/20">
        <div class="flex items-center justify-between text-xs text-rose-300 mb-1">
          <span class="font-bold flex items-center gap-1.5 uppercase tracking-wide">
            <i data-lucide="flame" class="w-4 h-4 text-rose-400"></i> Saldo Total Pendiente
          </span>
          <span class="font-mono text-xs">${state.debts.length} compromisos</span>
        </div>

        <div class="text-3xl font-black text-rose-400 num-mono my-1">
          -${mask(formatMoney(totalDebt, currency))}
        </div>

        <div class="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
          <span>Pago mínimo total mensual:</span>
          <span class="font-bold text-white font-mono">${mask(formatMoney(totalMinPayment, currency))}/mes</span>
        </div>
      </div>

      <!-- Simulator: Snowball vs Avalanche Engine -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="zap" class="w-4 h-4 text-amber-400"></i>
            <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wide">Simulador de Liquidación Acelerada</h3>
          </div>
        </div>

        <!-- Method Switcher Tabs -->
        <div class="grid grid-cols-2 gap-2 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs">
          <button data-method="avalanche" class="method-btn py-2 rounded-xl font-bold transition ${selectedMethod === 'avalanche' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
            ⚡ Avalancha (Ahorro Máximo)
          </button>
          <button data-method="snowball" class="method-btn py-2 rounded-xl font-bold transition ${selectedMethod === 'snowball' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
            ❄️ Bola de Nieve (Motivación)
          </button>
        </div>

        <!-- Extra Monthly Payment Input -->
        <div>
          <div class="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span>Aporte Extra Mensual al Capital:</span>
            <span class="font-bold text-emerald-400 font-mono">+${mask(formatMoney(extraPayment, currency))}</span>
          </div>
          <input id="range-extra-payment" type="range" min="0" max="1000" step="25" value="${extraPayment}" class="w-full accent-indigo-500 cursor-pointer" />
        </div>

        <!-- Results Box -->
        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
          <div class="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span class="text-slate-400 block text-[11px]">Libre de Deudas en:</span>
            <span class="text-base font-extrabold text-emerald-400 num-mono font-mono">
              ${currentPlan.years} años
            </span>
            <span class="text-[10px] text-slate-500 block">(${currentPlan.months} cuotas)</span>
          </div>
          <div class="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span class="text-slate-400 block text-[11px]">Intereses Estimados:</span>
            <span class="text-base font-extrabold text-amber-400 num-mono font-mono">
              ${mask(formatMoney(currentPlan.totalInterest, currency))}
            </span>
            ${payoffSimulation.interestSaved > 0 && selectedMethod === 'avalanche' ? `
              <span class="text-[10px] text-emerald-400 block font-semibold">¡Ahorras ${mask(formatMoney(payoffSimulation.interestSaved, currency))}!</span>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Debts List -->
      <div class="space-y-3 pt-1">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Tus Obligaciones</h3>

        ${state.debts.length === 0 ? `
          <div class="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-500 text-xs">
            ¡Felicitaciones! No tienes deudas registradas.
          </div>
        ` : state.debts.map(d => {
          return `
            <div class="card-elevated p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full" style="background: ${d.color || '#F43F5E'}"></span>
                    <h4 class="text-xs font-extrabold text-slate-100">${d.name}</h4>
                  </div>
                  <span class="text-[11px] text-slate-400 mt-0.5 block">
                    Tasa: <strong class="text-rose-400 font-mono">${d.interestRate}% TAE</strong> • Min: ${mask(formatMoney(d.minimumPayment, currency))}/m
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <button data-pay-debt="${d.id}" class="btn-pay-debt px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold border border-rose-500/30 transition active:scale-95 flex items-center gap-1">
                    <i data-lucide="credit-card" class="w-3.5 h-3.5"></i> Abonar
                  </button>
                  <button data-delete-debt="${d.id}" class="btn-del-debt p-1.5 text-slate-500 hover:text-rose-400 rounded-lg">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <div class="flex items-baseline justify-between mt-3 pt-2 border-t border-slate-800 text-xs">
                <span class="text-slate-400">Saldo Pendiente:</span>
                <span class="text-sm font-extrabold text-rose-400 font-mono">${mask(formatMoney(d.totalAmount, currency))}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>

    <!-- Modal Form for New Debt -->
    <div id="modal-new-debt" class="bottom-sheet-backdrop">
      <div class="bottom-sheet p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-extrabold text-white flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-5 h-5 text-rose-400"></i> Registrar Deuda o Crédito
          </h3>
          <button id="btn-close-debt-modal" class="p-1 text-slate-400 hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-300 mb-1">Nombre o Entidad Acreedora</label>
            <input id="new-debt-name" type="text" placeholder="Ej: Tarjeta Visa, Préstamo Vehicular, Hipoteca..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-rose-500" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-300 mb-1">Saldo Deudor Total</label>
              <input id="new-debt-amount" type="number" step="50" placeholder="Ej: 1500" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Tasa de Interés (% Anual)</label>
              <input id="new-debt-rate" type="number" step="0.5" placeholder="Ej: 24.5" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-300 mb-1">Pago Mínimo Mensual</label>
              <input id="new-debt-min" type="number" step="10" placeholder="Ej: 50" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Día de Pago del Mes</label>
              <input id="new-debt-day" type="date" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
            </div>
          </div>

          <button id="btn-save-new-debt" type="button" class="w-full py-3.5 mt-2 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-xl shadow-rose-600/30 active:scale-95 transition">
            Guardar Deuda
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form for Paying Debt -->
    <div id="modal-pay-debt" class="bottom-sheet-backdrop">
      <div class="bottom-sheet p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-extrabold text-white flex items-center gap-2">
            <i data-lucide="credit-card" class="w-5 h-5 text-rose-400"></i> Registrar Abono a Deuda
          </h3>
          <button id="btn-close-pay-modal" class="p-1 text-slate-400 hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <input type="hidden" id="pay-target-debt-id" />

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-300 mb-1">Monto del Abono / Pago</label>
            <div class="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1">
              <span class="font-bold text-slate-400 font-mono">${currency}</span>
              <input id="pay-debt-amount" type="number" step="10" placeholder="0.00" class="w-full bg-transparent p-2 text-white outline-none font-mono text-sm font-bold" />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-300 mb-1">Pagar desde la Cuenta</label>
            <select id="pay-debt-from-account" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none">
              ${state.accounts.filter(a => a.type !== 'credit').map(a => `
                <option value="${a.id}">${a.name} (${formatMoney(a.balance, currency)})</option>
              `).join('')}
            </select>
          </div>

          <button id="btn-save-debt-payment" type="button" class="w-full py-3.5 mt-2 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-xl shadow-rose-600/30 active:scale-95 transition">
            Confirmar Abono
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach Simulator Handlers
  container.querySelectorAll('.method-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedMethod = e.currentTarget.dataset.method;
      renderDebts(container);
    });
  });

  const rangeInput = container.querySelector('#range-extra-payment');
  if (rangeInput) {
    rangeInput.addEventListener('input', (e) => {
      extraPayment = Number(e.target.value);
      renderDebts(container);
    });
  }

  // Modal New Debt Handlers
  const modal = container.querySelector('#modal-new-debt');
  const sheet = modal.querySelector('.bottom-sheet');
  const btnAdd = container.querySelector('#btn-add-debt');
  const btnClose = container.querySelector('#btn-close-debt-modal');

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

  const btnSave = container.querySelector('#btn-save-new-debt');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const name = container.querySelector('#new-debt-name').value.trim();
      const amount = parseFloat(container.querySelector('#new-debt-amount').value);
      const rate = parseFloat(container.querySelector('#new-debt-rate').value) || 0;
      const min = parseFloat(container.querySelector('#new-debt-min').value) || 20;

      if (!name || !amount || amount <= 0) {
        alert('Por favor ingresa un nombre y saldo válido para la deuda.');
        return;
      }

      store.addDebt({
        name,
        totalAmount: amount,
        interestRate: rate,
        minimumPayment: min,
        color: '#F43F5E'
      });

      closeModal();
      renderDebts(container);
    });
  }

  // Pay Debt Modal Handlers
  const payModal = container.querySelector('#modal-pay-debt');
  const paySheet = payModal.querySelector('.bottom-sheet');
  const btnClosePay = container.querySelector('#btn-close-pay-modal');

  const closePayModal = () => {
    payModal.classList.remove('active');
    paySheet.classList.remove('active');
  };

  if (btnClosePay) btnClosePay.addEventListener('click', closePayModal);
  if (payModal) {
    payModal.addEventListener('click', (e) => {
      if (e.target === payModal) closePayModal();
    });
  }

  container.querySelectorAll('.btn-pay-debt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const debtId = e.currentTarget.dataset.payDebt;
      container.querySelector('#pay-target-debt-id').value = debtId;
      payModal.classList.add('active');
      paySheet.classList.add('active');
      setTimeout(() => {
        container.querySelector('#pay-debt-amount').focus();
      }, 100);
    });
  });

  const btnConfirmPay = container.querySelector('#btn-save-debt-payment');
  if (btnConfirmPay) {
    btnConfirmPay.addEventListener('click', () => {
      const debtId = container.querySelector('#pay-target-debt-id').value;
      const amount = parseFloat(container.querySelector('#pay-debt-amount').value);
      const fromAcc = container.querySelector('#pay-debt-from-account').value;

      if (!amount || amount <= 0) {
        alert('Por favor ingresa un monto válido para el abono.');
        return;
      }

      store.payDebt(debtId, amount, fromAcc);
      closePayModal();
      renderDebts(container);
    });
  }

  // Delete debt
  container.querySelectorAll('.btn-del-debt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.deleteDebt;
      if (confirm('¿Eliminar esta deuda?')) {
        store.deleteDebt(id);
        renderDebts(container);
      }
    });
  });

  if (window.lucide) {
    window.lucide.createIcons({ root: container });
  }
}
