/* ==========================================================================
   FINFLOW - CALENDAR VIEW CONTROLLER
   ========================================================================== */

const CalendarView = {
  currentDate: new Date(),
  selectedDateStr: '',

  init() {
    Store.subscribe('transactions:updated', () => this.render());
    Store.subscribe('settings:updated', () => this.render());
  },

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  },

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  },

  goToToday() {
    this.currentDate = new Date();
    this.render();
  },

  render() {
    const container = document.getElementById('view-calendar');
    if (!container) return;

    const currency = Store.getSettings().currency;
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthName = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayStr = new Date().toISOString().split('T')[0];
    const txns = Store.getTransactions();

    // Map transactions by date
    const txnsByDate = {};
    txns.forEach(t => {
      if (!txnsByDate[t.date]) txnsByDate[t.date] = { income: 0, expense: 0, items: [] };
      if (t.type === 'income') txnsByDate[t.date].income += t.amount;
      if (t.type === 'expense') txnsByDate[t.date].expense += t.amount;
      txnsByDate[t.date].items.push(t);
    });

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    container.innerHTML = `
      <div class="card-header" style="padding: 0 0 var(--space-md) 0;">
        <div>
          <h2>Financial Calendar</h2>
          <p>Inspect cashflow day-by-day and identify high-spending clusters</p>
        </div>
        <div style="display: flex; gap: var(--space-xs);">
          <button class="btn btn-outline btn-sm" onclick="CalendarView.prevMonth()">
            <i data-lucide="chevron-left"></i>
          </button>
          <button class="btn btn-outline btn-sm" onclick="CalendarView.goToToday()">Today</button>
          <button class="btn btn-outline btn-sm" onclick="CalendarView.nextMonth()">
            <i data-lucide="chevron-right"></i>
          </button>
        </div>
      </div>

      <div class="calendar-container">
        <div class="calendar-header">
          <h3 style="font-size: 1.4rem;">${monthName}</h3>
          <div style="display: flex; gap: var(--space-md); font-size: 0.85rem;">
            <span style="display: flex; align-items: center; gap: 4px;">
              <span class="category-dot" style="background: var(--color-income);"></span> Income Inflow
            </span>
            <span style="display: flex; align-items: center; gap: 4px;">
              <span class="category-dot" style="background: var(--color-expense);"></span> Expense Outflow
            </span>
          </div>
        </div>

        <div class="calendar-grid">
          ${dayLabels.map(d => `<div class="calendar-day-label">${d}</div>`).join('')}

          <!-- Previous month padding days -->
          ${Array.from({ length: firstDayIndex }).map((_, i) => {
            const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
            return `<div class="calendar-cell other-month"><div class="cell-day-number">${dayNum}</div></div>`;
          }).join('')}

          <!-- Days of Current Month -->
          ${Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const data = txnsByDate[dateStr];
            const hasExpense = data && data.expense > 0;
            const hasIncome = data && data.income > 0;

            return `
              <div class="calendar-cell ${isToday ? 'today' : ''}" onclick="CalendarView.openDayDetails('${dateStr}')">
                <div class="cell-day-number">${dayNum}</div>
                <div class="cell-spending-badges">
                  ${hasIncome ? `
                    <div class="cell-badge income">+${Utils.formatCurrency(data.income, currency)}</div>
                  ` : ''}
                  ${hasExpense ? `
                    <div class="cell-badge expense">-${Utils.formatCurrency(data.expense, currency)}</div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ root: container });
  },

  openDayDetails(dateStr) {
    this.selectedDateStr = dateStr;
    const txns = Store.getTransactions().filter(t => t.date === dateStr);
    const currency = Store.getSettings().currency;

    const dayIncome = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const dayExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const modalBody = `
      <div style="margin-bottom: var(--space-md); padding: 12px; background: var(--bg-surface); border-radius: var(--radius-md); display: flex; justify-content: space-around; text-align: center;">
        <div>
          <div style="font-size: 0.75rem; color: var(--text-tertiary);">Income</div>
          <div style="font-weight: 700; color: var(--color-income); font-size: 1.1rem;">+${Utils.formatCurrency(dayIncome, currency)}</div>
        </div>
        <div style="border-left: 1px solid var(--border-light);"></div>
        <div>
          <div style="font-size: 0.75rem; color: var(--text-tertiary);">Expenses</div>
          <div style="font-weight: 700; color: var(--color-expense); font-size: 1.1rem;">-${Utils.formatCurrency(dayExpense, currency)}</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
        <h4 style="font-size: 1rem;">Transactions (${txns.length})</h4>
        <button class="btn btn-primary btn-sm" onclick="App.closeGenericModal(); App.openTransactionModal('expense', null, '${dateStr}')">
          <i data-lucide="plus"></i> Add for this day
        </button>
      </div>

      ${txns.length === 0 ? `
        <p style="text-align: center; color: var(--text-tertiary); padding: 24px;">No transactions recorded for this date.</p>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${txns.map(t => {
            const isInc = t.type === 'income';
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
                <div>
                  <div style="font-weight: 600; font-size: 0.9rem;">${t.merchant || t.description || t.category}</div>
                  <div style="font-size: 0.75rem; color: var(--text-tertiary);">${t.category} • ${t.time || ''}</div>
                </div>
                <div class="transaction-amount-text ${isInc ? 'income' : 'expense'}">
                  ${isInc ? '+' : '-'}${Utils.formatCurrency(t.amount, currency)}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    App.openGenericModal({
      title: `Transactions on ${Utils.formatDate(dateStr)}`,
      bodyHtml: modalBody
    });
  }
};

window.CalendarView = CalendarView;
