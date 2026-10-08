/* ==========================================================================
   FINFLOW - CENTRAL DATA STORE & REACTIVE STATE MANAGEMENT
   ========================================================================== */

const STORAGE_KEYS = {
  TRANSACTIONS: 'finflow_transactions_v1',
  BUDGETS: 'finflow_budgets_v1',
  GOALS: 'finflow_goals_v1',
  RECURRING: 'finflow_recurring_v1',
  SETTINGS: 'finflow_settings_v1',
  NOTIFICATIONS: 'finflow_notifications_v1'
};

const Store = {
  _subscribers: {},

  subscribe(event, callback) {
    if (!this._subscribers[event]) {
      this._subscribers[event] = [];
    }
    this._subscribers[event].push(callback);
    return () => {
      this._subscribers[event] = this._subscribers[event].filter(cb => cb !== callback);
    };
  },

  emit(event, payload) {
    if (this._subscribers[event]) {
      this._subscribers[event].forEach(cb => cb(payload));
    }
    if (this._subscribers['*']) {
      this._subscribers['*'].forEach(cb => cb({ event, payload }));
    }
  },

  // Initialize Store with realistic seed data if empty
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      this.resetToDefaults();
    }
  },

  // Default seed dataset
  resetToDefaults() {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = String(today.getMonth() + 1).padStart(2, '0');

    const defaultTransactions = [
      {
        id: 'txn_sal_1',
        type: 'income',
        amount: 85000,
        category: 'Salary',
        date: `${curYear}-${curMonth}-01`,
        time: '10:00',
        paymentMethod: 'bank_transfer',
        merchant: 'TechCorp Solutions Pvt Ltd',
        description: 'Monthly Salary Credit',
        receiptUrl: null,
        isRecurring: true
      },
      {
        id: 'txn_freelance_1',
        type: 'income',
        amount: 24500,
        category: 'Freelance',
        date: `${curYear}-${curMonth}-04`,
        time: '16:30',
        paymentMethod: 'upi',
        merchant: 'Global Studio Client',
        description: 'UI/UX Design Milestone 2',
        receiptUrl: null,
        isRecurring: false
      },
      {
        id: 'txn_rent_1',
        type: 'expense',
        amount: 18000,
        category: 'Rent',
        date: `${curYear}-${curMonth}-02`,
        time: '11:15',
        paymentMethod: 'bank_transfer',
        merchant: 'Landlord - Sharma House',
        description: 'Apartment monthly rent',
        receiptUrl: Utils.generateSampleReceipt('Sharma Properties', '₹18,000', `${curYear}-${curMonth}-02`),
        isRecurring: true
      },
      {
        id: 'txn_groc_1',
        type: 'expense',
        amount: 3850,
        category: 'Groceries',
        date: `${curYear}-${curMonth}-03`,
        time: '18:40',
        paymentMethod: 'upi',
        merchant: 'Blinkit / Nature Basket',
        description: 'Weekly organic groceries & pantry supplies',
        receiptUrl: Utils.generateSampleReceipt('Blinkit Quick', '₹3,850', `${curYear}-${curMonth}-03`),
        isRecurring: false
      },
      {
        id: 'txn_food_1',
        type: 'expense',
        amount: 720,
        category: 'Food',
        date: `${curYear}-${curMonth}-05`,
        time: '20:15',
        paymentMethod: 'upi',
        merchant: 'Swiggy - Punjabi Rasoi',
        description: 'Dinner delivery with friends',
        receiptUrl: null,
        isRecurring: false
      },
      {
        id: 'txn_wifi_1',
        type: 'expense',
        amount: 999,
        category: 'Bills',
        date: `${curYear}-${curMonth}-06`,
        time: '09:00',
        paymentMethod: 'upi',
        merchant: 'Airtel Xstream Fiber',
        description: 'Broadband Fiber 200Mbps',
        receiptUrl: Utils.generateSampleReceipt('Airtel Telemedia', '₹999', `${curYear}-${curMonth}-06`),
        isRecurring: true
      },
      {
        id: 'txn_shop_1',
        type: 'expense',
        amount: 4200,
        category: 'Shopping',
        date: `${curYear}-${curMonth}-06`,
        time: '17:20',
        paymentMethod: 'credit_card',
        merchant: 'Zara Lifestyle Mall',
        description: 'Autumn formal blazer and shirt',
        receiptUrl: Utils.generateSampleReceipt('Zara Fashion Store', '₹4,200', `${curYear}-${curMonth}-06`),
        isRecurring: false
      },
      {
        id: 'txn_uber_1',
        type: 'expense',
        amount: 430,
        category: 'Transportation',
        date: `${curYear}-${curMonth}-07`,
        time: '14:10',
        paymentMethod: 'upi',
        merchant: 'Uber Premier',
        description: 'Cab ride to client office meeting',
        receiptUrl: null,
        isRecurring: false
      },
      {
        id: 'txn_netf_1',
        type: 'expense',
        amount: 649,
        category: 'Subscriptions',
        date: `${curYear}-${curMonth}-07`,
        time: '08:30',
        paymentMethod: 'credit_card',
        merchant: 'Netflix India',
        description: 'Premium Ultra HD Plan',
        receiptUrl: null,
        isRecurring: true
      },
      {
        id: 'txn_food_2',
        type: 'expense',
        amount: 1450,
        category: 'Food',
        date: `${curYear}-${curMonth}-08`,
        time: '21:00',
        paymentMethod: 'credit_card',
        merchant: 'Social Cafe & Lounge',
        description: 'Weekend team dinner',
        receiptUrl: null,
        isRecurring: false
      },
      {
        id: 'txn_inv_1',
        type: 'income',
        amount: 3200,
        category: 'Investment',
        date: `${curYear}-${curMonth}-08`,
        time: '12:00',
        paymentMethod: 'bank_transfer',
        merchant: 'Zerodha Broking',
        description: 'Quarterly Dividend Payout',
        receiptUrl: null,
        isRecurring: false
      }
    ];

    const defaultBudgets = {
      overall: 55000,
      categories: [
        { id: 'b_food', category: 'Food', limit: 8000 },
        { id: 'b_groc', category: 'Groceries', limit: 12000 },
        { id: 'b_shop', category: 'Shopping', limit: 7000 },
        { id: 'b_trans', category: 'Transportation', limit: 4000 },
        { id: 'b_bills', category: 'Bills', limit: 6000 },
        { id: 'b_ent', category: 'Entertainment', limit: 4000 },
        { id: 'b_rent', category: 'Rent', limit: 18000 },
        { id: 'b_subs', category: 'Subscriptions', limit: 2500 }
      ]
    };

    const defaultGoals = [
      {
        id: 'goal_emergency',
        name: 'Emergency Fund',
        targetAmount: 150000,
        currentSaved: 110000,
        targetDate: `${curYear}-12-31`,
        category: 'Savings',
        icon: 'shield-check',
        color: '#10B981'
      },
      {
        id: 'goal_laptop',
        name: 'New MacBook M3 Pro',
        targetAmount: 140000,
        currentSaved: 88000,
        targetDate: `${curYear}-11-30`,
        category: 'Gadgets',
        icon: 'laptop',
        color: '#6366F1'
      },
      {
        id: 'goal_vacation',
        name: 'Bali Vacation Trip',
        targetAmount: 60000,
        currentSaved: 42000,
        targetDate: `${curYear}-12-25`,
        category: 'Travel',
        icon: 'palmtree',
        color: '#06B6D4'
      },
      {
        id: 'goal_bike',
        name: 'Royal Enfield Hunter',
        targetAmount: 180000,
        currentSaved: 65000,
        targetDate: `${curYear + 1}-03-31`,
        category: 'Vehicle',
        icon: 'bike',
        color: '#F59E0B'
      }
    ];

    const defaultRecurring = [
      {
        id: 'rec_rent',
        name: 'Apartment Rent',
        amount: 18000,
        frequency: 'Monthly',
        nextDate: `${curYear}-${String(Number(curMonth) + 1).padStart(2, '0')}-01`,
        category: 'Rent',
        paymentMethod: 'bank_transfer',
        active: true
      },
      {
        id: 'rec_netflix',
        name: 'Netflix Premium',
        amount: 649,
        frequency: 'Monthly',
        nextDate: `${curYear}-${curMonth}-14`,
        category: 'Subscriptions',
        paymentMethod: 'credit_card',
        active: true
      },
      {
        id: 'rec_spotify',
        name: 'Spotify Family',
        amount: 179,
        frequency: 'Monthly',
        nextDate: `${curYear}-${curMonth}-18`,
        category: 'Subscriptions',
        paymentMethod: 'upi',
        active: true
      },
      {
        id: 'rec_wifi',
        name: 'Airtel Broadband',
        amount: 999,
        frequency: 'Monthly',
        nextDate: `${curYear}-${curMonth}-12`,
        category: 'Bills',
        paymentMethod: 'upi',
        active: true
      },
      {
        id: 'rec_emi',
        name: 'Car Loan EMI',
        amount: 11200,
        frequency: 'Monthly',
        nextDate: `${curYear}-${curMonth}-10`,
        category: 'Bills',
        paymentMethod: 'bank_transfer',
        active: true
      },
      {
        id: 'rec_sip',
        name: 'Nifty 50 Index SIP',
        amount: 10000,
        frequency: 'Monthly',
        nextDate: `${curYear}-${curMonth}-15`,
        category: 'Investment',
        paymentMethod: 'bank_transfer',
        active: true
      }
    ];

    const defaultSettings = {
      currency: 'INR',
      theme: 'light',
      userName: 'Dnyaneshwar',
      userEmail: 'dnyaneshwar@finflow.app',
      monthlyIncomeTarget: 100000,
      soundEnabled: true,
      pinLock: {
        enabled: false,
        pin: '1234'
      },
      customCategories: []
    };

    const defaultNotifications = [
      {
        id: 'notif_1',
        title: 'Upcoming Bill Due',
        message: 'Car Loan EMI of ₹11,200 is due in 2 days.',
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 'notif_2',
        title: 'Savings Goal Milestone',
        message: 'MacBook Pro goal reached 62% progress! 🎉',
        type: 'info',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: false
      },
      {
        id: 'notif_3',
        title: 'Budget Alert',
        message: 'Shopping expenses reached 60% of monthly budget.',
        type: 'info',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        read: true
      }
    ];

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(defaultTransactions));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(defaultBudgets));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(defaultGoals));
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(defaultRecurring));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifications));

    this.emit('store:reset', true);
  },

  // ==========================================
  // TRANSACTIONS CRUD
  // ==========================================
  getTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getTransactionById(id) {
    return this.getTransactions().find(t => t.id === id);
  },

  addTransaction(txnData) {
    const list = this.getTransactions();
    const newTxn = {
      ...txnData,
      id: txnData.id || Utils.generateId('txn'),
      amount: Math.abs(Number(txnData.amount) || 0)
    };
    list.unshift(newTxn);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    this.checkBudgetAlerts(newTxn);
    this.emit('transactions:updated', list);
    return newTxn;
  },

  updateTransaction(id, updatedData) {
    const list = this.getTransactions();
    const index = list.findIndex(t => t.id === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...updatedData,
        amount: Math.abs(Number(updatedData.amount) || list[index].amount)
      };
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
      this.emit('transactions:updated', list);
      return list[index];
    }
    return null;
  },

  deleteTransaction(id) {
    const list = this.getTransactions();
    const filtered = list.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
    this.emit('transactions:updated', filtered);
  },

  // ==========================================
  // BUDGETS CRUD
  // ==========================================
  getBudgets() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return data ? JSON.parse(data) : { overall: 50000, categories: [] };
    } catch {
      return { overall: 50000, categories: [] };
    }
  },

  saveBudgets(budgetsData) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgetsData));
    this.emit('budgets:updated', budgetsData);
  },

  setOverallBudget(amount) {
    const b = this.getBudgets();
    b.overall = Number(amount) || 0;
    this.saveBudgets(b);
  },

  saveCategoryBudget(category, limit) {
    const b = this.getBudgets();
    const existing = b.categories.find(c => c.category.toLowerCase() === category.toLowerCase());
    if (existing) {
      existing.limit = Number(limit);
    } else {
      b.categories.push({
        id: Utils.generateId('b'),
        category,
        limit: Number(limit)
      });
    }
    this.saveBudgets(b);
  },

  deleteCategoryBudget(id) {
    const b = this.getBudgets();
    b.categories = b.categories.filter(c => c.id !== id);
    this.saveBudgets(b);
  },

  // ==========================================
  // SAVINGS GOALS CRUD
  // ==========================================
  getGoals() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addGoal(goal) {
    const list = this.getGoals();
    const newGoal = {
      ...goal,
      id: goal.id || Utils.generateId('goal'),
      currentSaved: Number(goal.currentSaved) || 0,
      targetAmount: Number(goal.targetAmount) || 0
    };
    list.push(newGoal);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list));
    this.emit('goals:updated', list);
    return newGoal;
  },

  updateGoal(id, data) {
    const list = this.getGoals();
    const index = list.findIndex(g => g.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...data };
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list));
      this.emit('goals:updated', list);
      return list[index];
    }
    return null;
  },

  addMoneyToGoal(id, amount) {
    const list = this.getGoals();
    const goal = list.find(g => g.id === id);
    if (goal) {
      const addVal = Number(amount) || 0;
      goal.currentSaved = (goal.currentSaved || 0) + addVal;
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list));

      // Also record as a savings transaction
      this.addTransaction({
        type: 'expense',
        amount: addVal,
        category: 'Other',
        merchant: `Goal: ${goal.name}`,
        description: `Deposit into savings goal: ${goal.name}`,
        paymentMethod: 'bank_transfer',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().substring(0, 5)
      });

      if (goal.currentSaved >= goal.targetAmount) {
        this.addNotification({
          title: 'Goal Achieved! 🏆',
          message: `Congratulations! You have reached 100% of your goal: ${goal.name}!`,
          type: 'success'
        });
      }

      this.emit('goals:updated', list);
    }
  },

  withdrawFromGoal(id, amount) {
    const list = this.getGoals();
    const goal = list.find(g => g.id === id);
    if (goal) {
      const withdrawVal = Number(amount) || 0;
      goal.currentSaved = Math.max(0, (goal.currentSaved || 0) - withdrawVal);
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list));

      // Record as income
      this.addTransaction({
        type: 'income',
        amount: withdrawVal,
        category: 'Other',
        merchant: `Goal: ${goal.name}`,
        description: `Withdrawn from savings goal: ${goal.name}`,
        paymentMethod: 'bank_transfer',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().substring(0, 5)
      });

      this.emit('goals:updated', list);
    }
  },

  deleteGoal(id) {
    const list = this.getGoals().filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list));
    this.emit('goals:updated', list);
  },

  // ==========================================
  // RECURRING EXPENSES CRUD
  // ==========================================
  getRecurring() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECURRING);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addRecurring(item) {
    const list = this.getRecurring();
    const newItem = {
      ...item,
      id: item.id || Utils.generateId('rec'),
      amount: Number(item.amount) || 0,
      active: item.active !== false
    };
    list.push(newItem);
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(list));
    this.emit('recurring:updated', list);
    return newItem;
  },

  updateRecurring(id, data) {
    const list = this.getRecurring();
    const index = list.findIndex(r => r.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...data };
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(list));
      this.emit('recurring:updated', list);
      return list[index];
    }
    return null;
  },

  deleteRecurring(id) {
    const list = this.getRecurring().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(list));
    this.emit('recurring:updated', list);
  },

  payRecurring(id) {
    const list = this.getRecurring();
    const item = list.find(r => r.id === id);
    if (item) {
      // Log expense transaction
      this.addTransaction({
        type: 'expense',
        amount: item.amount,
        category: item.category,
        merchant: item.name,
        description: `Recurring bill payment: ${item.name}`,
        paymentMethod: item.paymentMethod || 'upi',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().substring(0, 5),
        receiptUrl: Utils.generateSampleReceipt(item.name, Utils.formatCurrency(item.amount, this.getSettings().currency), new Date().toISOString().split('T')[0])
      });

      // Shift next due date forward by 1 month
      const currentNext = new Date(item.nextDate);
      currentNext.setMonth(currentNext.getMonth() + 1);
      item.nextDate = currentNext.toISOString().split('T')[0];

      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(list));
      this.emit('recurring:updated', list);
      Utils.showToast(`Paid ${item.name} successfully!`, 'success');
      Utils.playSound('success');
    }
  },

  // ==========================================
  // SETTINGS & PROFILE
  // ==========================================
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : { currency: 'INR', theme: 'light' };
    } catch {
      return { currency: 'INR', theme: 'light' };
    }
  },

  updateSettings(newSettings) {
    const cur = this.getSettings();
    const updated = { ...cur, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.emit('settings:updated', updated);
    return updated;
  },

  addCustomCategory(category) {
    const settings = this.getSettings();
    settings.customCategories = settings.customCategories || [];
    settings.customCategories.push(category);
    this.updateSettings(settings);
  },

  removeCustomCategory(name) {
    const settings = this.getSettings();
    settings.customCategories = (settings.customCategories || []).filter(c => c.name.toLowerCase() !== name.toLowerCase());
    this.updateSettings(settings);
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  getNotifications() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addNotification(notif) {
    const list = this.getNotifications();
    list.unshift({
      id: Utils.generateId('notif'),
      timestamp: new Date().toISOString(),
      read: false,
      ...notif
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.emit('notifications:updated', list);
  },

  markNotificationsRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.emit('notifications:updated', list);
  },

  clearNotifications() {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    this.emit('notifications:updated', []);
  },

  // Check budget thresholds when an expense occurs
  checkBudgetAlerts(txn) {
    if (txn.type !== 'expense') return;
    const budgets = this.getBudgets();
    const txns = this.getTransactions();
    const curMonth = new Date().toISOString().substring(0, 7); // '2026-10'

    // Calculate month's category spending
    const catSpent = txns
      .filter(t => t.type === 'expense' && t.date.startsWith(curMonth) && t.category.toLowerCase() === txn.category.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);

    const budgetMatch = budgets.categories.find(c => c.category.toLowerCase() === txn.category.toLowerCase());
    if (budgetMatch && budgetMatch.limit > 0) {
      const ratio = catSpent / budgetMatch.limit;
      if (ratio >= 1.0) {
        this.addNotification({
          title: `Budget Exceeded: ${txn.category}`,
          message: `You spent ${Utils.formatCurrency(catSpent, this.getSettings().currency)} which exceeds your limit of ${Utils.formatCurrency(budgetMatch.limit, this.getSettings().currency)}!`,
          type: 'alert'
        });
      } else if (ratio >= 0.85) {
        this.addNotification({
          title: `Budget Warning: ${txn.category}`,
          message: `You have utilized ${(ratio * 100).toFixed(0)}% of your monthly budget for ${txn.category}.`,
          type: 'warning'
        });
      }
    }
  },

  // ==========================================
  // BACKUP & RESTORE
  // ==========================================
  exportDataJSON() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions: this.getTransactions(),
      budgets: this.getBudgets(),
      goals: this.getGoals(),
      recurring: this.getRecurring(),
      settings: this.getSettings(),
      notifications: this.getNotifications()
    }, null, 2);
  },

  importDataJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
      if (data.budgets) localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(data.budgets));
      if (data.goals) localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data.goals));
      if (data.recurring) localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(data.recurring));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.notifications) localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));

      this.emit('store:imported', true);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};

window.Store = Store;
Store.init();
