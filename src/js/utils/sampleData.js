// Sample Financial Data for Instant Demo and Testing
export const INITIAL_CATEGORIES = [
  // Gastos - Necesidades (50%)
  { id: 'cat_viv', name: 'Vivienda y Alquiler', type: 'expense', bucket: 'needs', icon: 'home', color: '#6366F1' },
  { id: 'cat_ser', name: 'Servicios (Luz, Agua, Gas, Net)', type: 'expense', bucket: 'needs', icon: 'zap', color: '#3B82F6' },
  { id: 'cat_sup', name: 'Supermercado y Comida', type: 'expense', bucket: 'needs', icon: 'shopping-cart', color: '#10B981' },
  { id: 'cat_tra', name: 'Transporte y Gasolina', type: 'expense', bucket: 'needs', icon: 'car', color: '#F59E0B' },
  { id: 'cat_sal', name: 'Salud y Farmacia', type: 'expense', bucket: 'needs', icon: 'heart-pulse', color: '#EC4899' },
  { id: 'cat_seg', name: 'Seguros e Impuestos', type: 'expense', bucket: 'needs', icon: 'shield-check', color: '#8B5CF6' },

  // Gastos - Deseos (30%)
  { id: 'cat_res', name: 'Restaurantes y Salidas', type: 'expense', bucket: 'wants', icon: 'utensils', color: '#F43F5E' },
  { id: 'cat_ent', name: 'Entretenimiento y Streaming', type: 'expense', bucket: 'wants', icon: 'film', color: '#A855F7' },
  { id: 'cat_com', name: 'Compras y Ropa', type: 'expense', bucket: 'wants', icon: 'shopping-bag', color: '#14B8A6' },
  { id: 'cat_via', name: 'Viajes y Vacaciones', type: 'expense', bucket: 'wants', icon: 'plane', color: '#06B6D4' },
  { id: 'cat_per', name: 'Cuidado Personal y Gym', type: 'expense', bucket: 'wants', icon: 'dumbbell', color: '#E11D48' },

  // Gastos - Ahorro / Inversión / Deuda (20%)
  { id: 'cat_inv', name: 'Inversiones y Fondos', type: 'expense', bucket: 'savings', icon: 'trending-up', color: '#059669' },
  { id: 'cat_pde', name: 'Pago de Deudas', type: 'expense', bucket: 'savings', icon: 'credit-card', color: '#D97706' },
  { id: 'cat_aho', name: 'Aporte a Metas / Alcancía', type: 'expense', bucket: 'savings', icon: 'piggy-bank', color: '#2563EB' },

  // Ingresos
  { id: 'cat_ing_sal', name: 'Salario / Sueldo Principal', type: 'income', bucket: 'income', icon: 'briefcase', color: '#10B981' },
  { id: 'cat_ing_fre', name: 'Freelance y Consultorías', type: 'income', bucket: 'income', icon: 'laptop', color: '#06B6D4' },
  { id: 'cat_ing_ren', name: 'Rendimientos / Dividendos', type: 'income', bucket: 'income', icon: 'line-chart', color: '#8B5CF6' },
  { id: 'cat_ing_otr', name: 'Otros Ingresos / Reembolsos', type: 'income', bucket: 'income', icon: 'plus-circle', color: '#34D399' }
];

export const INITIAL_ACCOUNTS = [
  {
    id: 'acc_main',
    name: 'Cuenta Principal (Banco BBVA)',
    type: 'checking',
    balance: 3450.00,
    currency: 'USD',
    color: '#3B82F6',
    icon: 'building-2',
    isAsset: true
  },
  {
    id: 'acc_sav',
    name: 'Fondo de Emergencia (Ahorros High-Yield)',
    type: 'savings',
    balance: 8200.00,
    currency: 'USD',
    color: '#10B981',
    icon: 'shield',
    isAsset: true
  },
  {
    id: 'acc_inv',
    name: 'Portafolio de Inversión (S&P 500 / ETFs)',
    type: 'investment',
    balance: 14500.00,
    currency: 'USD',
    color: '#8B5CF6',
    icon: 'trending-up',
    isAsset: true
  },
  {
    id: 'acc_cash',
    name: 'Efectivo en Billetera',
    type: 'cash',
    balance: 180.00,
    currency: 'USD',
    color: '#F59E0B',
    icon: 'banknote',
    isAsset: true
  },
  {
    id: 'acc_cc_visa',
    name: 'Tarjeta Visa Signature',
    type: 'credit',
    balance: -840.00, // Deuda actual
    creditLimit: 4000.00,
    cutoffDay: 15,
    dueDay: 5,
    currency: 'USD',
    color: '#F43F5E',
    icon: 'credit-card',
    isAsset: false
  }
];

