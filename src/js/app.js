// Main Application Entry Point and Router
import { store } from './state.js';
import { TransactionModal } from './components/transactionModal.js';
import { renderDashboard } from './components/dashboard.js';
import { renderTransactions } from './components/transactions.js';
import { renderAccounts } from './components/accounts.js';
import { renderBudgets } from './components/budgets.js';
import { renderGoals } from './components/goals.js';
import { renderDebts } from './components/debts.js';
import { renderReports } from './components/reports.js';
import { renderSettings } from './components/settings.js';
import { renderCategories } from './components/categories.js';

class AppRouter {
  constructor() {
    this.currentRoute = 'dashboard';
    this.container = document.getElementById('view-content');
    this.routes = {
      dashboard: renderDashboard,
      transactions: renderTransactions,
      accounts: renderAccounts,
      budgets: renderBudgets,
      goals: renderGoals,
      debts: renderDebts,
      reports: renderReports,
      settings: renderSettings,
      categories: renderCategories
    };
  }

  navigate(route) {
    if (!this.routes[route]) return;
    this.currentRoute = route;

    // Update bottom nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      const itemRoute = item.dataset.route;
      if (itemRoute === route) {
        item.classList.add('text-indigo-400', 'font-bold');
        item.classList.remove('text-slate-400');
      } else {
        item.classList.remove('text-indigo-400', 'font-bold');
        item.classList.add('text-slate-400');
      }
    });

    // Render view
    this.container.scrollTop = 0;
    this.routes[route](this.container);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  getCurrentRoute() {
    return this.currentRoute;
  }
}

// Toast notification helper
export function showToast(message, duration = 3000) {
  const toast = document.getElementById('app-toast');
  if (!toast) return;

  toast.innerHTML = `<div class="bg-slate-900 border border-indigo-500/40 text-slate-100 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md">${message}</div>`;
  toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, duration);
}

// App Initialization Function
function initApp() {
  // Apply saved theme
  const initialSettings = store.getState().settings;
  document.documentElement.setAttribute('data-theme', initialSettings.theme || 'dark');

  // Initialize Router & Modal
  window.router = new AppRouter();
  window.transactionModal = new TransactionModal();
  window.showToast = showToast;

  // Setup Bottom Nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const route = e.currentTarget.dataset.route;
      if (route) window.router.navigate(route);
    });
  });

  // Setup Floating Action Button (FAB)
  const fab = document.getElementById('main-fab');
  if (fab) {
    fab.addEventListener('click', () => {
      window.transactionModal.open('expense');
    });
  }

  // Subscribe to state changes to auto-update view
  store.subscribe(() => {
    window.router.navigate(window.router.getCurrentRoute());
  });

  // Initial Route Render
  window.router.navigate('dashboard');

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('[PWA] Service Worker registered with scope:', reg.scope))
      .catch(err => console.log('[PWA] Service Worker registration failed:', err));
  }
}

// Ensure execution whether DOM is already parsed or loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
