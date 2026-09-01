// Dashboard Component - Financial Command Center
import { store } from '../state.js';
import { FinancialEngine } from '../financialEngine.js';
import { formatMoney, formatCompactNumber, formatDate } from '../utils/currency.js';

export function renderDashboard(container) {
  const state = store.getState();
  const currency = state.settings.currency;
  const hideBalances = state.settings.hideBalances;

  // Financial calculations
  const netWorthData = FinancialEngine.calculateNetWorth(state.accounts);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyFlow = FinancialEngine.calculateMonthlyFlow(state.transactions, currentMonth, currentYear);
  const rule50_30_20 = FinancialEngine.calculate50_30_20(state.transactions, state.categories, currentMonth, currentYear);

  // Liquid savings (checking + savings + cash)
  const liquidSavings = state.accounts
    .filter(a => ['checking', 'savings', 'cash'].includes(a.type) && a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const avgMonthlyExpense = monthlyFlow.totalExpense > 0 ? monthlyFlow.totalExpense : 1500;
  const runwayMonths = FinancialEngine.calculateEmergencyRunway(liquidSavings, avgMonthlyExpense);

  const healthScore = FinancialEngine.calculateFinancialHealthScore({
    savingsRate: monthlyFlow.savingsRate,
    runwayMonths,
    debtToAssetRatio: netWorthData.debtToAssetRatio,
    budgetAdherencePct: 92
  });

  const categoryMap = new Map(state.categories.map(c => [c.id, c]));
  const recentTransactions = state.transactions.slice(0, 5);

  const mask = (val) => hideBalances ? '••••••' : val;

  container.innerHTML = `
    <div class="space-y-4 pb-24 animate-fadeIn">
      
      <!-- Top Header / Greeting -->
      <div class="flex items-center justify-between pt-2 px-1">
        <div>
          <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Centro Financiero</span>
          <h1 class="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            Hola, ${state.settings.userName || 'Usuario'}
            <span class="inline-block animate-bounce">👋</span>
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-toggle-hide" class="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/50 transition">
            <i data-lucide="${hideBalances ? 'eye-off' : 'eye'}" class="w-5 h-5"></i>
          </button>
          <button id="btn-quick-settings" class="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/50 transition">
            <i data-lucide="settings" class="w-5 h-5"></i>
          </button>
        </div>
      </div>

      <!-- Hero Card: Patrimonio Neto (Net Worth) -->
      <div class="gradient-card-dark rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div class="absolute -right-8 -top-8 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>
        
        <div class="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
          <span class="flex items-center gap-1.5 uppercase tracking-wide">
            <i data-lucide="shield-check" class="w-4 h-4 text-indigo-400"></i> Patrimonio Neto Total
          </span>
          <span class="bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
            ${currency}
          </span>
        </div>

        <div class="text-3xl sm:text-4xl font-extrabold text-white num-mono tracking-tight my-2">
          ${mask(formatMoney(netWorthData.netWorth, currency))}
        </div>

        <!-- Available Liquid Money Pill -->
        <div class="flex items-center justify-between bg-slate-900/80 rounded-xl px-3 py-2 border border-slate-700/40 my-2 text-xs">
          <span class="text-slate-300 font-medium flex items-center gap-1.5">
            <i data-lucide="wallet" class="w-3.5 h-3.5 text-cyan-400"></i> Dinero Disponible (Líquido)
          </span>
          <span class="font-bold text-cyan-400 font-mono">
            ${mask(formatMoney(liquidSavings, currency))}
          </span>
        </div>

        <!-- Breakdown Activos vs Pasivos -->
        <div class="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80 text-xs">
          <div class="bg-slate-900/60 rounded-xl p-2.5 border border-emerald-500/10">
            <span class="text-slate-400 block text-[11px]">Activos Totales</span>
            <span class="text-emerald-400 font-bold font-mono text-sm">
              +${mask(formatCompactNumber(netWorthData.assets, currency))}
            </span>
          </div>
          <div class="bg-slate-900/60 rounded-xl p-2.5 border border-rose-500/10">
            <span class="text-slate-400 block text-[11px]">Pasivos / Deudas</span>
            <span class="text-rose-400 font-bold font-mono text-sm">
              -${mask(formatCompactNumber(netWorthData.liabilities, currency))}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Row: Monthly Income vs Expenses vs Net Flow -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Ingresos Mes -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 relative overflow-hidden">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[11px] font-semibold text-slate-400 uppercase">Ingresos Mes</span>
            <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <i data-lucide="arrow-down-left" class="w-3.5 h-3.5"></i>
            </div>
          </div>
          <div class="text-lg font-bold text-emerald-400 num-mono">
            +${mask(formatMoney(monthlyFlow.totalIncome, currency))}
          </div>
          <span class="text-[10px] text-slate-500 block mt-1">Total recaudado</span>
        </div>

        <!-- Gastos Mes -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 relative overflow-hidden">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[11px] font-semibold text-slate-400 uppercase">Gastos Mes</span>
            <div class="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
            </div>
          </div>
          <div class="text-lg font-bold text-rose-400 num-mono">
            -${mask(formatMoney(monthlyFlow.totalExpense, currency))}
          </div>
          <span class="text-[10px] text-slate-500 block mt-1">
            Flujo Neto: <strong class="${monthlyFlow.netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-mono">${mask(formatMoney(monthlyFlow.netSavings, currency))}</strong>
          </span>
        </div>
      </div>

      <!-- Health Score Card -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <i data-lucide="activity" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-200">Salud Financiera</h3>
              <span class="text-[11px] text-slate-400 font-medium">${healthScore.grade}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-xl font-extrabold num-mono" style="color: ${healthScore.color}">${healthScore.score}</span>
            <span class="text-xs text-slate-500">/100</span>
          </div>
        </div>

        <!-- Mini Progress Bar -->
        <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
          <div class="h-full rounded-full transition-all duration-700" style="width: ${healthScore.score}%; background: ${healthScore.color}"></div>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed flex items-start gap-1.5">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5"></i>
          <span>${healthScore.recommendation}</span>
        </p>

        <!-- Runway Badge -->
        <div class="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span class="flex items-center gap-1"><i data-lucide="shield" class="w-3.5 h-3.5 text-emerald-400"></i> Fondo de Emergencia:</span>
          <span class="font-bold text-emerald-400 font-mono">${runwayMonths} meses de supervivencia</span>
        </div>
      </div>

      <!-- 50/30/20 Rule Breakdown -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <i data-lucide="pie-chart" class="w-4 h-4 text-indigo-400"></i>
            <h3 class="text-sm font-bold text-slate-200">Regla Financiera 50 / 30 / 20</h3>
          </div>
          <span class="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">Este Mes</span>
        </div>

        <div class="space-y-2.5 text-xs">
          <!-- Necesidades (50%) -->
          <div>
            <div class="flex justify-between text-[11px] mb-1">
              <span class="text-slate-300 font-medium flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Necesidades (Objetivo 50%)
              </span>
              <span class="font-mono text-slate-300 font-bold">${rule50_30_20.needs.percentage}% (${mask(formatCompactNumber(rule50_30_20.needs.amount, currency))})</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" style="width: ${Math.min(100, rule50_30_20.needs.percentage)}%"></div>
            </div>
          </div>

          <!-- Deseos (30%) -->
          <div>
            <div class="flex justify-between text-[11px] mb-1">
              <span class="text-slate-300 font-medium flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-pink-500 inline-block"></span> Deseos y Estilo (Objetivo 30%)
              </span>
              <span class="font-mono text-slate-300 font-bold">${rule50_30_20.wants.percentage}% (${mask(formatCompactNumber(rule50_30_20.wants.amount, currency))})</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-pink-500 rounded-full" style="width: ${Math.min(100, rule50_30_20.wants.percentage)}%"></div>
            </div>
          </div>

          <!-- Ahorro / Deuda (20%) -->
          <div>
            <div class="flex justify-between text-[11px] mb-1">
              <span class="text-slate-300 font-medium flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Ahorro & Inversión (Objetivo 20%)
              </span>
              <span class="font-mono text-slate-300 font-bold">${rule50_30_20.savings.percentage}% (${mask(formatCompactNumber(rule50_30_20.savings.amount, currency))})</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full" style="width: ${Math.min(100, rule50_30_20.savings.percentage)}%"></div>
            </div>
          </div>
        </div>

        <div class="mt-3 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
          💡 <span class="font-medium text-slate-300">Diagnóstico:</span> ${rule50_30_20.advice}
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="grid grid-cols-4 gap-2 pt-1">
        <button id="btn-quick-expense" class="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 transition active:scale-95">
          <div class="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center mb-1">
            <i data-lucide="minus-circle" class="w-4 h-4 text-rose-400"></i>
          </div>
          <span class="text-[11px] font-semibold">Gasto</span>
        </button>

        <button id="btn-quick-income" class="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition active:scale-95">
          <div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-1">
            <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-400"></i>
          </div>
          <span class="text-[11px] font-semibold">Ingreso</span>
        </button>

        <button id="btn-quick-transfer" class="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition active:scale-95">
          <div class="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center mb-1">
            <i data-lucide="arrow-left-right" class="w-4 h-4 text-cyan-400"></i>
          </div>
          <span class="text-[11px] font-semibold">Transferir</span>
        </button>

        <button id="btn-quick-accounts" class="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition active:scale-95">
          <div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mb-1">
            <i data-lucide="wallet" class="w-4 h-4 text-indigo-400"></i>
          </div>
          <span class="text-[11px] font-semibold">Cuentas</span>
        </button>
      </div>

      <!-- Recent Transactions List -->
      <div class="pt-2">
        <div class="flex items-center justify-between mb-3 px-1">
          <h3 class="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <i data-lucide="history" class="w-4 h-4 text-indigo-400"></i> Movimientos Recientes
          </h3>
          <button id="btn-view-all-tx" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
            Ver Todos →
          </button>
        </div>

        <div class="space-y-2">
          ${recentTransactions.length === 0 ? `
            <div class="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              No hay movimientos registrados. ¡Toca el botón + para registrar tu primer gasto o ingreso!
            </div>
          ` : recentTransactions.map(tx => {
            const cat = categoryMap.get(tx.categoryId) || { name: 'General', color: '#64748B', icon: 'tag' };
            const isIncome = tx.type === 'income';
            return `
              <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white" style="background: ${cat.color}25; color: ${cat.color}">
                    <i data-lucide="${cat.icon || 'circle'}" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-slate-200 line-clamp-1">${tx.merchant || cat.name}</h4>
                    <span class="text-[11px] text-slate-400 flex items-center gap-1">
                      ${cat.name} • ${formatDate(tx.date, 'relative')}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-xs font-bold num-mono ${isIncome ? 'text-emerald-400' : 'text-rose-400'}">
                    ${isIncome ? '+' : '-'}${mask(formatMoney(tx.amount, currency))}
                  </span>
                  ${tx.isRecurring ? `<span class="block text-[9px] text-indigo-400 font-semibold">Recurrente</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;

  // Attach Event Listeners
  const btnToggleHide = container.querySelector('#btn-toggle-hide');
  if (btnToggleHide) {
    btnToggleHide.addEventListener('click', () => {
      store.updateSettings({ hideBalances: !hideBalances });
    });
  }

  const btnQuickSettings = container.querySelector('#btn-quick-settings');
  if (btnQuickSettings) {
    btnQuickSettings.addEventListener('click', () => {
      window.router.navigate('settings');
    });
  }

  const btnViewAll = container.querySelector('#btn-view-all-tx');
  if (btnViewAll) {
    btnViewAll.addEventListener('click', () => {
      window.router.navigate('transactions');
    });
  }

  const btnQuickAccounts = container.querySelector('#btn-quick-accounts');
  if (btnQuickAccounts) {
    btnQuickAccounts.addEventListener('click', () => {
      window.router.navigate('accounts');
    });
  }

  // Quick transaction triggers
  const btnExp = container.querySelector('#btn-quick-expense');
  const btnInc = container.querySelector('#btn-quick-income');
  const btnTrf = container.querySelector('#btn-quick-transfer');

  if (btnExp) btnExp.addEventListener('click', () => window.transactionModal.open('expense'));
  if (btnInc) btnInc.addEventListener('click', () => window.transactionModal.open('income'));
  if (btnTrf) btnTrf.addEventListener('click', () => window.transactionModal.open('transfer'));

  // Re-render Lucide icons
  if (window.lucide) {
    window.lucide.createIcons({ root: container });
  }
}
