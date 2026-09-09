// Analytics & Financial Reports Component - Detailed Category Breakdown & Drilldown
import { store } from '../state.js';
import { FinancialEngine } from '../financialEngine.js';
import { formatMoney, formatCompactNumber, formatDate } from '../utils/currency.js';
import { exportToCSV, exportFullBackupJSON } from '../utils/exporter.js';

let chartInstance = null;
let forecastChartInstance = null;

let currentTab = 'expense'; // 'expense' | 'income' | 'flow'
let currentPeriod = 'this_month'; // 'this_month' | 'prev_month' | 'last_3_months' | 'all'

export function renderReports(container) {
  const state = store.getState();
  const currency = state.settings.currency;
  const hideBalances = state.settings.hideBalances;
  const mask = (val) => hideBalances ? '••••••' : val;

  // Generate detailed report data based on current period
  const report = FinancialEngine.generateDetailedReport(state.transactions, state.categories, currentPeriod);
  const netWorthData = FinancialEngine.calculateNetWorth(state.accounts);
  const accountMap = new Map(state.accounts.map(a => [a.id, a]));

  const activeBreakdown = currentTab === 'income' ? report.incomeBreakdown : report.expenseBreakdown;
  const currentTotal = currentTab === 'income' ? report.totalIncome : report.totalExpense;

  // Prepare chart data
  const labels = activeBreakdown.map(c => c.name);
  const chartData = activeBreakdown.map(c => c.amount);
  const colors = activeBreakdown.map(c => c.color);

  const periodNames = {
    this_month: 'Este Mes',
    prev_month: 'Mes Anterior',
    last_3_months: 'Últimos 3 Meses',
    all: 'Histórico Completo'
  };

  container.innerHTML = `
    <div class="space-y-4 pb-28 animate-fadeIn">
      
      <!-- Top Title & Quick Actions -->
      <div class="flex items-center justify-between pt-2 px-1">
        <div>
          <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Auditoría & Analítica</span>
          <h1 class="text-2xl font-extrabold text-slate-100">Reportes Detallados</h1>
        </div>
        <div class="flex items-center gap-1.5">
          <button id="btn-export-detailed-csv" class="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition" title="Exportar Reporte a CSV / Excel">
            <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-400"></i>
            <span>CSV</span>
          </button>
          <button id="btn-export-backup-json" class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700" title="Copia de Seguridad JSON">
            <i data-lucide="database" class="w-4 h-4 text-indigo-400"></i>
          </button>
        </div>
      </div>

      <!-- Timezone indicator & Data safety tip -->
      <div class="flex items-center justify-between px-3 py-2 bg-indigo-950/40 border border-indigo-800/30 rounded-2xl text-[11px] text-slate-300">
        <span class="flex items-center gap-1.5">
          <i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-400"></i>
          <span>Horario sincronizado: <strong class="text-indigo-300 font-mono">GMT-3</strong></span>
        </span>
        <span class="flex items-center gap-1 text-emerald-400">
          <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Datos 100% seguros
        </span>
      </div>

      <!-- Period Filter Selector -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button data-period="this_month" class="period-btn shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${currentPeriod === 'this_month' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}">
          Este Mes
        </button>
        <button data-period="prev_month" class="period-btn shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${currentPeriod === 'prev_month' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}">
          Mes Anterior
        </button>
        <button data-period="last_3_months" class="period-btn shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${currentPeriod === 'last_3_months' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}">
          Últimos 3 Meses
        </button>
        <button data-period="all" class="period-btn shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${currentPeriod === 'all' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}">
          Histórico Completo
        </button>
      </div>

      <!-- Main Balance Summary Card for Selected Period -->
      <div class="gradient-card-dark rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span class="font-bold uppercase tracking-wide flex items-center gap-1.5">
            <i data-lucide="scale" class="w-4 h-4 text-indigo-400"></i> Resumen: ${periodNames[currentPeriod]}
          </span>
          <span class="bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
            ${currency}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 my-3">
          <!-- Ingresos -->
          <div class="bg-slate-900/60 rounded-2xl p-3 border border-emerald-500/15">
            <span class="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <i data-lucide="arrow-down-left" class="w-3 h-3 text-emerald-400"></i> Ingresos Totales
            </span>
            <div class="text-lg font-extrabold text-emerald-400 num-mono mt-1">
              +${mask(formatMoney(report.totalIncome, currency))}
            </div>
            <span class="text-[10px] text-slate-500">${report.incomeCount} operaciones</span>
          </div>

          <!-- Gastos -->
          <div class="bg-slate-900/60 rounded-2xl p-3 border border-rose-500/15">
            <span class="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <i data-lucide="arrow-up-right" class="w-3 h-3 text-rose-400"></i> Gastos Totales
            </span>
            <div class="text-lg font-extrabold text-rose-400 num-mono mt-1">
              -${mask(formatMoney(report.totalExpense, currency))}
            </div>
            <span class="text-[10px] text-slate-500">${report.expenseCount} operaciones</span>
          </div>
        </div>

        <!-- Flujo Neto del Período -->
        <div class="flex items-center justify-between bg-slate-950/80 rounded-2xl px-4 py-2.5 border border-slate-800">
          <div>
            <span class="text-[11px] text-slate-400 font-semibold block">Balance Neto (Ingresos - Gastos)</span>
            <span class="text-base font-black num-mono ${report.netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
              ${report.netSavings >= 0 ? '+' : ''}${mask(formatMoney(report.netSavings, currency))}
            </span>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-slate-400 font-semibold block">Tasa de Ahorro</span>
            <span class="text-base font-extrabold text-indigo-300 font-mono">${report.savingsRate}%</span>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-3 gap-2 text-xs">
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
          <span class="text-[10px] text-slate-400 uppercase font-semibold block">Gasto Diario Prom.</span>
          <span class="text-sm font-extrabold text-rose-400 num-mono mt-0.5 block">
            ${mask(formatMoney(report.dailyExpenseAvg, currency))}
          </span>
        </div>
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
          <span class="text-[10px] text-slate-400 uppercase font-semibold block">Ticket Promedio</span>
          <span class="text-sm font-extrabold text-slate-200 num-mono mt-0.5 block">
            ${mask(formatMoney(report.avgExpenseTicket, currency))}
          </span>
        </div>
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
          <span class="text-[10px] text-slate-400 uppercase font-semibold block">Top Categoría</span>
          <span class="text-xs font-bold text-indigo-300 line-clamp-1 mt-0.5 block" title="${report.topExpense?.name || 'N/A'}">
            ${report.topExpense?.name || 'N/A'}
          </span>
        </div>
      </div>

      <!-- Report View Tabs: Gastos vs Ingresos vs Flujo -->
      <div class="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs">
        <button data-tab="expense" class="tab-report-btn py-2 rounded-xl font-bold transition ${currentTab === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
          Gastos (${report.expenseBreakdown.length})
        </button>
        <button data-tab="income" class="tab-report-btn py-2 rounded-xl font-bold transition ${currentTab === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
          Ingresos (${report.incomeBreakdown.length})
        </button>
        <button data-tab="flow" class="tab-report-btn py-2 rounded-xl font-bold transition ${currentTab === 'flow' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
          Evolución & P&L
        </button>
      </div>

      ${currentTab === 'flow' ? `
        <!-- Cashflow Forecast & Evolution Chart -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="trending-up" class="w-4 h-4 text-cyan-400"></i> Proyección de Flujo (Próximos 30 Días)
            </h3>
            <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">Recurrentes</span>
          </div>
          <div class="relative h-56">
            <canvas id="cashflow-forecast-chart"></canvas>
          </div>
        </div>

        <!-- Monthly P&L Ledger Summary -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
          <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <i data-lucide="clipboard-list" class="w-4 h-4 text-indigo-400"></i> Estado Financiero del Período
          </h3>

          <div class="space-y-2.5 text-xs divide-y divide-slate-800/80">
            <div class="flex justify-between pt-2">
              <span class="text-slate-400 font-medium">Ingresos Totales Brutos</span>
              <span class="text-emerald-400 font-bold font-mono">+${mask(formatMoney(report.totalIncome, currency))}</span>
            </div>
            <div class="flex justify-between pt-2">
              <span class="text-slate-400 font-medium">Gastos de Operación / Vida</span>
              <span class="text-rose-400 font-bold font-mono">-${mask(formatMoney(report.totalExpense, currency))}</span>
            </div>
            <div class="flex justify-between pt-2 font-bold text-sm">
              <span class="text-slate-200">Flujo Neto Disponible</span>
              <span class="font-mono ${report.netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                ${mask(formatMoney(report.netSavings, currency))}
              </span>
            </div>
          </div>
        </div>
      ` : `
        <!-- Donut Chart Card with Dynamic Center Total -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="pie-chart" class="w-4 h-4 text-indigo-400"></i> Distribución de ${currentTab === 'income' ? 'Ingresos' : 'Gastos'}
            </h3>
            <span class="text-xs font-extrabold num-mono ${currentTab === 'income' ? 'text-emerald-400' : 'text-rose-400'}">
              ${mask(formatMoney(currentTotal, currency))}
            </span>
          </div>

          ${activeBreakdown.length === 0 ? `
            <div class="p-8 text-center text-slate-500 text-xs">
              No hay ${currentTab === 'income' ? 'ingresos' : 'gastos'} registrados en este período.
            </div>
          ` : `
            <div class="relative h-56 flex items-center justify-center">
              <canvas id="category-donut-chart"></canvas>
            </div>
          `}
        </div>

        <!-- DETAILED CATEGORY LIST: MONTO + PORCENTAJE + BARRA + CLICK PARA VER MOVIMIENTOS -->
        <div class="space-y-3">
          <div class="flex items-center justify-between px-1">
            <div>
              <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="list-ordered" class="w-4 h-4 text-indigo-400"></i> Desglose Detallado por Categoría
              </h3>
              <span class="text-[10px] text-slate-500">Toca cualquier categoría para ver los gastos detallados</span>
            </div>
            <span class="text-[11px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
              Interactivo
            </span>
          </div>

          ${activeBreakdown.length === 0 ? `
            <div class="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-500 text-xs">
              No se encontraron registros para mostrar.
            </div>
          ` : activeBreakdown.map((item, idx) => {
            let bucketBadge = '';
            if (currentTab === 'expense') {
              if (item.bucket === 'needs') bucketBadge = '<span class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">Necesidad (50%)</span>';
              else if (item.bucket === 'wants') bucketBadge = '<span class="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-semibold">Deseo (30%)</span>';
              else if (item.bucket === 'savings') bucketBadge = '<span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">Ahorro (20%)</span>';
            }

            return `
              <div data-cat-id="${item.categoryId}" class="category-card-interactive card-elevated p-4 bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/60 active:scale-[0.98] transition-all cursor-pointer space-y-2.5">
                <!-- Top Row: Icon + Name + Percentage + Amount -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm" style="background: ${item.color}25; color: ${item.color}">
                      <i data-lucide="${item.icon || 'tag'}" class="w-5 h-5"></i>
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <h4 class="text-xs font-extrabold text-slate-100">${item.name}</h4>
                        ${bucketBadge}
                      </div>
                      <span class="text-[11px] text-slate-400 mt-0.5 block">
                        ${item.count} mov. • Promedio: <strong class="text-slate-300 font-mono">${mask(formatMoney(item.avgTicket, currency))}</strong>
                      </span>
                    </div>
                  </div>

                  <!-- Percentage & Total Amount -->
                  <div class="text-right">
                    <div class="flex items-baseline justify-end gap-1.5">
                      <span class="text-sm font-black num-mono ${currentTab === 'income' ? 'text-emerald-400' : 'text-rose-400'}">
                        ${mask(formatMoney(item.amount, currency))}
                      </span>
                      <span class="text-xs font-black font-mono px-2 py-0.5 rounded-lg text-white" style="background: ${item.color}35; color: ${item.color}">
                        ${item.percentage}%
                      </span>
                    </div>
                    <span class="text-[10px] text-slate-500 block mt-0.5">
                      del total de ${currentTab === 'income' ? 'ingresos' : 'gastos'}
                    </span>
                  </div>
                </div>

                <!-- Progress Bar matching Category Color -->
                <div class="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div class="h-full rounded-full transition-all duration-700" style="width: ${Math.max(3, item.percentage)}%; background-color: ${item.color}"></div>
                </div>

                <!-- Interactive CTA Pill -->
                <div class="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px] text-indigo-400 font-semibold">
                  <span class="flex items-center gap-1 text-slate-400 hover:text-indigo-300">
                    <i data-lucide="eye" class="w-3.5 h-3.5 text-indigo-400"></i>
                    <span>Toca para ver los <strong>${item.count}</strong> movimientos</span>
                  </span>
                  <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}

      <!-- Financial Diagnosis & Actionable Insights -->
      <div class="bg-indigo-950/40 border border-indigo-800/40 rounded-3xl p-5 space-y-2 text-xs">
        <h4 class="font-bold text-indigo-300 flex items-center gap-1.5">
          <i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i> Diagnóstico Financiero del Experto
        </h4>
        <div class="text-slate-300 leading-relaxed space-y-1.5 text-[11px]">
          ${report.totalExpense > 0 ? `
            <p>• <strong>Impacto Principal:</strong> Tu mayor categoría de gasto en este período es <strong>${report.topExpense?.name || 'General'}</strong> con <strong>${report.topExpense?.percentage}%</strong> (${mask(formatMoney(report.topExpense?.amount, currency))}).</p>
            <p>• <strong>Tasa de Ahorro:</strong> Estás reteniendo el <strong>${report.savingsRate}%</strong> de tus ingresos. ${report.savingsRate >= 20 ? '¡Excelente! Cumples con la recomendación del 20% para inversión y patrimonio.' : 'Se recomienda recortar compras no esenciales para alcanzar al menos un 20% de ahorro mensual.'}</p>
            <p>• <strong>Frecuencia:</strong> Registraste un promedio de gasto diario de <strong>${mask(formatMoney(report.dailyExpenseAvg, currency))}</strong> distribuido en ${report.expenseCount} transacciones.</p>
          ` : `
            <p>No se registran suficientes gastos en este período para generar un diagnóstico completo.</p>
          `}
        </div>
      </div>

    </div>

    <!-- Category Drilldown Bottom Sheet Modal -->
    <div id="modal-category-drilldown" class="bottom-sheet-backdrop">
      <div class="bottom-sheet p-5 space-y-4 max-h-[85vh] overflow-hidden flex flex-col">
        <!-- Modal Header injected dynamically -->
        <div id="drilldown-header" class="border-b border-slate-800 pb-3"></div>

        <!-- Transaction list scrollable container -->
        <div id="drilldown-tx-list" class="overflow-y-auto flex-1 space-y-2.5 pr-1 max-h-[55vh]"></div>

        <!-- Modal Footer Actions -->
        <div class="pt-2 border-t border-slate-800 flex items-center gap-2">
          <button id="btn-close-drilldown" class="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition">
            Cerrar
          </button>
          <button id="btn-drilldown-to-ledger" class="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5">
            <i data-lucide="receipt-text" class="w-4 h-4"></i> Ir al Libro Diario
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach Period button listeners
  container.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentPeriod = e.currentTarget.dataset.period;
      renderReports(container);
    });
  });

  // Attach Tab button listeners
  container.querySelectorAll('.tab-report-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentTab = e.currentTarget.dataset.tab;
      renderReports(container);
    });
  });

  // Attach Interactive Category Drilldown Handlers
  const modalDrilldown = container.querySelector('#modal-category-drilldown');
  const sheetDrilldown = modalDrilldown?.querySelector('.bottom-sheet');
  const btnCloseDrilldown = container.querySelector('#btn-close-drilldown');

  const closeDrilldown = () => {
    if (modalDrilldown && sheetDrilldown) {
      modalDrilldown.classList.remove('active');
      sheetDrilldown.classList.remove('active');
    }
  };

  if (btnCloseDrilldown) btnCloseDrilldown.addEventListener('click', closeDrilldown);
  if (modalDrilldown) {
    modalDrilldown.addEventListener('click', (e) => {
      if (e.target === modalDrilldown) closeDrilldown();
    });
  }

  container.querySelectorAll('.category-card-interactive').forEach(card => {
    card.addEventListener('click', (e) => {
      const catId = e.currentTarget.dataset.catId;
      const catData = activeBreakdown.find(c => c.categoryId === catId);
      if (!catData) return;

      openCategoryDrilldown(catData, report, currency, mask, accountMap, container, closeDrilldown);
    });
  });

  // Render Charts
  setTimeout(() => {
    initReportsCharts(container, labels, chartData, colors, state, currency, currentTab);
  }, 80);

  // Attach Detailed CSV Export
  const btnCsv = container.querySelector('#btn-export-detailed-csv');
  if (btnCsv) {
    btnCsv.addEventListener('click', () => {
      exportDetailedReportToCSV(report, currency);
    });
  }

  // Backup JSON
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

function openCategoryDrilldown(catData, report, currency, mask, accountMap, container, closeDrilldown) {
  const modal = container.querySelector('#modal-category-drilldown');
  const sheet = modal?.querySelector('.bottom-sheet');
  const headerContainer = container.querySelector('#drilldown-header');
  const listContainer = container.querySelector('#drilldown-tx-list');
  const btnLedger = container.querySelector('#btn-drilldown-to-ledger');

  if (!modal || !sheet || !headerContainer || !listContainer) return;

  const txs = catData.transactions || [];
  const isIncome = currentTab === 'income';

  headerContainer.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md" style="background: ${catData.color}25; color: ${catData.color}">
          <i data-lucide="${catData.icon || 'tag'}" class="w-6 h-6"></i>
        </div>
        <div>
          <h3 class="text-sm font-extrabold text-slate-100">${catData.name}</h3>
          <span class="text-[11px] text-slate-400 block mt-0.5">
            ${catData.count} movimientos • <strong class="text-indigo-300 font-mono">${catData.percentage}% del total</strong>
          </span>
        </div>
      </div>
      <div class="text-right">
        <span class="text-base font-black num-mono block ${isIncome ? 'text-emerald-400' : 'text-rose-400'}">
          ${mask(formatMoney(catData.amount, currency))}
        </span>
        <span class="text-[10px] text-slate-500 block uppercase font-semibold">Total gastado</span>
      </div>
    </div>
  `;

  if (txs.length === 0) {
    listContainer.innerHTML = `
      <div class="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-500 text-xs">
        No se encontraron movimientos individuales para esta categoría en el período seleccionado.
      </div>
    `;
  } else {
    listContainer.innerHTML = txs.map(t => {
      const acc = accountMap.get(t.accountId);
      const accName = acc?.name || 'Cuenta Principal';
      const formattedDate = formatDate(t.date, 'datetime');

      return `
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
              <i data-lucide="${t.isRecurring ? 'repeat' : 'receipt'}" class="w-4 h-4 ${t.isRecurring ? 'text-indigo-400' : 'text-slate-400'}"></i>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h4 class="text-xs font-bold text-slate-200 line-clamp-1">${t.merchant || catData.name}</h4>
                ${t.isRecurring ? '<span class="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">Fijo</span>' : ''}
              </div>
              <span class="text-[10px] text-slate-400 block mt-0.5 font-mono">
                ${formattedDate}
              </span>
              <span class="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                <i data-lucide="wallet" class="w-3 h-3"></i> ${accName}
              </span>
              ${t.note ? `<p class="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1">"${t.note}"</p>` : ''}
              ${(t.tags && t.tags.length > 0) ? `
                <div class="flex items-center gap-1 mt-1">
                  ${t.tags.map(tag => `<span class="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">#${tag}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          </div>

          <div class="text-right shrink-0">
            <span class="text-xs font-extrabold num-mono block ${isIncome ? 'text-emerald-400' : 'text-rose-400'}">
              ${isIncome ? '+' : '-'}${mask(formatMoney(t.amount, currency))}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Bind Ledger Button
  if (btnLedger) {
    btnLedger.onclick = () => {
      closeDrilldown();
      if (window.router) {
        window.router.navigate('transactions');
      }
    };
  }

  modal.classList.add('active');
  sheet.classList.add('active');

  if (window.lucide) {
    window.lucide.createIcons({ root: modal });
  }
}

function initReportsCharts(container, labels, data, colors, state, currency, tab) {
  if (typeof Chart === 'undefined') return;

  // 1. Donut Chart
  const donutCtx = container.querySelector('#category-donut-chart');
  if (donutCtx && data.length > 0) {
    if (chartInstance) chartInstance.destroy();

    const totalSum = data.reduce((a, b) => a + b, 0);

    chartInstance = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#0B0F19',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              color: '#94A3B8',
              font: { size: 11, family: 'Plus Jakarta Sans' },
              padding: 10
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw || 0;
                const pct = totalSum > 0 ? ((val / totalSum) * 100).toFixed(1) : 0;
                return ` ${ctx.label}: ${formatMoney(val, currency)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // 2. Forecast Chart
  const forecastCtx = container.querySelector('#cashflow-forecast-chart');
  if (forecastCtx) {
    if (forecastChartInstance) forecastChartInstance.destroy();

    const liquidSavings = state.accounts
      .filter(a => a.type !== 'credit' && a.balance > 0)
      .reduce((sum, a) => sum + a.balance, 0);

    const recurring = state.transactions.filter(t => t.isRecurring);
    const forecastPoints = FinancialEngine.projectCashflow(liquidSavings, recurring, 30);

    forecastChartInstance = new Chart(forecastCtx, {
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

function exportDetailedReportToCSV(report, currency) {
  const headers = ['Tipo', 'Categoría', 'Monto Total', 'Porcentaje (%)', 'Cantidad de Operaciones', 'Ticket Promedio'];
  const rows = [];

  report.expenseBreakdown.forEach(item => {
    rows.push([
      '"Gasto"',
      `"${item.name.replace(/"/g, '""')}"`,
      item.amount,
      `"${item.percentage}%"`,
      item.count,
      item.avgTicket
    ].join(','));
  });

  report.incomeBreakdown.forEach(item => {
    rows.push([
      '"Ingreso"',
      `"${item.name.replace(/"/g, '""')}"`,
      item.amount,
      `"${item.percentage}%"`,
      item.count,
      item.avgTicket
    ].join(','));
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `FinanzPro_Reporte_Detallado_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
