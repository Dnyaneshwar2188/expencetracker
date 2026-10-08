/* ==========================================================================
   FINFLOW - SAVINGS GOALS VIEW CONTROLLER
   ========================================================================== */

const SavingsView = {
  init() {
    Store.subscribe('goals:updated', () => this.render());
    Store.subscribe('settings:updated', () => this.render());
  },

  render() {
    const container = document.getElementById('view-savings');
    if (!container) return;

    const currency = Store.getSettings().currency;
    const goals = Store.getGoals();

    const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalSaved = goals.reduce((s, g) => s + g.currentSaved, 0);
    const overallProgress = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0;

    container.innerHTML = `
      <div class="card-header" style="padding: 0 0 var(--space-md) 0;">
        <div>
          <h2>Savings Goals & Funds</h2>
          <p>Plan milestones, allocate funds toward your dreams, and track progress</p>
        </div>
        <button class="btn btn-primary" onclick="App.openGoalModal()">
          <i data-lucide="plus"></i> New Savings Goal
        </button>
      </div>

      <!-- Savings Overview Stats -->
      <div class="budget-hero-card" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%);">
        <div class="budget-hero-left">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span class="badge badge-info">${overallProgress}% Overall Progress</span>
            <span style="font-size: 0.85rem; color: var(--text-tertiary);">${goals.length} Active Goals</span>
          </div>
          <h3 style="font-size: 1.8rem; margin-bottom: 4px;">
            ${Utils.formatCurrency(totalSaved, currency)} <span style="font-size: 1.1rem; color: var(--text-tertiary); font-weight: normal;">saved towards ${Utils.formatCurrency(totalTarget, currency)}</span>
          </h3>
          <p style="margin-bottom: var(--space-md);">
            Only <strong>${Utils.formatCurrency(Math.max(0, totalTarget - totalSaved), currency)}</strong> left to fulfill all your ongoing financial dreams!
          </p>
          <div class="progress-track" style="height: 12px;">
            <div class="progress-fill primary" style="width: ${Math.min(100, overallProgress)}%;"></div>
          </div>
        </div>
        <div style="text-align: right; min-width: 150px;">
          <div class="stat-icon savings" style="width: 56px; height: 56px; font-size: 1.6rem; margin-left: auto;">
            <i data-lucide="target"></i>
          </div>
        </div>
      </div>

      <!-- Goals Grid -->
      <div class="goals-grid">
        ${goals.map(g => {
          const pct = g.targetAmount > 0 ? ((g.currentSaved / g.targetAmount) * 100).toFixed(0) : 0;
          const remaining = Math.max(0, g.targetAmount - g.currentSaved);
          const isComplete = g.currentSaved >= g.targetAmount;

          return `
            <div class="goal-card">
              <div class="goal-card-top">
                <div class="goal-icon-box" style="background: ${g.color || '#6366F1'}20; color: ${g.color || '#6366F1'};">
                  <i data-lucide="${g.icon || 'target'}"></i>
                </div>
                <div style="text-align: right;">
                  <span class="badge ${isComplete ? 'badge-income' : 'badge-info'}">
                    ${isComplete ? 'Completed 🏆' : `${pct}% completed`}
                  </span>
                  <div class="goal-target-date" style="margin-top: 4px;">
                    <i data-lucide="calendar"></i> By ${Utils.formatDate(g.targetDate)}
                  </div>
                </div>
              </div>

              <div>
                <h4 style="font-size: 1.15rem; margin-bottom: 4px;">${g.name}</h4>
                <div class="goal-amounts">
                  <span class="goal-saved">${Utils.formatCurrency(g.currentSaved, currency)}</span>
                  <span style="font-size: 0.9rem; color: var(--text-tertiary);">/ ${Utils.formatCurrency(g.targetAmount, currency)}</span>
                </div>
              </div>

              <div class="progress-bar-container">
                <div class="progress-track">
                  <div class="progress-fill ${isComplete ? 'success' : 'primary'}" style="width: ${Math.min(100, pct)}%;"></div>
                </div>
              </div>

              <div style="font-size: 0.8rem; color: var(--text-tertiary);">
                ${isComplete ? 'Goal fulfilled! Great job!' : `Remaining: <strong>${Utils.formatCurrency(remaining, currency)}</strong>`}
              </div>

              <div class="goal-actions">
                <button class="btn btn-income btn-sm" style="flex: 1;" onclick="App.openAddMoneyGoalModal('${g.id}')">
                  <i data-lucide="plus"></i> Add Money
                </button>
                <button class="btn btn-outline btn-sm" onclick="App.openWithdrawGoalModal('${g.id}')" title="Withdraw">
                  <i data-lucide="minus"></i>
                </button>
                <button class="btn btn-outline btn-icon-only btn-sm" title="Edit" onclick="App.openEditGoalModal('${g.id}')">
                  <i data-lucide="edit-3"></i>
                </button>
                <button class="btn btn-danger-ghost btn-icon-only btn-sm" title="Delete" onclick="SavingsView.confirmDelete('${g.id}')">
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

  confirmDelete(id) {
    App.openConfirmDialog({
      title: 'Delete Savings Goal?',
      message: 'Are you sure you want to remove this savings goal?',
      confirmText: 'Delete',
      confirmClass: 'btn-expense',
      onConfirm: () => {
        Store.deleteGoal(id);
        Utils.playSound('delete');
        Utils.showToast('Savings goal deleted', 'info');
      }
    });
  }
};

window.SavingsView = SavingsView;
