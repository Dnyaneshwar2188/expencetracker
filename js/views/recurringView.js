/* ==========================================================================
   FINFLOW - RECURRING BILLS & SUBSCRIPTIONS VIEW CONTROLLER
   ========================================================================== */

const RecurringView = {
  init() {
    Store.subscribe('recurring:updated', () => this.render());
    Store.subscribe('settings:updated', () => this.render());
  },

  render() {
    const container = document.getElementById('view-recurring');
    if (!container) return;

    const currency = Store.getSettings().currency;
    const recurringList = Store.getRecurring();

    // Calculate monthly commitment
    const monthlyTotal = recurringList
      .filter(r => r.active)
      .reduce((sum, r) => {
        if (r.frequency === 'Monthly') return sum + r.amount;
        if (r.frequency === 'Yearly') return sum + (r.amount / 12);
        if (r.frequency === 'Weekly') return sum + (r.amount * 4.33);
        if (r.frequency === 'Daily') return sum + (r.amount * 30);
        return sum + r.amount;
      }, 0);

    const activeCount = recurringList.filter(r => r.active).length;

    container.innerHTML = `
      <div class="card-header" style="padding: 0 0 var(--space-md) 0;">
        <div>
          <h2>Recurring Payments & Subscriptions</h2>
          <p>Automate tracking for Netflix, broadband, insurance, EMIs, and monthly obligations</p>
        </div>
        <button class="btn btn-primary" onclick="App.openRecurringModal()">
          <i data-lucide="plus"></i> Add Recurring Expense
        </button>
      </div>

      <!-- Banner Overview -->
      <div class="recurring-hero-banner">
        <div>
          <div style="font-size: 0.85rem; color: var(--text-tertiary); font-weight: 700; text-transform: uppercase;">
            Total Monthly Commitment
          </div>
          <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 800; color: var(--color-expense);">
            ${Utils.formatCurrency(monthlyTotal, currency)} <span style="font-size: 0.95rem; color: var(--text-tertiary); font-weight: 500;">/ month</span>
          </div>
          <p style="font-size: 0.88rem; margin-top: 4px;">
            Tracking <strong>${activeCount} active</strong> recurring bills and subscriptions
          </p>
        </div>

        <div style="display: flex; gap: var(--space-sm);">
          <div class="stat-card" style="padding: 12px 20px; background: var(--bg-card); border-radius: var(--radius-md);">
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">Annual Projected</div>
            <div style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800;">
              ${Utils.formatCurrency(monthlyTotal * 12, currency)}
            </div>
          </div>
        </div>
      </div>

      <!-- Recurring Items Grid -->
      <div class="recurring-grid">
        ${recurringList.map(r => {
          const catMeta = Utils.getCategoryMeta(r.category);
          const method = Utils.getPaymentMethodMeta(r.paymentMethod);
          const nextDateObj = new Date(r.nextDate);
          const now = new Date();
          const daysLeft = Math.ceil((nextDateObj - now) / (1000 * 60 * 60 * 24));
          const isDueSoon = daysLeft <= 3 && daysLeft >= 0;

          return `
            <div class="recurring-card ${r.active ? '' : 'inactive'}" style="${!r.active ? 'opacity: 0.6;' : ''}">
              <div class="recurring-card-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div class="stat-icon" style="width: 40px; height: 40px; background: ${catMeta.color}20; color: ${catMeta.color}; border-radius: 10px;">
                    <i data-lucide="${catMeta.icon}"></i>
                  </div>
                  <div>
                    <div class="recurring-title">${r.name}</div>
                    <span class="badge badge-neutral">${r.frequency}</span>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div class="recurring-amount">${Utils.formatCurrency(r.amount, currency)}</div>
                  <span class="badge ${isDueSoon ? 'badge-warning' : 'badge-neutral'}" style="font-size: 0.7rem;">
                    ${daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due Today' : `In ${daysLeft} days`}
                  </span>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: var(--text-tertiary); padding: 6px 0; border-top: 1px solid var(--border-subtle);">
                <span><i data-lucide="calendar" style="width: 14px; height: 14px; vertical-align: middle;"></i> Next: <strong>${Utils.formatDate(r.nextDate)}</strong></span>
                <span><i data-lucide="${method.icon}" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${method.name}</span>
              </div>

              <div style="display: flex; gap: var(--space-xs); margin-top: auto; padding-top: 8px;">
                <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="Store.payRecurring('${r.id}')">
                  <i data-lucide="check"></i> Pay & Log
                </button>
                <button class="btn btn-outline btn-icon-only btn-sm" title="${r.active ? 'Pause' : 'Activate'}" onclick="RecurringView.toggleActive('${r.id}')">
                  <i data-lucide="${r.active ? 'pause' : 'play'}"></i>
                </button>
                <button class="btn btn-outline btn-icon-only btn-sm" title="Edit" onclick="App.openEditRecurringModal('${r.id}')">
                  <i data-lucide="edit-3"></i>
                </button>
                <button class="btn btn-danger-ghost btn-icon-only btn-sm" title="Delete" onclick="RecurringView.confirmDelete('${r.id}')">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ root: container });
  },

  toggleActive(id) {
    const r = Store.getRecurring().find(i => i.id === id);
    if (r) {
      Store.updateRecurring(id, { active: !r.active });
      Utils.showToast(`${r.name} is now ${!r.active ? 'active' : 'paused'}`, 'info');
    }
  },

  confirmDelete(id) {
    App.openConfirmDialog({
      title: 'Remove Recurring Expense?',
      message: 'Are you sure you want to delete this recurring expense subscription?',
      confirmText: 'Remove',
      confirmClass: 'btn-expense',
      onConfirm: () => {
        Store.deleteRecurring(id);
        Utils.playSound('delete');
        Utils.showToast('Recurring expense removed', 'info');
      }
    });
  }
};

window.RecurringView = RecurringView;
