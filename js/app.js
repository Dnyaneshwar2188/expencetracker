/* ==========================================================================
   FINFLOW - CORE APP LIFECYCLE, ROUTING, MODALS & EVENT ORCHESTRATION
   ========================================================================== */

const App = {
  currentView: 'dashboard',
  isLocked: false,
  enteredPin: '',

  init() {
    // 1. Initialize Theme
    const savedTheme = Store.getSettings().theme || 'light';
    this.setTheme(savedTheme, false);

    // 2. Initialize Sub-views
    DashboardView.init();
    TransactionsView.init();
    BudgetsView.init();
    SavingsView.init();
    RecurringView.init();
    AnalyticsView.init();
    CalendarView.init();
    ReportsView.init();
    SettingsView.init();

    // 3. Setup Navigation & Routing
    this.setupNavigation();

    // 4. Setup Global Keyboard Shortcuts
    this.setupKeyboardShortcuts();

    // 5. Setup Header Search & Modals
    this.setupGlobalSearch();

    // 6. Update Notification Bell Badge
    this.updateNotificationBadge();
    Store.subscribe('notifications:updated', () => this.updateNotificationBadge());

    // 7. Check PIN Lock on startup
    const pinConfig = Store.getSettings().pinLock;
    if (pinConfig && pinConfig.enabled) {
      this.lockScreen();
    }

    // 8. Render Default View
    this.navigate('dashboard');

    // 9. Update User Profile in Sidebar
    this.updateUserProfilePreview();
    Store.subscribe('settings:updated', () => this.updateUserProfilePreview());
  },

  // Navigation
  navigate(viewName) {
    this.currentView = viewName;

    // Hide all view containers
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));

    // Show target view
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
    }

    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-view') === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update active state in mobile bottom nav
    document.querySelectorAll('.bottom-nav-item').forEach(el => {
      if (el.getAttribute('data-view') === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update page title in header
    const titleMap = {
      dashboard: 'Dashboard',
      transactions: 'Transactions',
      budgets: 'Budgets',
      savings: 'Savings Goals',
      recurring: 'Recurring Expenses',
      analytics: 'Analytics',
      calendar: 'Calendar View',
      reports: 'Reports & Statements',
      settings: 'Settings'
    };
    const titleEl = document.getElementById('headerPageTitle');
    if (titleEl) titleEl.innerText = titleMap[viewName] || 'Dashboard';

    // Close mobile sidebar if open
    document.getElementById('appSidebar')?.classList.remove('open');

    // Call view-specific render
    if (viewName === 'dashboard') DashboardView.render();
    if (viewName === 'transactions') TransactionsView.render();
    if (viewName === 'budgets') BudgetsView.render();
    if (viewName === 'savings') SavingsView.render();
    if (viewName === 'recurring') RecurringView.render();
    if (viewName === 'analytics') AnalyticsView.render();
    if (viewName === 'calendar') CalendarView.render();
    if (viewName === 'reports') ReportsView.render();
    if (viewName === 'settings') SettingsView.render();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    Utils.playSound('click');
  },

  setupNavigation() {
    // Desktop Nav Items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view');
        if (view) this.navigate(view);
      });
    });

    // Mobile Bottom Nav Items
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view');
        if (view) this.navigate(view);
      });
    });

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('appSidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Theme toggle button in header
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const curTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = curTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
      });
    }

    // Notifications bell button
    const notifBtn = document.getElementById('notificationsToggleBtn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => this.openNotificationsDrawer());
    }

    // Global Search trigger button
    const searchBtn = document.getElementById('headerSearchTrigger');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.openGlobalSearchModal());
    }
  },

  setTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (save) {
      Store.updateSettings({ theme });
      Utils.showToast(`${theme === 'dark' ? 'Dark' : 'Light'} Mode enabled`, 'info');
    }

    const themeIcon = document.getElementById('themeToggleIcon');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      if (window.lucide) window.lucide.createIcons({ root: themeIcon.parentElement });
    }

    AppCharts.updateTheme();
  },

  updateUserProfilePreview() {
    const s = Store.getSettings();
    const nameEl = document.getElementById('sidebarUserName');
    const emailEl = document.getElementById('sidebarUserEmail');
    const avatarEl = document.getElementById('sidebarUserAvatar');

    if (nameEl) nameEl.innerText = s.userName || 'Dnyaneshwar';
    if (emailEl) emailEl.innerText = s.userEmail || 'user@finflow.app';
    if (avatarEl) avatarEl.innerText = (s.userName || 'D').charAt(0).toUpperCase();
  },

  updateNotificationBadge() {
    const list = Store.getNotifications();
    const unreadCount = list.filter(n => !n.read).length;
    const badge = document.getElementById('headerNotificationBadge');
    if (badge) {
      badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
  },

  // ==========================================
  // TRANSACTION MODAL (ADD & EDIT)
  // ==========================================
  openTransactionModal(defaultType = 'expense', defaultCategory = null, defaultDate = null) {
    const modal = document.getElementById('transactionModal');
    if (!modal) return;

    const form = document.getElementById('transactionForm');
    form.reset();

    const idInput = document.getElementById('txnId');
    idInput.value = '';

    const titleEl = document.getElementById('txnModalTitle');
    if (titleEl) titleEl.innerText = 'Add Transaction';

    // Type toggles
    this.setTransactionType(defaultType);

    // Populate category dropdown
    const catSelect = document.getElementById('txnCategory');
    const categories = [...Utils.DEFAULT_CATEGORIES, ...(Store.getSettings().customCategories || [])];
    catSelect.innerHTML = categories.map(c => `
      <option value="${c.name}" ${defaultCategory === c.name ? 'selected' : ''}>${c.name}</option>
    `).join('');

    // Set default date & time
    const dateInput = document.getElementById('txnDate');
    const timeInput = document.getElementById('txnTime');
    const now = new Date();
    dateInput.value = defaultDate || now.toISOString().split('T')[0];
    timeInput.value = now.toTimeString().substring(0, 5);

    // Clear receipt preview
    const previewContainer = document.getElementById('receiptPreviewBox');
    previewContainer.innerHTML = '';
    document.getElementById('txnReceiptBase64').value = '';

    modal.classList.add('open');
    if (window.lucide) window.lucide.createIcons({ root: modal });
  },

  openEditTransactionModal(id) {
    const txn = Store.getTransactionById(id);
    if (!txn) return;

    this.openTransactionModal(txn.type, txn.category, txn.date);

    document.getElementById('txnModalTitle').innerText = 'Edit Transaction';
    document.getElementById('txnId').value = txn.id;
    document.getElementById('txnAmount').value = txn.amount;
    document.getElementById('txnDate').value = txn.date;
    document.getElementById('txnTime').value = txn.time || '12:00';
    document.getElementById('txnCategory').value = txn.category;
    document.getElementById('txnPaymentMethod').value = txn.paymentMethod || 'upi';
    document.getElementById('txnMerchant').value = txn.merchant || '';
    document.getElementById('txnDescription').value = txn.description || '';
    document.getElementById('txnRecurring').checked = !!txn.isRecurring;

    if (txn.receiptUrl) {
      document.getElementById('txnReceiptBase64').value = txn.receiptUrl;
      const preview = document.getElementById('receiptPreviewBox');
      preview.innerHTML = `
        <img src="${txn.receiptUrl}" class="receipt-preview-thumbnail" alt="Receipt"/>
        <button type="button" class="btn btn-outline btn-sm" style="margin-top: 4px;" onclick="App.clearReceipt()">Remove Receipt</button>
      `;
    }
  },

  setTransactionType(type) {
    document.getElementById('txnType').value = type;
    const expenseBtn = document.getElementById('typeBtnExpense');
    const incomeBtn = document.getElementById('typeBtnIncome');

    if (type === 'expense') {
      expenseBtn.className = 'type-toggle-btn active expense';
      incomeBtn.className = 'type-toggle-btn';
    } else {
      expenseBtn.className = 'type-toggle-btn';
      incomeBtn.className = 'type-toggle-btn active income';
    }
  },

  handleReceiptUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const base64 = e.target.result;
      document.getElementById('txnReceiptBase64').value = base64;
      const preview = document.getElementById('receiptPreviewBox');
      preview.innerHTML = `
        <img src="${base64}" class="receipt-preview-thumbnail" alt="Receipt Preview"/>
        <button type="button" class="btn btn-outline btn-sm" style="margin-top: 4px;" onclick="App.clearReceipt()">Remove Receipt</button>
      `;
      Utils.showToast('Receipt attached successfully!', 'info');
    };
    reader.readAsDataURL(file);
  },

  clearReceipt() {
    document.getElementById('txnReceiptBase64').value = '';
    document.getElementById('receiptPreviewBox').innerHTML = '';
    document.getElementById('txnReceiptFile').value = '';
  },

  saveTransaction(event) {
    event.preventDefault();

    const id = document.getElementById('txnId').value;
    const type = document.getElementById('txnType').value;
    const amount = Number(document.getElementById('txnAmount').value);
    const category = document.getElementById('txnCategory').value;
    const date = document.getElementById('txnDate').value;
    const time = document.getElementById('txnTime').value;
    const paymentMethod = document.getElementById('txnPaymentMethod').value;
    const merchant = document.getElementById('txnMerchant').value.trim();
    const description = document.getElementById('txnDescription').value.trim();
    const isRecurring = document.getElementById('txnRecurring').checked;
    const receiptUrl = document.getElementById('txnReceiptBase64').value || null;

    if (!amount || amount <= 0) {
      Utils.showToast('Please enter a valid amount', 'warning');
      return;
    }

    if (!date) {
      Utils.showToast('Please select a date', 'warning');
      return;
    }

    const payload = {
      type,
      amount,
      category,
      date,
      time,
      paymentMethod,
      merchant,
      description,
      isRecurring,
      receiptUrl
    };

    if (id) {
      Store.updateTransaction(id, payload);
      Utils.showToast('Transaction updated successfully!', 'success');
    } else {
      Store.addTransaction(payload);
      Utils.showToast('Transaction recorded successfully!', 'success');
    }

    Utils.playSound('success');
    this.closeModal('transactionModal');
  },

  // ==========================================
  // TRANSACTION DETAILS & RECEIPT VIEWER
  // ==========================================
  viewTransactionDetails(id) {
    const t = Store.getTransactionById(id);
    if (!t) return;

    const currency = Store.getSettings().currency;
    const cat = Utils.getCategoryMeta(t.category);
    const method = Utils.getPaymentMethodMeta(t.paymentMethod);
    const isIncome = t.type === 'income';

    const body = `
      <div style="text-align: center; padding: var(--space-md) 0; border-bottom: 1px solid var(--border-light); margin-bottom: var(--space-md);">
        <div class="stat-icon" style="width: 52px; height: 52px; margin: 0 auto var(--space-xs); background: ${cat.color}20; color: ${cat.color}; border-radius: 14px;">
          <i data-lucide="${cat.icon}"></i>
        </div>
        <div style="font-size: 1.15rem; font-weight: 700;">${t.merchant || t.description || 'Transaction'}</div>
        <div style="font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: ${isIncome ? 'var(--color-income)' : 'var(--color-expense)'};">
          ${isIncome ? '+' : '-'}${Utils.formatCurrency(t.amount, currency)}
        </div>
        <span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}" style="text-transform: uppercase;">
          ${t.type}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-md); font-size: 0.9rem;">
        <div>
          <span style="color: var(--text-tertiary); font-size: 0.8rem; display: block;">Category</span>
          <strong>${t.category}</strong>
        </div>
        <div>
          <span style="color: var(--text-tertiary); font-size: 0.8rem; display: block;">Payment Method</span>
          <strong>${method.name}</strong>
        </div>
        <div>
          <span style="color: var(--text-tertiary); font-size: 0.8rem; display: block;">Date</span>
          <strong>${Utils.formatDate(t.date)}</strong>
        </div>
        <div>
          <span style="color: var(--text-tertiary); font-size: 0.8rem; display: block;">Time</span>
          <strong>${t.time || 'N/A'}</strong>
        </div>
      </div>

      ${t.description ? `
        <div style="margin-bottom: var(--space-md); padding: 10px; background: var(--bg-surface); border-radius: var(--radius-sm); font-size: 0.88rem;">
          <span style="color: var(--text-tertiary); font-size: 0.78rem; display: block; margin-bottom: 2px;">Notes / Description</span>
          ${t.description}
        </div>
      ` : ''}

      ${t.receiptUrl ? `
        <div style="margin-bottom: var(--space-md); text-align: center;">
          <span style="color: var(--text-tertiary); font-size: 0.8rem; display: block; margin-bottom: 6px;">Attached Tax Receipt</span>
          <img src="${t.receiptUrl}" style="max-height: 180px; border-radius: 8px; border: 1px solid var(--border-light); cursor: pointer;" onclick="App.viewReceipt('${t.id}')"/>
          <button class="btn btn-outline btn-sm" style="margin-top: 6px;" onclick="App.viewReceipt('${t.id}')">
            <i data-lucide="maximize-2"></i> View Full Receipt
          </button>
        </div>
      ` : ''}

      <div style="display: flex; gap: var(--space-xs); margin-top: var(--space-md); border-top: 1px solid var(--border-light); padding-top: var(--space-md);">
        <button class="btn btn-outline" style="flex: 1;" onclick="App.closeGenericModal(); App.openEditTransactionModal('${t.id}')">
          <i data-lucide="edit-3"></i> Edit
        </button>
        <button class="btn btn-outline" onclick="App.closeGenericModal(); TransactionsView.duplicateTransaction('${t.id}')" title="Duplicate">
          <i data-lucide="copy"></i> Duplicate
        </button>
        <button class="btn btn-danger-ghost" onclick="App.closeGenericModal(); TransactionsView.confirmDelete('${t.id}')">
          <i data-lucide="trash-2"></i> Delete
        </button>
      </div>
    `;

    this.openGenericModal({
      title: 'Transaction Details',
      bodyHtml: body
    });
  },

  viewReceipt(id) {
    const t = Store.getTransactionById(id);
    if (!t || !t.receiptUrl) return;

    const modal = document.getElementById('receiptViewModal');
    const img = document.getElementById('receiptFullImage');
    if (modal && img) {
      img.src = t.receiptUrl;
      modal.classList.add('open');
    }
  },

  // ==========================================
  // BUDGET MODALS
  // ==========================================
  openBudgetModal() {
    const modal = document.getElementById('budgetModal');
    if (!modal) return;

    const select = document.getElementById('budgetCategorySelect');
    const categories = [...Utils.DEFAULT_CATEGORIES, ...(Store.getSettings().customCategories || [])].filter(c => !c.isIncome);

    select.innerHTML = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    document.getElementById('budgetAmountInput').value = '';

    modal.classList.add('open');
    if (window.lucide) window.lucide.createIcons({ root: modal });
  },

  openEditCategoryBudgetModal(id) {
    const budgets = Store.getBudgets();
    const item = budgets.categories.find(c => c.id === id);
    if (!item) return;

    this.openBudgetModal();
    document.getElementById('budgetCategorySelect').value = item.category;
    document.getElementById('budgetAmountInput').value = item.limit;
  },

  saveCategoryBudget(event) {
    event.preventDefault();
    const cat = document.getElementById('budgetCategorySelect').value;
    const limit = Number(document.getElementById('budgetAmountInput').value);

    if (!limit || limit <= 0) {
      Utils.showToast('Please enter a valid budget limit', 'warning');
      return;
    }

    Store.saveCategoryBudget(cat, limit);
    Utils.showToast(`Budget for ${cat} set to ${Utils.formatCurrency(limit, Store.getSettings().currency)}`, 'success');
    Utils.playSound('success');
    this.closeModal('budgetModal');
  },

  openEditOverallBudgetModal() {
    const cur = Store.getBudgets().overall || 50000;
    const html = `
      <div class="form-group">
        <label class="form-label">Total Monthly Budget Limit (${Store.getSettings().currency})</label>
        <input type="number" id="newOverallBudgetVal" class="form-control" value="${cur}" min="1000" step="500"/>
        <span style="font-size: 0.78rem; color: var(--text-tertiary); margin-top: 4px;">Sets the maximum ceiling limit across all categories.</span>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: var(--space-xs); margin-top: var(--space-md);">
        <button class="btn btn-outline" onclick="App.closeGenericModal()">Cancel</button>
        <button class="btn btn-primary" onclick="App.saveOverallBudget()">Save Limit</button>
      </div>
    `;

    this.openGenericModal({
      title: 'Monthly Overall Budget Cap',
      bodyHtml: html
    });
  },

  saveOverallBudget() {
    const val = Number(document.getElementById('newOverallBudgetVal')?.value);
    if (!val || val <= 0) {
      Utils.showToast('Please enter a valid budget', 'warning');
      return;
    }
    Store.setOverallBudget(val);
    Utils.showToast(`Overall budget set to ${Utils.formatCurrency(val, Store.getSettings().currency)}`, 'success');
    Utils.playSound('success');
    this.closeGenericModal();
  },

  // ==========================================
  // SAVINGS GOAL MODALS
  // ==========================================
  openGoalModal() {
    const modal = document.getElementById('goalModal');
    if (!modal) return;

    document.getElementById('goalForm').reset();
    document.getElementById('goalId').value = '';
    document.getElementById('goalModalTitle').innerText = 'New Savings Goal';

    const now = new Date();
    now.setMonth(now.getMonth() + 3);
    document.getElementById('goalTargetDate').value = now.toISOString().split('T')[0];

    modal.classList.add('open');
    if (window.lucide) window.lucide.createIcons({ root: modal });
  },

  openEditGoalModal(id) {
    const goal = Store.getGoals().find(g => g.id === id);
    if (!goal) return;

    this.openGoalModal();
    document.getElementById('goalModalTitle').innerText = 'Edit Savings Goal';
    document.getElementById('goalId').value = goal.id;
    document.getElementById('goalName').value = goal.name;
    document.getElementById('goalTargetAmount').value = goal.targetAmount;
    document.getElementById('goalCurrentSaved').value = goal.currentSaved;
    document.getElementById('goalTargetDate').value = goal.targetDate;
    document.getElementById('goalCategory').value = goal.category || 'Savings';
  },

  saveGoal(event) {
    event.preventDefault();
    const id = document.getElementById('goalId').value;
    const name = document.getElementById('goalName').value.trim();
    const targetAmount = Number(document.getElementById('goalTargetAmount').value);
    const currentSaved = Number(document.getElementById('goalCurrentSaved').value) || 0;
    const targetDate = document.getElementById('goalTargetDate').value;
    const category = document.getElementById('goalCategory').value;

    if (!name || !targetAmount || targetAmount <= 0) {
      Utils.showToast('Please provide a goal name and target amount', 'warning');
      return;
    }

    const payload = { name, targetAmount, currentSaved, targetDate, category, icon: 'target', color: '#6366F1' };

    if (id) {
      Store.updateGoal(id, payload);
      Utils.showToast(`Updated goal: ${name}`, 'success');
    } else {
      Store.addGoal(payload);
      Utils.showToast(`Created goal: ${name}!`, 'success');
    }

    Utils.playSound('success');
    this.closeModal('goalModal');
  },

  openAddMoneyGoalModal(id) {
    const goal = Store.getGoals().find(g => g.id === id);
    if (!goal) return;

    const currency = Store.getSettings().currency;
    const html = `
      <p style="margin-bottom: var(--space-md); font-size: 0.9rem;">
        Deposit funds into <strong>${goal.name}</strong>. Current: ${Utils.formatCurrency(goal.currentSaved, currency)} / Target: ${Utils.formatCurrency(goal.targetAmount, currency)}.
      </p>
      <div class="form-group">
        <label class="form-label">Deposit Amount (${currency})</label>
        <input type="number" id="addMoneyAmount" class="form-control" placeholder="e.g. 5000" min="100" autofocus/>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: var(--space-xs); margin-top: var(--space-md);">
        <button class="btn btn-outline" onclick="App.closeGenericModal()">Cancel</button>
        <button class="btn btn-income" onclick="App.executeAddMoney('${goal.id}')">Deposit Funds</button>
      </div>
    `;

    this.openGenericModal({
      title: `Deposit to ${goal.name}`,
      bodyHtml: html
    });
  },

  executeAddMoney(id) {
    const amt = Number(document.getElementById('addMoneyAmount')?.value);
    if (!amt || amt <= 0) {
      Utils.showToast('Please enter a valid amount', 'warning');
      return;
    }
    Store.addMoneyToGoal(id, amt);
    Utils.showToast(`Deposited ${Utils.formatCurrency(amt, Store.getSettings().currency)} to goal!`, 'success');
    Utils.playSound('success');
    this.closeGenericModal();
  },

  openWithdrawGoalModal(id) {
    const goal = Store.getGoals().find(g => g.id === id);
    if (!goal) return;

    const currency = Store.getSettings().currency;
    const html = `
      <p style="margin-bottom: var(--space-md); font-size: 0.9rem;">
        Withdraw saved money from <strong>${goal.name}</strong> (Available: ${Utils.formatCurrency(goal.currentSaved, currency)}).
      </p>
      <div class="form-group">
        <label class="form-label">Withdraw Amount (${currency})</label>
        <input type="number" id="withdrawAmount" class="form-control" placeholder="e.g. 2000" max="${goal.currentSaved}" min="100"/>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: var(--space-xs); margin-top: var(--space-md);">
        <button class="btn btn-outline" onclick="App.closeGenericModal()">Cancel</button>
        <button class="btn btn-expense" onclick="App.executeWithdraw('${goal.id}')">Withdraw Funds</button>
      </div>
    `;

    this.openGenericModal({
      title: `Withdraw from ${goal.name}`,
      bodyHtml: html
    });
  },

  executeWithdraw(id) {
    const amt = Number(document.getElementById('withdrawAmount')?.value);
    if (!amt || amt <= 0) {
      Utils.showToast('Please enter a valid withdrawal amount', 'warning');
      return;
    }
    Store.withdrawFromGoal(id, amt);
    Utils.showToast(`Withdrew ${Utils.formatCurrency(amt, Store.getSettings().currency)} from goal!`, 'info');
    Utils.playSound('click');
    this.closeGenericModal();
  },

  // ==========================================
  // RECURRING EXPENSE MODALS
  // ==========================================
  openRecurringModal() {
    const modal = document.getElementById('recurringModal');
    if (!modal) return;

    document.getElementById('recurringForm').reset();
    document.getElementById('recurringId').value = '';
    document.getElementById('recurringModalTitle').innerText = 'Add Recurring Payment';

    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    now.setDate(1);
    document.getElementById('recurringNextDate').value = now.toISOString().split('T')[0];

    modal.classList.add('open');
    if (window.lucide) window.lucide.createIcons({ root: modal });
  },

  openEditRecurringModal(id) {
    const item = Store.getRecurring().find(r => r.id === id);
    if (!item) return;

    this.openRecurringModal();
    document.getElementById('recurringModalTitle').innerText = 'Edit Recurring Payment';
    document.getElementById('recurringId').value = item.id;
    document.getElementById('recurringName').value = item.name;
    document.getElementById('recurringAmount').value = item.amount;
    document.getElementById('recurringFrequency').value = item.frequency;
    document.getElementById('recurringNextDate').value = item.nextDate;
    document.getElementById('recurringCategory').value = item.category;
    document.getElementById('recurringPaymentMethod').value = item.paymentMethod;
  },

  saveRecurring(event) {
    event.preventDefault();
    const id = document.getElementById('recurringId').value;
    const name = document.getElementById('recurringName').value.trim();
    const amount = Number(document.getElementById('recurringAmount').value);
    const frequency = document.getElementById('recurringFrequency').value;
    const nextDate = document.getElementById('recurringNextDate').value;
    const category = document.getElementById('recurringCategory').value;
    const paymentMethod = document.getElementById('recurringPaymentMethod').value;

    if (!name || !amount || amount <= 0) {
      Utils.showToast('Please enter a title and valid amount', 'warning');
      return;
    }

    const payload = { name, amount, frequency, nextDate, category, paymentMethod, active: true };

    if (id) {
      Store.updateRecurring(id, payload);
      Utils.showToast(`Updated recurring expense: ${name}`, 'success');
    } else {
      Store.addRecurring(payload);
      Utils.showToast(`Added recurring expense: ${name}`, 'success');
    }

    Utils.playSound('success');
    this.closeModal('recurringModal');
  },

  // ==========================================
  // NOTIFICATIONS DRAWER
  // ==========================================
  openNotificationsDrawer() {
    const notifications = Store.getNotifications();
    const html = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); padding-bottom: var(--space-xs); border-bottom: 1px solid var(--border-light);">
        <button class="btn btn-outline btn-sm" onclick="Store.markNotificationsRead(); App.closeGenericModal();">
          <i data-lucide="check"></i> Mark All as Read
        </button>
        <button class="btn btn-danger-ghost btn-sm" onclick="Store.clearNotifications(); App.closeGenericModal();">
          <i data-lucide="trash"></i> Clear All
        </button>
      </div>

      ${notifications.length === 0 ? `
        <div class="empty-state" style="padding: 24px;">
          <i data-lucide="bell-off" style="font-size: 2rem; color: var(--text-tertiary);"></i>
          <p>No active alerts or notifications.</p>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
          ${notifications.map(n => `
            <div style="padding: 10px 12px; border-radius: var(--radius-md); background: ${n.read ? 'var(--bg-surface)' : 'var(--bg-card)'}; border: 1px solid var(--border-light); border-left: 4px solid ${n.type === 'alert' ? 'var(--color-expense)' : n.type === 'warning' ? 'var(--color-warning)' : 'var(--primary-500)'};">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <strong style="font-size: 0.9rem;">${n.title}</strong>
                <span style="font-size: 0.72rem; color: var(--text-tertiary);">${Utils.getRelativeTime(n.timestamp)}</span>
              </div>
              <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">${n.message}</div>
            </div>
          `).join('')}
        </div>
      `}
    `;

    this.openGenericModal({
      title: 'Alerts & System Notifications',
      bodyHtml: html
    });
  },

  // ==========================================
  // GLOBAL SEARCH (Ctrl+K)
  // ==========================================
  setupGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    if (input) {
      input.addEventListener('input', e => {
        this.executeGlobalSearch(e.target.value);
      });
    }
  },

  openGlobalSearchModal() {
    const modal = document.getElementById('globalSearchModal');
    if (modal) {
      modal.classList.add('open');
      const input = document.getElementById('globalSearchInput');
      input.value = '';
      this.executeGlobalSearch('');
      setTimeout(() => input.focus(), 100);
      if (window.lucide) window.lucide.createIcons({ root: modal });
    }
  },

  executeGlobalSearch(query) {
    const container = document.getElementById('globalSearchResults');
    if (!container) return;

    const q = query.trim().toLowerCase();
    const txns = Store.getTransactions();
    const goals = Store.getGoals();
    const currency = Store.getSettings().currency;

    if (!q) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-tertiary); padding: 30px 10px; font-size: 0.88rem;">
          Type to search across transactions, merchants, notes, and savings goals...
        </div>
      `;
      return;
    }

    const matchedTxns = txns.filter(t =>
      (t.merchant && t.merchant.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    ).slice(0, 8);

    const matchedGoals = goals.filter(g =>
      g.name.toLowerCase().includes(q)
    );

    if (matchedTxns.length === 0 && matchedGoals.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-tertiary); padding: 30px 10px; font-size: 0.88rem;">
          No matching records found for "<strong>${query}</strong>"
        </div>
      `;
      return;
    }

    let html = '';

    if (matchedGoals.length > 0) {
      html += `<div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-tertiary); padding: 6px 12px;">Goals</div>`;
      html += matchedGoals.map(g => `
        <div class="search-result-item" onclick="App.closeModal('globalSearchModal'); App.navigate('savings');">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i data-lucide="target" style="color: var(--color-savings);"></i>
            <div>
              <div style="font-weight: 600; font-size: 0.9rem;">${g.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-tertiary);">Saved: ${Utils.formatCurrency(g.currentSaved, currency)} / ${Utils.formatCurrency(g.targetAmount, currency)}</div>
            </div>
          </div>
          <span class="badge badge-info">Goal</span>
        </div>
      `).join('');
    }

    if (matchedTxns.length > 0) {
      html += `<div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-tertiary); padding: 6px 12px; margin-top: 6px;">Transactions</div>`;
      html += matchedTxns.map(t => {
        const isInc = t.type === 'income';
        return `
          <div class="search-result-item" onclick="App.closeModal('globalSearchModal'); App.viewTransactionDetails('${t.id}')">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i data-lucide="${isInc ? 'arrow-down-left' : 'arrow-up-right'}" style="color: ${isInc ? 'var(--color-income)' : 'var(--color-expense)'};"></i>
              <div>
                <div style="font-weight: 600; font-size: 0.9rem;">${t.merchant || t.description || t.category}</div>
                <div style="font-size: 0.75rem; color: var(--text-tertiary);">${Utils.formatDate(t.date)} • ${t.category}</div>
              </div>
            </div>
            <div style="font-weight: 700; font-size: 0.92rem; color: ${isInc ? 'var(--color-income)' : 'var(--color-expense)'};">
              ${isInc ? '+' : '-'}${Utils.formatCurrency(t.amount, currency)}
            </div>
          </div>
        `;
      }).join('');
    }

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons({ root: container });
  },

  // ==========================================
  // PIN LOCK SYSTEM
  // ==========================================
  lockScreen() {
    this.isLocked = true;
    this.enteredPin = '';
    const overlay = document.getElementById('pinLockOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      this.updatePinDots();
    }
  },

  unlockScreen() {
    this.isLocked = false;
    this.enteredPin = '';
    const overlay = document.getElementById('pinLockOverlay');
    if (overlay) overlay.style.display = 'none';
    Utils.showToast('App unlocked', 'success');
    Utils.playSound('success');
  },

  pressPinKey(key) {
    if (key === 'backspace') {
      this.enteredPin = this.enteredPin.slice(0, -1);
      this.updatePinDots();
      Utils.playSound('click');
      return;
    }

    if (this.enteredPin.length < 4) {
      this.enteredPin += key;
      this.updatePinDots();
      Utils.playSound('click');

      if (this.enteredPin.length === 4) {
        const correctPin = Store.getSettings().pinLock?.pin || '1234';
        setTimeout(() => {
          if (this.enteredPin === correctPin) {
            this.unlockScreen();
          } else {
            Utils.showToast('Incorrect PIN. Try again.', 'error');
            Utils.playSound('delete');
            this.enteredPin = '';
            this.updatePinDots();
          }
        }, 150);
      }
    }
  },

  updatePinDots() {
    for (let i = 1; i <= 4; i++) {
      const dot = document.getElementById(`pinDot${i}`);
      if (dot) {
        if (i <= this.enteredPin.length) {
          dot.classList.add('filled');
        } else {
          dot.classList.remove('filled');
        }
      }
    }
  },

  // ==========================================
  // GENERIC MODALS & DIALOGS
  // ==========================================
  openGenericModal({ title, bodyHtml }) {
    const modal = document.getElementById('genericModal');
    if (!modal) return;

    document.getElementById('genericModalTitle').innerText = title || '';
    document.getElementById('genericModalBody').innerHTML = bodyHtml || '';
    modal.classList.add('open');
    if (window.lucide) window.lucide.createIcons({ root: modal });
  },

  closeGenericModal() {
    this.closeModal('genericModal');
  },

  openConfirmDialog({ title, message, confirmText = 'Confirm', confirmClass = 'btn-primary', onConfirm }) {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;

    document.getElementById('confirmModalTitle').innerText = title || 'Confirmation';
    document.getElementById('confirmModalMessage').innerText = message || 'Are you sure you want to proceed?';

    const confirmBtn = document.getElementById('confirmModalActionBtn');
    confirmBtn.className = `btn ${confirmClass}`;
    confirmBtn.innerText = confirmText;

    confirmBtn.onclick = () => {
      this.closeModal('confirmModal');
      if (onConfirm) onConfirm();
    };

    modal.classList.add('open');
    if (window.lucide) window.lucide.createIcons({ root: modal });
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('open');
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      // Don't trigger if typing in form inputs
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

      // Escape key closes modals
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
      }

      // Ctrl+K opens global search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openGlobalSearchModal();
      }

      // Alt+N opens new transaction modal
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        this.openTransactionModal();
      }

      // Numeric pin keypad input when screen is locked
      if (this.isLocked && !isInput) {
        if (/^[0-9]$/.test(e.key)) {
          this.pressPinKey(e.key);
        } else if (e.key === 'Backspace') {
          this.pressPinKey('backspace');
        }
      }
    });
  }
};

window.App = App;

// Start app once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
