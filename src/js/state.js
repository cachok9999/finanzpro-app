// State Management and Persistence System
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES, INITIAL_BUDGETS, INITIAL_GOALS, INITIAL_DEBTS, generateInitialTransactions } from './utils/sampleData.js';

const STORAGE_KEY = 'FINANZPRO_STATE_V1';

class StateManager {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      console.warn('Error loading state from localStorage:', e);
    }

    // Default Initial State
    return {
      accounts: INITIAL_ACCOUNTS,
      categories: INITIAL_CATEGORIES,
      transactions: generateInitialTransactions(),
      budgets: INITIAL_BUDGETS,
      goals: INITIAL_GOALS,
      debts: INITIAL_DEBTS,
      settings: {
        currency: 'USD',
        theme: 'dark',
        hideBalances: false,
        biometricEnabled: false,
        userName: 'Usuario Pro',
        notificationsEnabled: true
      }
    };
  }

  saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  getState() {
    return this.state;
  }

  // --- TRANSACTIONS ---
  addTransaction(tx) {
    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      date: tx.date || new Date().toISOString(),
      tags: tx.tags || [],
      isRecurring: !!tx.isRecurring,
      merchant: tx.merchant || '',
      note: tx.note || '',
      ...tx
    };

    newTx.amount = Number(newTx.amount) || 0;

    // Ensure accounts list exists and is not empty
    if (!this.state.accounts || !Array.isArray(this.state.accounts) || this.state.accounts.length === 0) {
      this.state.accounts = [{
        id: 'acc_main',
        name: 'Cuenta Principal (Efectivo / Banco)',
        type: 'checking',
        balance: 0,
        currency: this.state.settings?.currency || 'USD',
        color: '#3B82F6',
        icon: 'wallet',
        isAsset: true
      }];
    }

    // Find account to update or fallback to primary account
    let account = this.state.accounts.find(a => a.id === newTx.accountId);
    if (!account) {
      account = this.state.accounts[0];
      newTx.accountId = account.id;
    }

    // Force numerical casting to prevent string concatenation bugs
    account.balance = Number(account.balance) || 0;

    if (newTx.type === 'income') {
      account.balance += newTx.amount;
    } else if (newTx.type === 'expense') {
      account.balance -= newTx.amount;
    } else if (newTx.type === 'transfer' && newTx.toAccountId) {
      account.balance -= newTx.amount;
      let targetAcc = this.state.accounts.find(a => a.id === newTx.toAccountId);
      if (targetAcc) {
        targetAcc.balance = Number(targetAcc.balance) || 0;
        targetAcc.balance += newTx.amount;
      }
    }

    this.state.transactions.unshift(newTx);
    this.saveState();
    return newTx;
  }

  deleteTransaction(id) {
    const tx = this.state.transactions.find(t => t.id === id);
    if (!tx) return;

    // Reverse balance effect with guaranteed numerical casting
    const account = this.state.accounts.find(a => a.id === tx.accountId);
    if (account) {
      account.balance = Number(account.balance) || 0;
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        account.balance -= amt;
      } else if (tx.type === 'expense') {
        account.balance += amt;
      } else if (tx.type === 'transfer' && tx.toAccountId) {
        account.balance += amt;
        const targetAcc = this.state.accounts.find(a => a.id === tx.toAccountId);
        if (targetAcc) {
          targetAcc.balance = Number(targetAcc.balance) || 0;
          targetAcc.balance -= amt;
        }
      }
    }

    this.state.transactions = this.state.transactions.filter(t => t.id !== id);
    this.saveState();
  }

  // --- ACCOUNTS ---
  addAccount(acc) {
    const newAcc = {
      id: 'acc_' + Date.now(),
      balance: Number(acc.balance) || 0,
      currency: acc.currency || this.state.settings.currency,
      color: acc.color || '#6366F1',
      icon: acc.icon || 'credit-card',
      isAsset: acc.type !== 'credit',
      ...acc
    };
    this.state.accounts.push(newAcc);
    this.saveState();
    return newAcc;
  }

  updateAccount(acc) {
    const idx = this.state.accounts.findIndex(a => a.id === acc.id);
    if (idx !== -1) {
      this.state.accounts[idx] = { ...this.state.accounts[idx], ...acc };
      this.saveState();
    }
  }

  // --- CATEGORIES ---
  addCategory(cat) {
    const newCat = {
      id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
      name: cat.name || 'Nueva Categoría',
      type: cat.type || 'expense', // expense | income
      bucket: cat.bucket || (cat.type === 'income' ? 'income' : 'wants'), // needs | wants | savings | income
      icon: cat.icon || 'tag',
      color: cat.color || '#6366F1',
      ...cat
    };
    this.state.categories.push(newCat);
    this.saveState();
    return newCat;
  }

  updateCategory(cat) {
    const idx = this.state.categories.findIndex(c => c.id === cat.id);
    if (idx !== -1) {
      this.state.categories[idx] = { ...this.state.categories[idx], ...cat };
      this.saveState();
    }
  }

  deleteCategory(id) {
    this.state.categories = this.state.categories.filter(c => c.id !== id);
    this.saveState();
  }

  // --- BUDGETS ---
  setBudget(categoryId, limit, period = 'monthly') {
    const existing = this.state.budgets.find(b => b.categoryId === categoryId);
    if (existing) {
      existing.limit = Number(limit);
      existing.period = period;
    } else {
      this.state.budgets.push({
        id: 'b_' + Date.now(),
        categoryId,
        limit: Number(limit),
        period
      });
    }
    this.saveState();
  }

  deleteBudget(id) {
    this.state.budgets = this.state.budgets.filter(b => b.id !== id);
    this.saveState();
  }

  // --- GOALS (ALCANCÍAS) ---
  addGoal(goal) {
    const newGoal = {
      id: 'goal_' + Date.now(),
      currentAmount: Number(goal.currentAmount) || 0,
      targetAmount: Number(goal.targetAmount) || 1000,
      deadline: goal.deadline || '',
      icon: goal.icon || 'piggy-bank',
      color: goal.color || '#10B981',
      ...goal
    };
    this.state.goals.push(newGoal);
    this.saveState();
    return newGoal;
  }

  contributeToGoal(goalId, amount, fromAccountId) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal) return;

    const amt = Number(amount) || 0;
    goal.currentAmount += amt;

    if (fromAccountId) {
      this.addTransaction({
        type: 'expense',
        amount: amt,
        categoryId: 'cat_aho',
        accountId: fromAccountId,
        merchant: `Aporte a Meta: ${goal.name}`,
        note: `Ahorro para meta ${goal.name}`,
        tags: ['meta', 'ahorro']
      });
    } else {
      this.saveState();
    }
  }

  deleteGoal(id) {
    this.state.goals = this.state.goals.filter(g => g.id !== id);
    this.saveState();
  }

  // --- DEBTS ---
  addDebt(debt) {
    const newDebt = {
      id: 'debt_' + Date.now(),
      totalAmount: Number(debt.totalAmount) || 0,
      interestRate: Number(debt.interestRate) || 0,
      minimumPayment: Number(debt.minimumPayment) || 20,
      dueDate: debt.dueDate || '',
      color: debt.color || '#F43F5E',
      ...debt
    };
    this.state.debts.push(newDebt);
    this.saveState();
    return newDebt;
  }

  payDebt(debtId, amount, fromAccountId) {
    const debt = this.state.debts.find(d => d.id === debtId);
    if (!debt) return;

    const amt = Number(amount) || 0;
    debt.totalAmount = Math.max(0, debt.totalAmount - amt);

    if (fromAccountId) {
      this.addTransaction({
        type: 'expense',
        amount: amt,
        categoryId: 'cat_pde',
        accountId: fromAccountId,
        merchant: `Pago de Deuda: ${debt.name}`,
        note: `Abono a capital / cuota de deuda`,
        tags: ['deuda', 'pago']
      });
    } else {
      this.saveState();
    }
  }

  deleteDebt(id) {
    this.state.debts = this.state.debts.filter(d => d.id !== id);
    this.saveState();
  }

  // --- SETTINGS ---
  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.saveState();
  }

  resetToSampleData() {
    this.state = {
      accounts: INITIAL_ACCOUNTS,
      categories: INITIAL_CATEGORIES,
      transactions: generateInitialTransactions(),
      budgets: INITIAL_BUDGETS,
      goals: INITIAL_GOALS,
      debts: INITIAL_DEBTS,
      settings: {
        currency: 'USD',
        theme: 'dark',
        hideBalances: false,
        biometricEnabled: false,
        userName: 'Usuario Pro',
        notificationsEnabled: true
      }
    };
    this.saveState();
  }

  clearAllData() {
    this.state = {
      accounts: [
        {
          id: 'acc_main',
          name: 'Billetera Principal (Efectivo / Banco)',
          type: 'checking',
          balance: 0.00,
          currency: this.state.settings?.currency || 'USD',
          color: '#3B82F6',
          icon: 'wallet',
          isAsset: true
        }
      ],
      categories: INITIAL_CATEGORIES,
      transactions: [],
      budgets: [],
      goals: [],
      debts: [],
      settings: {
        currency: 'USD',
        theme: 'dark',
        hideBalances: false,
        biometricEnabled: false,
        userName: 'Usuario Pro',
        notificationsEnabled: true
      }
    };
    this.saveState();
  }

  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && (data.accounts || data.transactions)) {
        this.state = { ...this.state, ...data };
        this.saveState();
        return true;
      }
    } catch (e) {
      console.error('Error parsing imported JSON:', e);
    }
    return false;
  }
}

export const store = new StateManager();
