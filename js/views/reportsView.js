/* ==========================================================================
   FINFLOW - FINANCIAL REPORTS & STATEMENTS VIEW CONTROLLER
   ========================================================================== */

const ReportsView = {
  selectedYear: 2026,
  selectedMonth: 10,

  init() {
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    Store.subscribe('transactions:updated', () => this.render());
    Store.subscribe('settings:updated', () => this.render());
  },

  onYearMonthChange(year, month) {
    this.selectedYear = Number(year);
    this.selectedMonth = Number(month);
    this.render();
  },

  render() {
    const container = document.getElementById('view-reports');
    if (!container) return;

    const currency = Store.getSettings().currency;
    const allTxns = Store.getTransactions();

    const monthStr = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}`;
    const monthTxns = allTxns.filter(t => t.date.startsWith(monthStr));

    const totalIncome = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

    // Category breakdown
    const catBreakdown = {};
    monthTxns.filter(t => t.type === 'expense').forEach(t => {
      catBreakdown[t.category] = (catBreakdown[t.category] || 0) + t.amount;
    });

    const sortedCats = Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthLabel = `${monthNames[this.selectedMonth - 1]} ${this.selectedYear}`;

    container.innerHTML = `
      <div class="card-header" style="padding: 0 0 var(--space-md) 0;">
        <div>
          <h2>Financial Reports & Statements</h2>
          <p>Generate formal monthly income statements, category audits, and exportable documentation</p>
        </div>
      </div>

      <!-- Generator Toolbar -->
      <div class="report-generator-bar">
        <div style="display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap;">
          <label style="font-weight: 600; font-size: 0.9rem;">Statement Period:</label>
          <select class="filter-select" onchange="ReportsView.onYearMonthChange(ReportsView.selectedYear, this.value)">
            ${monthNames.map((m, idx) => `
              <option value="${idx + 1}" ${this.selectedMonth === idx + 1 ? 'selected' : ''}>${m}</option>
            `).join('')}
          </select>
          <select class="filter-select" onchange="ReportsView.onYearMonthChange(this.value, ReportsView.selectedMonth)">
            <option value="2025" ${this.selectedYear === 2025 ? 'selected' : ''}>2025</option>
            <option value="2026" ${this.selectedYear === 2026 ? 'selected' : ''}>2026</option>
            <option value="2027" ${this.selectedYear === 2027 ? 'selected' : ''}>2027</option>
          </select>
        </div>

        <div style="display: flex; gap: var(--space-xs);">
          <button class="btn btn-outline" onclick="ReportsView.exportCSV()">
            <i data-lucide="download"></i> Export CSV
          </button>
          <button class="btn btn-primary" onclick="window.print()">
            <i data-lucide="printer"></i> Print / Save PDF
          </button>
        </div>
      </div>

      <!-- Formal Printable Statement Sheet -->
      <div class="printable-report-card">
        <!-- Document Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--border-light); padding-bottom: var(--space-lg); margin-bottom: var(--space-xl);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <div class="brand-icon-box" style="width: 32px; height: 32px; font-size: 0.9rem;"><i data-lucide="activity"></i></div>
              <h2 style="font-size: 1.6rem; letter-spacing: -0.02em;">FinFlow Financial Statement</h2>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-tertiary);">Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary-600);">${currentMonthLabel}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">${Store.getSettings().userName || 'Account Holder'}</div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">${Store.getSettings().userEmail || ''}</div>
          </div>
        </div>

        <!-- High-level Executive Summary Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); margin-bottom: var(--space-xl); background: var(--bg-surface); padding: var(--space-lg); border-radius: var(--radius-lg);">
          <div>
            <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-tertiary); font-weight: 700;">Total Inflows</div>
            <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--color-income);">${Utils.formatCurrency(totalIncome, currency)}</div>
          </div>
          <div>
            <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-tertiary); font-weight: 700;">Total Outflows</div>
            <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--color-expense);">${Utils.formatCurrency(totalExpense, currency)}</div>
          </div>
          <div>
            <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-tertiary); font-weight: 700;">Net Surplus / Savings</div>
            <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: ${netSavings >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">${Utils.formatCurrency(netSavings, currency)}</div>
          </div>
          <div>
            <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-tertiary); font-weight: 700;">Savings Rate</div>
            <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--color-savings);">${savingsRate}%</div>
          </div>
        </div>

        <!-- Category Outflow Breakdown Table -->
        <h4 style="font-size: 1.1rem; margin-bottom: var(--space-sm);">Expense Breakdown by Category</h4>
        <div class="table-responsive" style="margin-bottom: var(--space-xl);">
          <table class="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style="text-align: right;">Spent Amount</th>
                <th style="text-align: right;">Percentage of Expenses</th>
              </tr>
            </thead>
            <tbody>
              ${sortedCats.length === 0 ? `
                <tr><td colspan="3" style="text-align: center; color: var(--text-tertiary); padding: 18px;">No expenses recorded in ${currentMonthLabel}.</td></tr>
              ` : sortedCats.map(([cat, amt]) => {
                const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : 0;
                return `
                  <tr>
                    <td><strong>${cat}</strong></td>
                    <td style="text-align: right; font-weight: 700;">${Utils.formatCurrency(amt, currency)}</td>
                    <td style="text-align: right;">${pct}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Ledger Entries Table -->
        <h4 style="font-size: 1.1rem; margin-bottom: var(--space-sm);">Itemized Ledger (${monthTxns.length} Transactions)</h4>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Method</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${monthTxns.length === 0 ? `
                <tr><td colspan="5" style="text-align: center; color: var(--text-tertiary); padding: 18px;">No transactions recorded for this period.</td></tr>
              ` : monthTxns.map(t => {
                const isInc = t.type === 'income';
                return `
                  <tr>
                    <td>${Utils.formatShortDate(t.date)}</td>
                    <td><strong>${t.merchant || t.description}</strong></td>
                    <td>${t.category}</td>
                    <td style="text-transform: capitalize;">${(t.paymentMethod || 'cash').replace('_', ' ')}</td>
                    <td style="text-align: right; font-weight: 700; color: ${isInc ? 'var(--color-income)' : 'var(--color-expense)'};">
                      ${isInc ? '+' : '-'}${Utils.formatCurrency(t.amount, currency)}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top: var(--space-xl); text-align: center; font-size: 0.78rem; color: var(--text-tertiary); border-top: 1px solid var(--border-subtle); padding-top: var(--space-md);">
          FinFlow Personal Finance Management • Confidential Financial Document
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ root: container });
  },

  exportCSV() {
    const monthStr = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}`;
    const txns = Store.getTransactions().filter(t => t.date.startsWith(monthStr));
    const rows = txns.map(t => ({
      Date: t.date,
      Type: t.type,
      Category: t.category,
      Amount: t.amount,
      Method: t.paymentMethod,
      Description: t.merchant || t.description
    }));
    Utils.exportToCsv(`finflow_statement_${monthStr}`, rows);
  }
};

window.ReportsView = ReportsView;
