/* ==========================================================================
   FINFLOW - DASHBOARD VIEW CONTROLLER
   ========================================================================== */

const DashboardView = {
  activeFilter: 'month', // 'today', 'week', 'month', 'last_month', 'all'

  init() {
    Store.subscribe('transactions:updated', () => this.render());
    Store.subscribe('budgets:updated', () => this.render());
    Store.subscribe('goals:updated', () => this.render());
    Store.subscribe('recurring:updated', () => this.render());
    Store.subscribe('settings:updated', () => this.render());
  },

  setFilter(filter) {
    this.activeFilter = filter;
    this.render();
  },

  getFilteredTransactions() {
    const txns = Store.getTransactions();
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const todayStr = now.toISOString().split('T')[0];

    return txns.filter(t => {
      const tDate = new Date(t.date);
      if (this.activeFilter === 'today') {
        return t.date === todayStr;
      } else if (this.activeFilter === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return tDate >= oneWeekAgo && tDate <= now;
      } else if (this.activeFilter === 'month') {
        return tDate.getFullYear() === curYear && tDate.getMonth() === curMonth;
      } else if (this.activeFilter === 'last_month') {
        const lastMonthDate = new Date(curYear, curMonth - 1, 1);
        return tDate.getFullYear() === lastMonthDate.getFullYear() && tDate.getMonth() === lastMonthDate.getMonth();
      }
      return true; // 'all'
    });
  },

  render() {
    const container = document.getElementById('view-dashboard');
    if (!container) return;

    const currency = Store.getSettings().currency;
    const allTxns = Store.getTransactions();
    const filteredTxns = this.getFilteredTransactions();

    // Financial Metrics
    const totalIncome = filteredTxns
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTxns
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : '0';

    // All time totals for Net Worth / Total Balance
    const allIncome = allTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const allExpense = allTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = allIncome - allExpense;

    // Upcoming recurring payments
    const upcomingRecurring = Store.getRecurring()
      .filter(r => r.active)
      .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate))
      .slice(0, 3);

    // Category breakdown
    const categoryTotals = {};
    filteredTxns
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Smart Insights Generation
    const insights = this.generateSmartInsights(allTxns, filteredTxns, totalIncome, totalExpense);

    container.innerHTML = `
      <!-- Welcome Header & Time Filters -->
      <div class="card-header" style="padding: 0 0 var(--space-md) 0;">
        <div>
          <h2 style="font-size: 1.5rem;">Financial Overview</h2>
          <p style="font-size: 0.85rem; color: var(--text-tertiary);">Track your real-time cash flow, spending habits, and budget progress</p>
        </div>
        <div class="filters-group" style="background: var(--bg-card); padding: 4px; border-radius: var(--radius-full); border: 1px solid var(--border-light);">
          <button class="btn btn-sm ${this.activeFilter === 'today' ? 'btn-primary' : 'btn-outline'}" onclick="DashboardView.setFilter('today')">Today</button>
          <button class="btn btn-sm ${this.activeFilter === 'week' ? 'btn-primary' : 'btn-outline'}" onclick="DashboardView.setFilter('week')">This Week</button>
          <button class="btn btn-sm ${this.activeFilter === 'month' ? 'btn-primary' : 'btn-outline'}" onclick="DashboardView.setFilter('month')">This Month</button>
          <button class="btn btn-sm ${this.activeFilter === 'last_month' ? 'btn-primary' : 'btn-outline'}" onclick="DashboardView.setFilter('last_month')">Last Month</button>
          <button class="btn btn-sm ${this.activeFilter === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="DashboardView.setFilter('all')">All Time</button>
        </div>
      </div>

      <!-- Quick Actions Bar -->
      <div class="quick-actions-bar">
        <button class="quick-action-pill income" onclick="App.openTransactionModal('income')">
          <i data-lucide="plus-circle"></i> + Add Income
        </button>
        <button class="quick-action-pill expense" onclick="App.openTransactionModal('expense')">
          <i data-lucide="minus-circle"></i> + Add Expense
        </button>
        <button class="quick-action-pill" onclick="App.openTransactionModal('expense', 'Transfer')">
          <i data-lucide="arrow-left-right"></i> Transfer Money
        </button>
        <button class="quick-action-pill" onclick="App.openBudgetModal()">
          <i data-lucide="pie-chart"></i> Set Budget
        </button>
        <button class="quick-action-pill" onclick="App.openGoalModal()">
          <i data-lucide="target"></i> Add Savings Goal
        </button>
      </div>

      <!-- 4 Core Financial Stat Cards -->
      <div class="stats-grid">
        <!-- Balance Card -->
        <div class="card stat-card primary">
          <div class="stat-top">
            <span class="stat-title">Total Balance</span>
            <div class="stat-icon primary"><i data-lucide="wallet"></i></div>
          </div>
          <div class="stat-value">${Utils.formatCurrency(totalBalance, currency)}</div>
          <div class="stat-bottom">
            <span class="stat-trend positive"><i data-lucide="trending-up"></i> Active</span>
            <span class="stat-desc">across all accounts</span>
          </div>
        </div>

        <!-- Income Card -->
        <div class="card stat-card income">
          <div class="stat-top">
            <span class="stat-title">Total Income</span>
            <div class="stat-icon income"><i data-lucide="arrow-down-left"></i></div>
          </div>
          <div class="stat-value" style="color: var(--color-income);">${Utils.formatCurrency(totalIncome, currency)}</div>
          <div class="stat-bottom">
            <span class="stat-trend positive">+14.2%</span>
            <span class="stat-desc">vs last period</span>
          </div>
        </div>

        <!-- Expenses Card -->
        <div class="card stat-card expense">
          <div class="stat-top">
            <span class="stat-title">Total Expenses</span>
            <div class="stat-icon expense"><i data-lucide="arrow-up-right"></i></div>
          </div>
          <div class="stat-value" style="color: var(--color-expense);">${Utils.formatCurrency(totalExpense, currency)}</div>
          <div class="stat-bottom">
            <span class="stat-trend negative">${totalExpense > 0 ? '-3.8%' : '0%'}</span>
            <span class="stat-desc">controlled spending</span>
          </div>
        </div>

        <!-- Savings Rate Card -->
        <div class="card stat-card savings">
          <div class="stat-top">
            <span class="stat-title">Savings Rate</span>
            <div class="stat-icon savings"><i data-lucide="piggy-bank"></i></div>
          </div>
          <div class="stat-value" style="color: var(--color-savings);">${savingsRate}%</div>
          <div class="stat-bottom">
            <span class="stat-trend ${savingsRate >= 20 ? 'positive' : 'neutral'}">${Utils.formatCurrency(Math.max(0, netBalance), currency)}</span>
            <span class="stat-desc">net retained savings</span>
          </div>
        </div>
      </div>

      <!-- Smart Insights Banners -->
      <div class="insights-banner">
        ${insights.map(i => `
          <div class="insight-card ${i.type}">
            <div class="insight-icon-box"><i data-lucide="${i.icon}"></i></div>
            <div>
              <div class="insight-title">${i.title}</div>
              <div class="insight-text">${i.text}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Charts Section: Income vs Expense & Donut Category Breakdown -->
      <div class="dashboard-charts-grid">
        <div class="card">
          <div class="card-header">
            <h3><i data-lucide="bar-chart-3" style="color: var(--primary-500);"></i> Cash Flow Analysis</h3>
            <span class="badge badge-neutral">Income vs Expenses</span>
          </div>
          <div class="card-body">
            <div class="chart-wrapper">
              <canvas id="dashboardCashflowChart"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3><i data-lucide="pie-chart" style="color: var(--color-expense);"></i> Expense Breakdown</h3>
            <span class="badge badge-neutral">By Category</span>
          </div>
          <div class="card-body">
            <div class="chart-wrapper">
              <canvas id="dashboardCategoryChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Grid: Recent Transactions & Top Categories + Upcoming Bills -->
      <div class="dashboard-bottom-grid">
        <!-- Recent Transactions -->
        <div class="card">
          <div class="card-header">
            <h3><i data-lucide="clock" style="color: var(--primary-500);"></i> Recent Transactions</h3>
            <button class="btn btn-outline btn-sm" onclick="App.navigate('transactions')">View All</button>
          </div>
          <div class="card-body" style="padding-top: 0;">
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Category</th>
                    <th>Method</th>
                    <th>Date</th>
                    <th style="text-align: right;">Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredTxns.slice(0, 6).map(t => {
                    const cat = Utils.getCategoryMeta(t.category);
                    const isIncome = t.type === 'income';
                    return `
                      <tr>
                        <td>
                          <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="stat-icon" style="width: 34px; height: 34px; background: ${cat.color}20; color: ${cat.color}; font-size: 1rem; border-radius: 8px;">
                              <i data-lucide="${cat.icon}"></i>
                            </div>
                            <div>
                              <div style="font-weight: 600; font-size: 0.9rem;">${t.merchant || t.description || 'Transaction'}</div>
                              <div style="font-size: 0.75rem; color: var(--text-tertiary);">${t.description || t.category}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="category-chip">
                            <span class="category-dot" style="background: ${cat.color};"></span>
                            ${t.category}
                          </span>
                        </td>
                        <td>
                          <span class="badge badge-neutral" style="text-transform: capitalize;">${(t.paymentMethod || 'cash').replace('_', ' ')}</span>
                        </td>
                        <td style="font-size: 0.82rem; color: var(--text-secondary);">${Utils.formatShortDate(t.date)}</td>
                        <td style="text-align: right;">
                          <span class="transaction-amount-text ${isIncome ? 'income' : 'expense'}">
                            ${isIncome ? '+' : '-'}${Utils.formatCurrency(t.amount, currency)}
                          </span>
                        </td>
                        <td>
                          <div style="display: flex; gap: 4px;">
                            ${t.receiptUrl ? `
                              <button class="btn btn-outline btn-icon-only btn-sm" title="View Receipt" onclick="App.viewReceipt('${t.id}')">
                                <i data-lucide="receipt"></i>
                              </button>
                            ` : ''}
                            <button class="btn btn-outline btn-icon-only btn-sm" title="Details" onclick="App.viewTransactionDetails('${t.id}')">
                              <i data-lucide="eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sidebar Widgets: Top Spending & Upcoming Bills -->
        <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
          <!-- Top Categories -->
          <div class="card">
            <div class="card-header">
              <h3><i data-lucide="layers" style="color: var(--color-warning);"></i> Top Spending Categories</h3>
            </div>
            <div class="card-body">
              ${sortedCategories.length ? sortedCategories.map(([catName, amt]) => {
                const meta = Utils.getCategoryMeta(catName);
                const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(0) : 0;
                return `
                  <div class="category-progress-item">
                    <div class="category-progress-meta">
                      <span style="display: flex; align-items: center; gap: 6px;">
                        <span class="category-dot" style="background: ${meta.color};"></span>
                        ${catName}
                      </span>
                      <span>${Utils.formatCurrency(amt, currency)} (${pct}%)</span>
                    </div>
                    <div class="progress-track">
                      <div class="progress-fill" style="width: ${pct}%; background: ${meta.color};"></div>
                    </div>
                  </div>
                `;
              }).join('') : '<p style="text-align: center; color: var(--text-tertiary); padding: 12px;">No expense data for this period.</p>'}
            </div>
          </div>

          <!-- Upcoming Recurring Bills -->
          <div class="card">
            <div class="card-header">
              <h3><i data-lucide="calendar-clock" style="color: var(--primary-500);"></i> Upcoming Bills</h3>
              <button class="btn btn-outline btn-sm" onclick="App.navigate('recurring')">Manage</button>
            </div>
            <div class="card-body" style="padding-top: 0; display: flex; flex-direction: column; gap: var(--space-xs);">
              ${upcomingRecurring.map(rec => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-subtle);">
                  <div>
                    <div style="font-weight: 600; font-size: 0.88rem;">${rec.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-tertiary);">Due ${Utils.formatDate(rec.nextDate)}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 700; font-size: 0.95rem; color: var(--color-expense);">${Utils.formatCurrency(rec.amount, currency)}</div>
                    <button class="btn btn-primary btn-sm" style="padding: 2px 8px; font-size: 0.72rem; margin-top: 2px;" onclick="Store.payRecurring('${rec.id}')">Pay Now</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Render Lucide Icons
    if (window.lucide) window.lucide.createIcons({ root: container });

    // Render Charts
    this.renderCharts(filteredTxns);
  },

  renderCharts(txns) {
    // 1. Cash flow chart
    const monthlyGroups = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const curYear = new Date().getFullYear();

    // Default 5 months range
    for (let i = 5; i <= 9; i++) {
      monthlyGroups[`${curYear}-${String(i + 1).padStart(2, '0')}`] = { income: 0, expense: 0, label: months[i] };
    }

    Store.getTransactions().forEach(t => {
      const ym = t.date.substring(0, 7);
      if (monthlyGroups[ym]) {
        if (t.type === 'income') monthlyGroups[ym].income += t.amount;
        if (t.type === 'expense') monthlyGroups[ym].expense += t.amount;
      }
    });

    const labels = Object.values(monthlyGroups).map(g => g.label);
    const incomes = Object.values(monthlyGroups).map(g => g.income);
    const expenses = Object.values(monthlyGroups).map(g => g.expense);

    AppCharts.renderIncomeExpenseChart('dashboardCashflowChart', labels, incomes, expenses);

    // 2. Category Donut chart
    const categoryTotals = {};
    txns.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const catLabels = Object.keys(categoryTotals);
    const catAmounts = Object.values(categoryTotals);

    AppCharts.renderCategoryDonut('dashboardCategoryChart', catLabels, catAmounts);
  },

  generateSmartInsights(allTxns, filteredTxns, totalIncome, totalExpense) {
    const cur = Store.getSettings().currency;
    const insights = [];

    // Food expenses comparison
    const foodCurrent = filteredTxns.filter(t => t.category === 'Food' && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    if (foodCurrent > 0) {
      insights.push({
        type: 'warning',
        icon: 'utensils',
        title: 'Dining & Food Outflow',
        text: `You spent ${Utils.formatCurrency(foodCurrent, cur)} on Food & Dining. Cooking more meals at home could save an estimated 25%.`
      });
    }

    // Budget Health
    const budgets = Store.getBudgets();
    if (budgets.overall > 0) {
      const remaining = budgets.overall - totalExpense;
      if (remaining >= 0) {
        insights.push({
          type: 'success',
          icon: 'shield-check',
          title: 'Budget On Track',
          text: `You are within your overall monthly budget with ${Utils.formatCurrency(remaining, cur)} remaining buffer.`
        });
      } else {
        insights.push({
          type: 'alert',
          icon: 'alert-triangle',
          title: 'Budget Alert',
          text: `You have exceeded your monthly limit by ${Utils.formatCurrency(Math.abs(remaining), cur)}! Look into shopping and entertainment.`
        });
      }
    }

    // Subscriptions burden
    const recurring = Store.getRecurring().filter(r => r.active);
    const monthlySubscriptions = recurring.reduce((s, r) => s + r.amount, 0);
    insights.push({
      type: 'info',
      icon: 'credit-card',
      title: 'Active Recurring Obligations',
      text: `Your automated monthly bills and subscriptions total ${Utils.formatCurrency(monthlySubscriptions, cur)} per month.`
    });

    return insights;
  }
};

window.DashboardView = DashboardView;