export function generateInitialTransactions() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  return [
    {
      id: 'tx_1',
      type: 'income',
      amount: 3200.00,
      categoryId: 'cat_ing_sal',
      accountId: 'acc_main',
      date: new Date(y, m, 1, 9, 0).toISOString(),
      merchant: 'Empresa Empleadora',
      note: 'Nómina mensual sueldo base',
      tags: ['salario', 'trabajo'],
      isRecurring: true
    },
    {
      id: 'tx_2',
      type: 'expense',
      amount: 950.00,
      categoryId: 'cat_viv',
      accountId: 'acc_main',
      date: new Date(y, m, 2, 10, 30).toISOString(),
      merchant: 'Propietario Alquiler',
      note: 'Alquiler departamento mensual',
      tags: ['fijo', 'vivienda'],
      isRecurring: true
    },
    {
      id: 'tx_3',
      type: 'expense',
      amount: 140.00,
      categoryId: 'cat_ser',
      accountId: 'acc_main',
      date: new Date(y, m, 4, 14, 0).toISOString(),
      merchant: 'Compañía de Luz y Fibra',
      note: 'Internet alta velocidad y electricidad',
      tags: ['servicios'],
      isRecurring: true
    },
    {
      id: 'tx_4',
      type: 'expense',
      amount: 220.00,
      categoryId: 'cat_sup',
      accountId: 'acc_cc_visa',
      date: new Date(y, m, d - 4, 18, 15).toISOString(),
      merchant: 'Supermercado Central',
      note: 'Compra quincenal de víveres y despensa',
      tags: ['comida', 'esencial'],
      isRecurring: false
    },
    {
      id: 'tx_5',
      type: 'expense',
      amount: 65.00,
      categoryId: 'cat_res',
      accountId: 'acc_cc_visa',
      date: new Date(y, m, d - 2, 21, 0).toISOString(),
      merchant: 'Restaurante Gourmet La Toscana',
      note: 'Cena con amigos fin de semana',
      tags: ['ocio', 'amigos'],
      isRecurring: false
    },
    {
      id: 'tx_6',
      type: 'income',
      amount: 450.00,
      categoryId: 'cat_ing_fre',
      accountId: 'acc_main',
      date: new Date(y, m, d - 1, 16, 20).toISOString(),
      merchant: 'Cliente Tech Freelance',
      note: 'Diseño y optimización de base de datos',
      tags: ['freelance', 'extra'],
      isRecurring: false
    },
    {
      id: 'tx_7',
      type: 'expense',
      amount: 300.00,
      categoryId: 'cat_inv',
      accountId: 'acc_main',
      date: new Date(y, m, d, 11, 0).toISOString(),
      merchant: 'Broker Inversión ETF',
      note: 'Aporte periódico automatizado DCA S&P 500',
      tags: ['inversion', 'futuro'],
      isRecurring: true
    },
    {
      id: 'tx_8',
      type: 'expense',
      amount: 45.00,
      categoryId: 'cat_tra',
      accountId: 'acc_cash',
      date: new Date(y, m, d, 8, 30).toISOString(),
      merchant: 'Estación de Combustible',
      note: 'Carga de gasolina vehículo',
      tags: ['gasolina', 'auto'],
      isRecurring: false
    }
  ];
}

export const INITIAL_BUDGETS = [
  { id: 'b_1', categoryId: 'cat_viv', limit: 1000.00, period: 'monthly' },
  { id: 'b_2', categoryId: 'cat_ser', limit: 200.00, period: 'monthly' },
  { id: 'b_3', categoryId: 'cat_sup', limit: 550.00, period: 'monthly' },
  { id: 'b_4', categoryId: 'cat_tra', limit: 180.00, period: 'monthly' },
  { id: 'b_5', categoryId: 'cat_res', limit: 250.00, period: 'monthly' },
  { id: 'b_6', categoryId: 'cat_ent', limit: 120.00, period: 'monthly' },
  { id: 'b_7', categoryId: 'cat_com', limit: 200.00, period: 'monthly' }
];

export const INITIAL_GOALS = [
  {
    id: 'goal_1',
    name: 'Fondo de Reserva (6 meses de gastos)',
    targetAmount: 12000.00,
    currentAmount: 8200.00,
    deadline: '2026-12-31',
    icon: 'shield-check',
    color: '#10B981',
    category: 'Seguridad Financiera'
  },
  {
    id: 'goal_2',
    name: 'Vacaciones en Europa / Japón',
    targetAmount: 3500.00,
    currentAmount: 1850.00,
    deadline: '2027-06-15',
    icon: 'plane',
    color: '#06B6D4',
    category: 'Experiencias'
  },
  {
    id: 'goal_3',
    name: 'Enganche Inmueble / Depa',
    targetAmount: 25000.00,
    currentAmount: 9400.00,
    deadline: '2028-12-31',
    icon: 'home',
    color: '#8B5CF6',
    category: 'Patrimonio'
  }
];

export const INITIAL_DEBTS = [
  {
    id: 'debt_1',
    name: 'Saldo Tarjeta Visa Signature',
    totalAmount: 840.00,
    interestRate: 28.5, // 28.5% TAE
    minimumPayment: 60.00,
    dueDate: '2026-09-05',
    category: 'Tarjeta de Crédito',
    color: '#F43F5E'
  },
  {
    id: 'debt_2',
    name: 'Préstamo Personal Automotriz',
    totalAmount: 4200.00,
    interestRate: 9.8,
    minimumPayment: 210.00,
    dueDate: '2026-09-18',
    category: 'Crédito Vehicular',
    color: '#F59E0B'
  }
];
