// Analytics & Financial Reports Component
import { store } from '../state.js';
import { FinancialEngine } from '../financialEngine.js';
import { formatMoney, formatCompactNumber } from '../utils/currency.js';
import { exportToCSV, exportFullBackupJSON } from '../utils/exporter.js';

let chartInstance1 = null;
let chartInstance2 = null;

export function renderReports(container) {
  const state = store.getState();
  const currency = state.settings.currency;
  const hideBalances = state.settings.hideBalances;
  const mask = (val) => hideBalances ? '••••••' : val;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyFlow = FinancialEngine.calculateMonthlyFlow(state.transactions, currentMonth, currentYear);
  const netWorthData = FinancialEngine.calculateNetWorth(state.accounts);

  // Group expenses by category
  const categoryMap = new Map(state.categories.map(c => [c.id, c]));
  const expenseData = [];
  const labels = [];
  const colors = [];

  Object.entries(monthlyFlow.categorySpending).forEach(([catId, amount]) => {
    const cat = categoryMap.get(catId) || { name: 'Otros', color: '#94A3B8' };
    if (amount > 0) {
      labels.push(cat.name);
      expenseData.push(amount);
      colors.push(cat.color || '#6366F1');
    }
  });

  container.innerHTML = `
    <div class="space-y-4 pb-24 animate-fadeIn">
      
      <!-- Top Title & Export -->
      <div class="flex items-center justify-between pt-2 px-1">
        <div>
          <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Inteligencia y Auditoría</span>
          <h1 class="text-2xl font-extrabold text-slate-100">Analítica Financiera</h1>
        </div>
        <div class="flex items-center gap-1.5">
          <button id="btn-export-all-csv" class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700" title="Exportar CSV">
            <i data-lucide="file-spreadsheet" class="w-5 h-5 text-emerald-400"></i>
          </button>
          <button id="btn-export-backup-json" class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700" title="Copia de Seguridad JSON">
            <i data-lucide="database" class="w-5 h-5 text-indigo-400"></i>
          </button>
        </div>
      </div>

      <!-- Financial Health Snapshot -->
      <div class="grid grid-cols-3 gap-2">
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
          <span class="text-[10px] text-slate-400 uppercase block font-semibold">Tasa de Ahorro</span>
          <span class="text-base font-extrabold text-emerald-400 font-mono">${monthlyFlow.savingsRate}%</span>
        </div>
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
          <span class="text-[10px] text-slate-400 uppercase block font-semibold">Endeudamiento</span>
          <span class="text-base font-extrabold text-amber-400 font-mono">${netWorthData.debtToAssetRatio}%</span>
        </div>
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
          <span class="text-[10px] text-slate-400 uppercase block font-semibold">Ahorro Neto</span>
          <span class="text-base font-extrabold text-indigo-400 font-mono">${mask(formatCompactNumber(monthlyFlow.netSavings, currency))}</span>
        </div>
      </div>

      <!-- Category Donut Chart -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <i data-lucide="pie-chart" class="w-4 h-4 text-indigo-400"></i> Desglose de Gastos por Categoría
        </h3>
        
        ${expenseData.length === 0 ? `
          <div class="p-8 text-center text-slate-500 text-xs">No hay gastos registrados este mes.</div>
        ` : `
          <div class="relative h-56 flex items-center justify-center">
            <canvas id="category-donut-chart"></canvas>
          </div>
        `}
      </div>

      <!-- Cashflow Forecast Chart (30 Days Ahead) -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <i data-lucide="trending-up" class="w-4 h-4 text-cyan-400"></i> Proyección de Flujo de Caja (30 Días)
        </h3>
        <p class="text-[11px] text-slate-500 mb-4">Simulación basada en tus gastos e ingresos fijos recurrentes</p>
        
        <div class="relative h-52">
          <canvas id="cashflow-forecast-chart"></canvas>
        </div>
      </div>

      <!-- Monthly P&L Ledger Summary -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
        <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <i data-lucide="clipboard-list" class="w-4 h-4 text-indigo-400"></i> Estado de Resultados (P&L del Mes)
        </h3>

        <div class="space-y-2 text-xs divide-y divide-slate-800/80">
          <div class="flex justify-between pt-2">
            <span class="text-slate-400 font-medium">Ingresos Totales Brutos</span>
            <span class="text-emerald-400 font-bold font-mono">+${mask(formatMoney(monthlyFlow.totalIncome, currency))}</span>
          </div>
          <div class="flex justify-between pt-2">
            <span class="text-slate-400 font-medium">Gastos de Operación / Vida</span>
            <span class="text-rose-400 font-bold font-mono">-${mask(formatMoney(monthlyFlow.totalExpense, currency))}</span>
          </div>
          <div class="flex justify-between pt-2 font-bold text-sm">
            <span class="text-slate-200">Flujo Neto Excedente</span>
            <span class="font-mono ${monthlyFlow.netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
              ${mask(formatMoney(monthlyFlow.netSavings, currency))}
            </span>
          </div>
        </div>
      </div>

    </div>
  `;

  // Render Charts
  setTimeout(() => {
    initCharts(container, labels, expenseData, colors, state, currency);
  }, 100);

  // Attach Exports
  const btnCsv = container.querySelector('#btn-export-all-csv');
  if (btnCsv) {
    btnCsv.addEventListener('click', () => {
      exportToCSV(state.transactions, state.categories, state.accounts);
    });
  }

  const btnBackup = container.querySelector('#btn-export-backup-json');
  if (btnBackup) {
    btnBackup.addEventListener('click', () => {
      exportFullBackupJSON(state);
    });
  }

  if (window.lucide) {
    window.lucide.createIcons({ root: container });
  }
}

function initCharts(container, labels, data, colors, state, currency) {
  if (typeof Chart === 'undefined') return;

  // 1. Donut Chart
  const donutCtx = container.querySelector('#category-donut-chart');
  if (donutCtx && data.length > 0) {
    if (chartInstance1) chartInstance1.destroy();

    chartInstance1 = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#0F172A',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              color: '#94A3B8',
              font: { size: 11, family: 'Plus Jakarta Sans' },
              padding: 12
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${formatMoney(ctx.raw, currency)}`
            }
          }
        }
      }
    });
  }

  // 2. Forecast Chart
  const forecastCtx = container.querySelector('#cashflow-forecast-chart');
  if (forecastCtx) {
    if (chartInstance2) chartInstance2.destroy();

    const liquidSavings = state.accounts
      .filter(a => a.type !== 'credit' && a.balance > 0)
      .reduce((sum, a) => sum + a.balance, 0);

    const recurring = state.transactions.filter(t => t.isRecurring);
    const forecastPoints = FinancialEngine.projectCashflow(liquidSavings, recurring, 30);

    chartInstance2 = new Chart(forecastCtx, {
      type: 'line',
      data: {
        labels: forecastPoints.filter((_, i) => i % 5 === 0).map(p => p.displayDate),
        datasets: [{
          label: 'Saldo Proyectado',
          data: forecastPoints.filter((_, i) => i % 5 === 0).map(p => p.balance),
          borderColor: '#06B6D4',
          backgroundColor: 'rgba(6, 182, 212, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#06B6D4'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Saldo: ${formatMoney(ctx.raw, currency)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748B', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#64748B',
              font: { size: 10 },
              callback: (v) => formatCompactNumber(v, currency)
            }
          }
        }
      }
    });
  }
}
