// Advanced Financial Intelligence and Calculation Engine

export class FinancialEngine {
  /**
   * Calculates Total Assets, Total Liabilities, and Net Worth (Patrimonio Neto)
   */
  static calculateNetWorth(accounts = []) {
    let assets = 0;
    let liabilities = 0;

    (accounts || []).forEach(acc => {
      const bal = Number(acc.balance) || 0;
      if (acc.type === 'credit') {
        // For credit cards, negative balance or absolute amount is liability
        const debt = bal < 0 ? Math.abs(bal) : (Number(acc.currentDebt) || 0);
        liabilities += debt;
      } else if (acc.isAsset !== false && bal >= 0) {
        assets += bal;
      } else if (bal < 0) {
        liabilities += Math.abs(bal);
      }
    });

    const netWorth = assets - liabilities;
    return {
      assets,
      liabilities,
      netWorth,
      debtToAssetRatio: assets > 0 ? Number(((liabilities / assets) * 100).toFixed(1)) : (liabilities > 0 ? 100 : 0)
    };
  }

  /**
   * Calculates Monthly Cashflow (Income vs Expense vs Savings Rate)
   */
  static calculateMonthlyFlow(transactions = [], month = new Date().getMonth(), year = new Date().getFullYear()) {
    let totalIncome = 0;
    let totalExpense = 0;
    const categorySpending = {};

    (transactions || []).forEach(t => {
      const txDate = new Date(t.date);
      if (!isNaN(txDate.getTime()) && txDate.getMonth() === month && txDate.getFullYear() === year) {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') {
          totalIncome += amt;
        } else if (t.type === 'expense') {
          totalExpense += amt;
          categorySpending[t.categoryId] = (categorySpending[t.categoryId] || 0) + amt;
        }
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate: Number(savingsRate.toFixed(1)),
      categorySpending
    };
  }

  /**
   * Evaluates spending against the 50/30/20 Rule:
   * 50% Needs (Necesidades), 30% Wants (Deseos), 20% Savings/Investments/Debt Payoff (Ahorro/Deuda)
   */
  static calculate50_30_20(transactions, categories, month = new Date().getMonth(), year = new Date().getFullYear()) {
    const categoryBucketMap = new Map(categories.map(c => [c.id, c.bucket || 'wants']));
    
    let needs = 0;
    let wants = 0;
    let savings = 0;
    let income = 0;

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') {
          income += amt;
        } else if (t.type === 'expense') {
          const bucket = categoryBucketMap.get(t.categoryId) || 'wants';
          if (bucket === 'needs') needs += amt;
          else if (bucket === 'wants') wants += amt;
          else if (bucket === 'savings') savings += amt;
          else wants += amt;
        }
      }
    });

    const totalSpent = needs + wants + savings;
    const baseTotal = income > 0 ? income : (totalSpent > 0 ? totalSpent : 1);

    const needsPct = Number(((needs / baseTotal) * 100).toFixed(1));
    const wantsPct = Number(((wants / baseTotal) * 100).toFixed(1));
    const savingsPct = Number(((savings / baseTotal) * 100).toFixed(1));

    let advice = 'Tu distribución de gastos está equilibrada.';
    let status = 'good';

    if (needsPct > 55) {
      advice = 'Tus necesidades básicas superan el 50%. Revisa gastos fijos y servicios.';
      status = 'warning';
    } else if (wantsPct > 35) {
      advice = 'Tus gastos discrecionales (deseos) exceden el 30%. Modera salidas y compras.';
      status = 'warning';
    } else if (savingsPct < 15 && income > 0) {
      advice = 'Intenta destinar al menos el 20% hacia ahorro, inversiones o pago de deudas.';
      status = 'info';
    }

    return {
      income,
      needs: { amount: needs, percentage: needsPct, targetPct: 50 },
      wants: { amount: wants, percentage: wantsPct, targetPct: 30 },
      savings: { amount: savings, percentage: savingsPct, targetPct: 20 },
      advice,
      status
    };
  }

  /**
   * Calculates Runway (Months of Emergency Fund)
   */
  static calculateEmergencyRunway(liquidSavings, monthlyAverageExpense) {
    if (!monthlyAverageExpense || monthlyAverageExpense <= 0) return 12;
    const runwayMonths = liquidSavings / monthlyAverageExpense;
    return Number(runwayMonths.toFixed(1));
  }

  /**
   * Calculates Financial Health Score (0 to 100)
   */
  static calculateFinancialHealthScore({ savingsRate, runwayMonths, debtToAssetRatio, budgetAdherencePct }) {
    let score = 0;

    // Factor 1: Tasa de Ahorro (Max 30 pts)
    // 20%+ -> 30 pts; 10-19% -> 20 pts; 0-9% -> 10 pts; negative -> 0 pts
    if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate > 0) score += 10;

    // Factor 2: Fondo de Emergencia / Runway (Max 30 pts)
    // 6+ meses -> 30 pts; 3-5 meses -> 20 pts; 1-2 meses -> 10 pts; <1 mes -> 5 pts
    if (runwayMonths >= 6) score += 30;
    else if (runwayMonths >= 3) score += 20;
    else if (runwayMonths >= 1) score += 10;
    else score += 5;

    // Factor 3: Nivel de Endeudamiento (Max 25 pts)
    // < 20% -> 25 pts; 20-40% -> 18 pts; 40-60% -> 10 pts; > 60% -> 0 pts
    if (debtToAssetRatio < 20) score += 25;
    else if (debtToAssetRatio < 40) score += 18;
    else if (debtToAssetRatio < 60) score += 10;
    else score += 0;

    // Factor 4: Cumplimiento de Presupuestos (Max 15 pts)
    if (budgetAdherencePct >= 90) score += 15;
    else if (budgetAdherencePct >= 70) score += 10;
    else score += 5;

    let grade = 'Excelente';
    let color = '#10B981'; // Emerald
    let recommendation = '¡Excelente gestión! Tus finanzas son sólidas y resilientes.';

    if (score < 50) {
      grade = 'Crítico';
      color = '#F43F5E';
      recommendation = 'Prioridad: Reduce deudas caras y construye un fondo de emergencia mínimo.';
    } else if (score < 75) {
      grade = 'En Progreso';
      color = '#F59E0B';
      recommendation = 'Buen camino. Incrementa tu tasa de ahorro hacia el 20% e invierte el excedente.';
    } else if (score >= 90) {
      grade = 'Libertad Financiera';
      color = '#6366F1';
      recommendation = 'Nivel maestro. Enfócate en maximizar rendimientos de inversión pasiva.';
    }

    return { score, grade, color, recommendation };
  }

  /**
   * Simulates Debt Payoff: Snowball (Bola de Nieve) vs Avalanche (Avalancha)
   */
  static simulateDebtPayoff(debts, extraMonthlyPayment = 0) {
    if (!debts || debts.length === 0) {
      return { avalanche: { months: 0, totalInterest: 0 }, snowball: { months: 0, totalInterest: 0 } };
    }

    const simulate = (list) => {
      // Deep clone debts
      let workingDebts = list.map(d => ({
        ...d,
        balance: Number(d.totalAmount) || 0,
        rate: (Number(d.interestRate) || 0) / 100 / 12,
        minPay: Number(d.minimumPayment) || 20
      }));

      let months = 0;
      let totalInterest = 0;
      const maxMonths = 360; // 30 years limit

      while (workingDebts.some(d => d.balance > 0) && months < maxMonths) {
        months++;
        let availableExtra = Number(extraMonthlyPayment) || 0;

        // Apply interest and minimum payments
        for (let debt of workingDebts) {
          if (debt.balance <= 0) continue;

          const monthlyInterest = debt.balance * debt.rate;
          totalInterest += monthlyInterest;
          debt.balance += monthlyInterest;

          const payment = Math.min(debt.balance, debt.minPay);
          debt.balance -= payment;
        }

        // Apply extra payment to target priority debt
        for (let debt of workingDebts) {
          if (debt.balance > 0 && availableExtra > 0) {
            const extraPay = Math.min(debt.balance, availableExtra);
            debt.balance -= extraPay;
            availableExtra -= extraPay;
          }
        }
      }

      return {
        months,
        years: (months / 12).toFixed(1),
        totalInterest: Math.round(totalInterest)
      };
    };

    // Avalanche: Highest interest rate first
    const avalancheList = [...debts].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
    const avalancheResult = simulate(avalancheList);

    // Snowball: Lowest balance first
    const snowballList = [...debts].sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
    const snowballResult = simulate(snowballList);

    const interestSaved = Math.max(0, snowballResult.totalInterest - avalancheResult.totalInterest);

    return {
      avalanche: avalancheResult,
      snowball: snowballResult,
      interestSaved
    };
  }

  /**
   * Cash Flow Projection for 30 Days
   */
  static projectCashflow(currentLiquidBalance, recurringTransactions, daysAhead = 30) {
    const dailyPoints = [];
    let runningBalance = currentLiquidBalance;
    const today = new Date();

    for (let day = 0; day <= daysAhead; day++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() + day);

      // Check recurring items scheduled for this day of the month
      recurringTransactions.forEach(t => {
        const txDate = new Date(t.date);
        if (txDate.getDate() === checkDate.getDate()) {
          if (t.type === 'income') runningBalance += Number(t.amount) || 0;
          else if (t.type === 'expense') runningBalance -= Number(t.amount) || 0;
        }
      });

      dailyPoints.push({
        dayIndex: day,
        date: checkDate.toISOString().slice(0, 10),
        displayDate: checkDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        balance: runningBalance
      });
    }

    return dailyPoints;
  }

  /**
   * Generates a comprehensive breakdown of expenses & income with amounts, percentages, transaction counts,
   * top categories, average tickets, and diagnostics for any selected period.
   */
  static generateDetailedReport(transactions = [], categories = [], filterPeriod = 'this_month') {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter transactions by period
    const filteredTxs = (transactions || []).filter(t => {
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return false;

      if (filterPeriod === 'this_month') {
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      if (filterPeriod === 'prev_month') {
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      }
      if (filterPeriod === 'last_3_months') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return d >= threeMonthsAgo;
      }
      if (filterPeriod === 'all') {
        return true;
      }
      return true;
    });

    const categoryMap = new Map(categories.map(c => [c.id, c]));

    let totalExpense = 0;
    let totalIncome = 0;

    const expenseAgg = {};
    const incomeAgg = {};

    filteredTxs.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'expense') {
        totalExpense += amt;
        const catId = t.categoryId || 'cat_otros';
        if (!expenseAgg[catId]) expenseAgg[catId] = { amount: 0, count: 0 };
        expenseAgg[catId].amount += amt;
        expenseAgg[catId].count += 1;
      } else if (t.type === 'income') {
        totalIncome += amt;
        const catId = t.categoryId || 'cat_otros';
        if (!incomeAgg[catId]) incomeAgg[catId] = { amount: 0, count: 0 };
        incomeAgg[catId].amount += amt;
        incomeAgg[catId].count += 1;
      }
    });

    const buildBreakdown = (aggObj, totalSum) => {
      return Object.entries(aggObj).map(([catId, data]) => {
        const cat = categoryMap.get(catId) || {
          id: catId,
          name: 'Sin categoría / Otros',
          color: '#64748B',
          icon: 'tag',
          bucket: 'wants'
        };
        const percentage = totalSum > 0 ? Number(((data.amount / totalSum) * 100).toFixed(1)) : 0;
        const avgTicket = data.count > 0 ? Number((data.amount / data.count).toFixed(2)) : 0;

        return {
          categoryId: catId,
          name: cat.name,
          color: cat.color || '#6366F1',
          icon: cat.icon || 'tag',
          bucket: cat.bucket || 'wants',
          amount: data.amount,
          count: data.count,
          percentage,
          avgTicket
        };
      }).sort((a, b) => b.amount - a.amount);
    };

    const expenseBreakdown = buildBreakdown(expenseAgg, totalExpense);
    const incomeBreakdown = buildBreakdown(incomeAgg, totalIncome);

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Number(((netSavings / totalIncome) * 100).toFixed(1))) : 0;

    let daysCount = 30;
    if (filterPeriod === 'this_month') daysCount = Math.max(1, now.getDate());
    else if (filterPeriod === 'last_3_months') daysCount = 90;

    const dailyExpenseAvg = totalExpense > 0 ? Number((totalExpense / daysCount).toFixed(2)) : 0;
    const dailyIncomeAvg = totalIncome > 0 ? Number((totalIncome / daysCount).toFixed(2)) : 0;

    const expenseTxs = filteredTxs.filter(t => t.type === 'expense');
    const incomeTxs = filteredTxs.filter(t => t.type === 'income');

    return {
      filterPeriod,
      totalExpense,
      totalIncome,
      netSavings,
      savingsRate,
      expenseCount: expenseTxs.length,
      incomeCount: incomeTxs.length,
      avgExpenseTicket: expenseTxs.length > 0 ? Number((totalExpense / expenseTxs.length).toFixed(2)) : 0,
      avgIncomeTicket: incomeTxs.length > 0 ? Number((totalIncome / incomeTxs.length).toFixed(2)) : 0,
      dailyExpenseAvg,
      dailyIncomeAvg,
      topExpense: expenseBreakdown[0] || null,
      topIncome: incomeBreakdown[0] || null,
      expenseBreakdown,
      incomeBreakdown,
      filteredTxs
    };
  }
}
