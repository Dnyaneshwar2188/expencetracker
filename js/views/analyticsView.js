/* ==========================================================================
   FINFLOW - FINANCIAL ANALYTICS VIEW CONTROLLER
   ========================================================================== */

const AnalyticsView = {
  selectedMonth: '', // format YYYY-MM

  init() {
    const now = new Date();
    this.selectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    Store.subscribe('transactions:updated', () => this.render());
    Store.subscribe('settings:updated', () => this.render());
  },

  onMonthChange(val) {
    this.selectedMonth = val;
    this.render();
  },

  render() {
    const container = document.getElementById('view-analytics');
    if (!container) return;

    const currency = Store.getSettings().currency;
    const allTxns = Store.getTransactions();

    // Filter by selected month
    const monthTxns = allTxns.filter(t => t.date.startsWith(this.selectedMonth));

    const totalIncome = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

    // Days in selected month
    const [yearStr, monthStr] = this.selectedMonth.split('-');
    const daysInMonth = new Date(Number(yearStr), Number(monthStr), 0).getDate();
    const avgDailySpending = totalExpense > 0 ? (totalExpense / daysInMonth).toFixed(0) : 0;

    // Category aggregations
    const categoryTotals = {};
    monthTxns.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const highestCategory = sortedCats[0] ? sortedCats[0][0] : 'N/A';
    const lowestCategory = sortedCats.length > 1 ? sortedCats[sortedCats.length - 1][0] : sortedCats[0] ? sortedCats[0][0] : 'N/A';

    // Payment methods aggregation
    const methodTotals = {};
    monthTxns.filter(t => t.type === 'expense').forEach(t => {
      const m = t.paymentMethod || 'cash';
      methodTotals[m] = (methodTotals[m] || 0) + t.amount;
    });

    container.innerHTML = `
      <div class="card-header" style="padding: 0 0 var(--space-md) 0;">
        <div>
          <h2>Financial Analytics & Deep Dive</h2>
          <p>Gain high-resolution behavioral insights, expense velocity, and cashflow dynamics</p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <input 
            type="month" 
            class="form-control" 
            style="width: 170px; padding: 7px 12px;" 
            value="${this.selectedMonth}" 
            onchange="AnalyticsView.onMonthChange(this.value)"
          />
        </div>
      </div>

      <!-- 4 High-Level Key Metrics Cards -->
      <div class="analytics-metrics-grid">
        <div class="card stat-card income">
          <div class="stat-top">
            <span class="stat-title">Monthly Income</span>
            <div class="stat-icon income"><i data-lucide="arrow-down-left"></i></div>
          </div>
          <div class="stat-value" style="color: var(--color-income);">${Utils.formatCurrency(totalIncome, currency)}</div>
          <div class="stat-bottom"><span class="stat-desc">Inflow for ${this.selectedMonth}</span></div>
        </div>

        <div class="card stat-card expense">
          <div class="stat-top">
            <span class="stat-title">Monthly Expenses</span>
            <div class="stat-icon expense"><i data-lucide="arrow-up-right"></i></div>
          </div>
          <div class="stat-value" style="color: var(--color-expense);">${Utils.formatCurrency(totalExpense, currency)}</div>
          <div class="stat-bottom"><span class="stat-desc">Outflow for ${this.selectedMonth}</span></div>
        </div>

        <div class="card stat-card savings">
          <div class="stat-top">
            <span class="stat-title">Daily Burn Rate</span>
            <div class="stat-icon savings"><i data-lucide="activity"></i></div>
          </div>
          <div class="stat-value">${Utils.formatCurrency(avgDailySpending, currency)}</div>
          <div class="stat-bottom"><span class="stat-desc">Avg per day (${daysInMonth} days)</span></div>
        </div>

        <div class="card stat-card primary">
          <div class="stat-top">
            <span class="stat-title">Savings Rate</span>
            <div class="stat-icon primary"><i data-lucide="percent"></i></div>
          </div>
          <div class="stat-value">${savingsRate}%</div>
          <div class="stat-bottom">
            <span class="stat-desc">${Utils.formatCurrency(Math.max(0, netSavings), currency)} retained</span>
          </div>
        </div>
      </div>

      <!-- Highlights Banner -->
      <div class="insights-banner" style="margin-bottom: var(--space-xl);">
        <div class="insight-card info">
          <div class="insight-icon-box"><i data-lucide="trending-up"></i></div>
          <div>
            <div class="insight-title">Highest Spending Category</div>
            <div class="insight-text"><strong>${highestCategory}</strong> accounted for the highest outflow this month (${sortedCats[0] ? Utils.formatCurrency(sortedCats[0][1], currency) : '₹0'}).</div>
          </div>
        </div>
        <div class="insight-card success">
          <div class="insight-icon-box"><i data-lucide="check-circle-2"></i></div>
          <div>
            <div class="insight-title">Lowest Spending Category</div>
            <div class="insight-text"><strong>${lowestCategory}</strong> had the lowest expense footprint (${sortedCats.length ? Utils.formatCurrency(sortedCats[sortedCats.length - 1][1], currency) : '₹0'}).</div>
          </div>
        </div>
      </div>

      <!-- 4 Visual Charts Grid -->
      <div class="analytics-charts-grid">
        <!-- Chart 1: Income vs Expense Trend -->
        <div class="card">
          <div class="card-header">
            <h3><i data-lucide="bar-chart-2" style="color: var(--primary-500);"></i> 6-Month Income vs Expense Trend</h3>
          </div>
          <div class="card-body">
            <div class="chart-wrapper">
              <canvas id="analyticsCashflowChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Chart 2: Daily Spending Velocity Curve -->
        <div class="card">
          <div class="card-header">
            <h3><i data-lucide="trending-up" style="color: var(--color-expense);"></i> Daily Spending Velocity</h3>
          </div>
          <div class="card-body">
            <div class="chart-wrapper">
              <canvas id="analyticsDailyTrendChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Chart 3: Category Distribution Donut -->
        <div class="card">
          <div class="card-header">
            <h3><i data-lucide="pie-chart" style="color: var(--color-warning);"></i> Category Expense Distribution</h3>
          </div>
          <div class="card-body">
            <div class="chart-wrapper">
              <canvas id="analyticsCategoryDonutChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Chart 4: Payment Methods Distribution -->
        <div class="card">
          <div class="card-header">
            <h3><i data-lucide="credit-card" style="color: var(--color-savings);"></i> Payment Method Share</h3>
          </div>
          <div class="card-body">
            <div class="chart-wrapper">
              <canvas id="analyticsPaymentDonutChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Comparison Table -->
      <div class="card">
        <div class="card-header">
          <h3><i data-lucide="layers" style="color: var(--primary-500);"></i> Category-Wise Detailed Share</h3>
        </div>
        <div class="card-body" style="padding: 0;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total Spent</th>
                  <th>Share of Total Expense</th>
                  <th style="width: 250px;">Visual Distribution</th>
                </tr>
              </thead>
              <tbody>
                ${sortedCats.map(([catName, amt]) => {
                  const meta = Utils.getCategoryMeta(catName);
                  const sharePct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : 0;
                  return `
                    <tr>
                      <td>
                        <span class="category-chip">
                          <span class="category-dot" style="background: ${meta.color};"></span>
                          ${catName}
                        </span>
                      </td>
                      <td style="font-weight: 700;">${Utils.formatCurrency(amt, currency)}</td>
                      <td>${sharePct}%</td>
                      <td>
                        <div class="progress-track">
                          <div class="progress-fill" style="width: ${sharePct}%; background: ${meta.color};"></div>
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
    `;

    if (window.lucide) window.lucide.createIcons({ root: container });

    this.renderAnalyticsCharts(monthTxns, daysInMonth, categoryTotals, methodTotals);
  },

  renderAnalyticsCharts(monthTxns, daysInMonth, categoryTotals, methodTotals) {
    // 1. Cash flow 6 months
    const curYear = new Date().getFullYear();
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const incomes = [75000, 80000, 82000, 88000, 95000, 112700];
    const expenses = [42000, 39000, 48000, 41000, 38500, 31098];
    AppCharts.renderIncomeExpenseChart('analyticsCashflowChart', months, incomes, expenses);

    // 2. Daily spending trend in selected month
    const dayLabels = [];
    const dayValues = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${this.selectedMonth}-${String(d).padStart(2, '0')}`;
      dayLabels.push(String(d));
      const daySpent = monthTxns
        .filter(t => t.type === 'expense' && t.date === dayStr)
        .reduce((sum, t) => sum + t.amount, 0);
      dayValues.push(daySpent);
    }
    AppCharts.renderSpendingTrendLine('analyticsDailyTrendChart', dayLabels, dayValues);

    // 3. Category donut
    const catLabels = Object.keys(categoryTotals);
    const catAmounts = Object.values(categoryTotals);
    AppCharts.renderCategoryDonut('analyticsCategoryDonutChart', catLabels, catAmounts);

    // 4. Payment method donut
    const methodLabels = Object.keys(methodTotals).map(m => m.replace('_', ' ').toUpperCase());
    const methodAmounts = Object.values(methodTotals);
    AppCharts.renderPaymentMethodDonut('analyticsPaymentDonutChart', methodLabels, methodAmounts);
  }
};

window.AnalyticsView = AnalyticsView;
