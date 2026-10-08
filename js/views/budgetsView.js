/* ==========================================================================
   FINFLOW - BUDGET MANAGEMENT VIEW CONTROLLER
   ========================================================================== */

const BudgetsView = {
  init() {
    Store.subscribe('budgets:updated', () => this.render());
    Store.subscribe('transactions:updated', () => this.render());
    Store.subscribe('settings:updated', () => this.render());
  },

  render() {
    const container = document.getElementById('view-budgets');
    if (!container) return;

    const currency = Store.getSettings().currency;
    const budgets = Store.getBudgets();
    const txns = Store.getTransactions();

    const curMonth = new Date().toISOString().substring(0, 7); // '2026-10'
    const monthExpenses = txns.filter(t => t.type === 'expense' && t.date.startsWith(curMonth));

    const totalSpentThisMonth = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
    const overallBudget = budgets.overall || 50000;
    const overallSpentPct = overallBudget > 0 ? ((totalSpentThisMonth / overallBudget) * 100).toFixed(0) : 0;
    const overallRemaining = overallBudget - totalSpentThisMonth;

    // Remaining days in month calculation
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remainingDays = Math.max(1, lastDayOfMonth - now.getDate());
    const dailySafeSpend = overallRemaining > 0 ? (overallRemaining / remainingDays).toFixed(0) : 0;

    container.innerHTML = `
      <div class="card-header" style="padding: 0 0 var(--space-md) 0;">
        <div>
          <h2>Monthly Budget Planner</h2>
          <p>Monitor category caps, guardrails, and stay on track with smart spending thresholds</p>
        </div>
        <div style="display: flex; gap: var(--space-xs);">
          <button class="btn btn-outline" onclick="App.openEditOverallBudgetModal()">
            <i data-lucide="sliders"></i> Set Overall Budget
          </button>
          <button class="btn btn-primary" onclick="App.openBudgetModal()">
            <i data-lucide="plus"></i> Add Category Budget
          </button>
        </div>
      </div>

      <!-- Hero Overview Banner -->
      <div class="budget-hero-card">
        <div class="budget-hero-left">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span class="badge ${overallSpentPct >= 100 ? 'badge-expense' : overallSpentPct >= 80 ? 'badge-warning' : 'badge-income'}">
              ${overallSpentPct}% Utilized
            </span>
            <span style="font-size: 0.85rem; color: var(--text-tertiary);">${remainingDays} days remaining this month</span>
          </div>

          <h3 style="font-size: 1.8rem; margin-bottom: 4px;">
            ${Utils.formatCurrency(totalSpentThisMonth, currency)} <span style="font-size: 1.1rem; color: var(--text-tertiary); font-weight: normal;">/ ${Utils.formatCurrency(overallBudget, currency)}</span>
          </h3>

          <p style="margin-bottom: var(--space-md);">
            ${overallRemaining >= 0 
              ? `You have <strong>${Utils.formatCurrency(overallRemaining, currency)}</strong> safe budget remaining (${Utils.formatCurrency(dailySafeSpend, currency)}/day).`
              : `<span style="color: var(--color-expense); font-weight: bold;">You have exceeded your monthly limit by ${Utils.formatCurrency(Math.abs(overallRemaining), currency)}!</span>`
            }
          </p>

          <div class="progress-track" style="height: 12px;">
            <div class="progress-fill ${overallSpentPct >= 100 ? 'danger' : overallSpentPct >= 80 ? 'warning' : 'primary'}" style="width: ${Math.min(100, overallSpentPct)}%;"></div>
          </div>
        </div>

        <div style="text-align: right; min-width: 150px;">
          <div style="font-size: 0.82rem; color: var(--text-tertiary); text-transform: uppercase; font-weight: 700;">Remaining Balance</div>
          <div style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; color: ${overallRemaining >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">
            ${Utils.formatCurrency(overallRemaining, currency)}
          </div>
        </div>
      </div>

      <!-- Category Budgets Grid -->
      <h3 style="margin-bottom: var(--space-md);"><i data-lucide="tag" style="color: var(--primary-500);"></i> Category Spending Limits</h3>

      <div class="budgets-grid">
        ${budgets.categories.map(b => {
          const catMeta = Utils.getCategoryMeta(b.category);
          const spent = monthExpenses
            .filter(t => t.category.toLowerCase() === b.category.toLowerCase())
            .reduce((sum, t) => sum + t.amount, 0);

          const pct = b.limit > 0 ? ((spent / b.limit) * 100).toFixed(0) : 0;
          const remaining = b.limit - spent;

          let badgeClass = 'badge-income';
          let progressFillClass = 'success';
          let statusText = 'Normal';

          if (pct >= 100) {
            badgeClass = 'badge-expense';
            progressFillClass = 'danger';
            statusText = 'Exceeded (100%+)';
          } else if (pct >= 90) {
            badgeClass = 'badge-warning';
            progressFillClass = 'warning';
            statusText = 'Critical (90%+)';
          } else if (pct >= 80) {
            badgeClass = 'badge-warning';
            progressFillClass = 'warning';
            statusText = 'Alert (80%+)';
          }

          return `
            <div class="budget-card">
              <div class="budget-card-header">
                <div class="budget-card-category">
                  <div class="stat-icon" style="width: 38px; height: 38px; background: ${catMeta.color}20; color: ${catMeta.color}; border-radius: 10px;">
                    <i data-lucide="${catMeta.icon}"></i>
                  </div>
                  <div>
                    <div>${b.category}</div>
                    <div style="font-size: 0.75rem; color: var(--text-tertiary);">${statusText}</div>
                  </div>
                </div>
                <span class="badge ${badgeClass}">${pct}% used</span>
              </div>

              <div class="budget-card-amounts">
                <div class="budget-spent">${Utils.formatCurrency(spent, currency)}</div>
                <div class="budget-limit">/ ${Utils.formatCurrency(b.limit, currency)}</div>
              </div>

              <div class="progress-bar-container">
                <div class="progress-track">
                  <div class="progress-fill ${progressFillClass}" style="width: ${Math.min(100, pct)}%;"></div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; margin-top: auto; padding-top: var(--space-xs); border-top: 1px solid var(--border-subtle);">
                <span style="color: ${remaining >= 0 ? 'var(--text-secondary)' : 'var(--color-expense)'}; font-weight: 600;">
                  ${remaining >= 0 ? `${Utils.formatCurrency(remaining, currency)} left` : `Over by ${Utils.formatCurrency(Math.abs(remaining), currency)}`}
                </span>
                <div style="display: flex; gap: 4px;">
                  <button class="btn btn-outline btn-icon-only btn-sm" title="Edit Budget" onclick="App.openEditCategoryBudgetModal('${b.id}')">
                    <i data-lucide="edit-3"></i>
                  </button>
                  <button class="btn btn-danger-ghost btn-icon-only btn-sm" title="Delete Budget" onclick="BudgetsView.confirmDelete('${b.id}')">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ root: container });
  },

  confirmDelete(id) {
    App.openConfirmDialog({
      title: 'Remove Category Budget?',
      message: 'Are you sure you want to remove this category budget cap?',
      confirmText: 'Remove',
      confirmClass: 'btn-expense',
      onConfirm: () => {
        Store.deleteCategoryBudget(id);
        Utils.playSound('delete');
        Utils.showToast('Budget category removed', 'info');
      }
    });
  }
};

window.BudgetsView = BudgetsView;
