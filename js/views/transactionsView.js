/* ==========================================================================
   FINFLOW - TRANSACTIONS VIEW CONTROLLER
   ========================================================================== */

const TransactionsView = {
  searchQuery: '',
  filterType: 'all',
  filterCategory: 'all',
  filterMethod: 'all',
  sortBy: 'date_desc',

  init() {
    Store.subscribe('transactions:updated', () => this.render());
    Store.subscribe('settings:updated', () => this.render());
  },

  render() {
    const container = document.getElementById('view-transactions');
    if (!container) return;

    const currency = Store.getSettings().currency;
    const transactions = this.getFilteredAndSorted();
    const categories = [...Utils.DEFAULT_CATEGORIES, ...(Store.getSettings().customCategories || [])];

    container.innerHTML = `
      <div class="card-header" style="padding: 0 0 var(--space-md) 0;">
        <div>
          <h2>Transaction History</h2>
          <p>Search, filter, categorize, and inspect your financial records</p>
        </div>
        <div style="display: flex; gap: var(--space-xs);">
          <button class="btn btn-outline" onclick="TransactionsView.exportCSV()">
            <i data-lucide="download"></i> Export CSV
          </button>
          <button class="btn btn-primary" onclick="App.openTransactionModal()">
            <i data-lucide="plus"></i> Add Transaction
          </button>
        </div>
      </div>

      <!-- Advanced Filters Bar -->
      <div class="transactions-filter-bar">
        <div class="filters-group">
          <!-- Search Field -->
          <div class="search-field-wrapper">
            <i data-lucide="search"></i>
            <input 
              type="text" 
              class="filter-input-search" 
              placeholder="Search merchant, notes..." 
              value="${this.searchQuery}"
              oninput="TransactionsView.onSearch(this.value)"
            />
          </div>

          <!-- Type Filter -->
          <select class="filter-select" onchange="TransactionsView.onTypeChange(this.value)">
            <option value="all" ${this.filterType === 'all' ? 'selected' : ''}>All Types</option>
            <option value="expense" ${this.filterType === 'expense' ? 'selected' : ''}>Expenses Only</option>
            <option value="income" ${this.filterType === 'income' ? 'selected' : ''}>Income Only</option>
          </select>

          <!-- Category Filter -->
          <select class="filter-select" onchange="TransactionsView.onCategoryChange(this.value)">
            <option value="all" ${this.filterCategory === 'all' ? 'selected' : ''}>All Categories</option>
            ${categories.map(c => `
              <option value="${c.name}" ${this.filterCategory === c.name ? 'selected' : ''}>${c.name}</option>
            `).join('')}
          </select>

          <!-- Payment Method Filter -->
          <select class="filter-select" onchange="TransactionsView.onMethodChange(this.value)">
            <option value="all" ${this.filterMethod === 'all' ? 'selected' : ''}>All Payment Methods</option>
            ${Utils.PAYMENT_METHODS.map(m => `
              <option value="${m.id}" ${this.filterMethod === m.id ? 'selected' : ''}>${m.name}</option>
            `).join('')}
          </select>

          <!-- Sort Order -->
          <select class="filter-select" onchange="TransactionsView.onSortChange(this.value)">
            <option value="date_desc" ${this.sortBy === 'date_desc' ? 'selected' : ''}>Newest First</option>
            <option value="date_asc" ${this.sortBy === 'date_asc' ? 'selected' : ''}>Oldest First</option>
            <option value="amount_desc" ${this.sortBy === 'amount_desc' ? 'selected' : ''}>Highest Amount</option>
            <option value="amount_asc" ${this.sortBy === 'amount_asc' ? 'selected' : ''}>Lowest Amount</option>
          </select>
        </div>

        <div style="font-size: 0.85rem; color: var(--text-tertiary); font-weight: 600;">
          Showing ${transactions.length} record${transactions.length !== 1 ? 's' : ''}
        </div>
      </div>

      <!-- Transactions Table Card -->
      <div class="card">
        <div class="card-body" style="padding: 0;">
          ${transactions.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon"><i data-lucide="receipt"></i></div>
              <h4>No Transactions Found</h4>
              <p>Try clearing filters or search terms, or record a new transaction.</p>
              <button class="btn btn-primary btn-sm" onclick="App.openTransactionModal()">+ New Transaction</button>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Merchant / Description</th>
                    <th>Category</th>
                    <th>Payment Method</th>
                    <th style="text-align: right;">Amount</th>
                    <th style="text-align: center; width: 140px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${transactions.map(t => {
                    const cat = Utils.getCategoryMeta(t.category);
                    const isIncome = t.type === 'income';
                    const method = Utils.getPaymentMethodMeta(t.paymentMethod);
                    return `
                      <tr>
                        <td>
                          <div style="font-weight: 600; font-size: 0.88rem;">${Utils.formatDate(t.date)}</div>
                          <div style="font-size: 0.72rem; color: var(--text-tertiary);">${t.time || ''}</div>
                        </td>
                        <td>
                          <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="stat-icon" style="width: 36px; height: 36px; background: ${cat.color}20; color: ${cat.color}; border-radius: 10px; flex-shrink: 0;">
                              <i data-lucide="${cat.icon}"></i>
                            </div>
                            <div>
                              <div style="font-weight: 600; font-size: 0.92rem; display: flex; align-items: center; gap: 6px;">
                                ${t.merchant || t.description || 'Transaction'}
                                ${t.receiptUrl ? `
                                  <span class="has-receipt-badge" title="View attached receipt" onclick="App.viewReceipt('${t.id}')">
                                    <i data-lucide="paperclip" style="width: 12px; height: 12px;"></i> Receipt
                                  </span>
                                ` : ''}
                              </div>
                              <div style="font-size: 0.78rem; color: var(--text-tertiary); max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${t.description || t.category}
                              </div>
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
                          <span class="badge badge-neutral">
                            <i data-lucide="${method.icon}" style="width: 12px; height: 12px;"></i>
                            ${method.name}
                          </span>
                        </td>
                        <td style="text-align: right;">
                          <span class="transaction-amount-text ${isIncome ? 'income' : 'expense'}">
                            ${isIncome ? '+' : '-'}${Utils.formatCurrency(t.amount, currency)}
                          </span>
                        </td>
                        <td>
                          <div class="transaction-actions-cell" style="justify-content: center;">
                            <button class="btn btn-outline btn-icon-only btn-sm" title="View Details" onclick="App.viewTransactionDetails('${t.id}')">
                              <i data-lucide="eye"></i>
                            </button>
                            <button class="btn btn-outline btn-icon-only btn-sm" title="Duplicate Transaction" onclick="TransactionsView.duplicateTransaction('${t.id}')">
                              <i data-lucide="copy"></i>
                            </button>
                            <button class="btn btn-outline btn-icon-only btn-sm" title="Edit" onclick="App.openEditTransactionModal('${t.id}')">
                              <i data-lucide="edit-3"></i>
                            </button>
                            <button class="btn btn-danger-ghost btn-icon-only btn-sm" title="Delete" onclick="TransactionsView.confirmDelete('${t.id}')">
                              <i data-lucide="trash-2"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ root: container });
  },

  getFilteredAndSorted() {
    let list = Store.getTransactions();

    // Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(t =>
        (t.merchant && t.merchant.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        String(t.amount).includes(q)
      );
    }

    // Type filter
    if (this.filterType !== 'all') {
      list = list.filter(t => t.type === this.filterType);
    }

    // Category filter
    if (this.filterCategory !== 'all') {
      list = list.filter(t => t.category.toLowerCase() === this.filterCategory.toLowerCase());
    }

    // Payment method filter
    if (this.filterMethod !== 'all') {
      list = list.filter(t => (t.paymentMethod || 'cash').toLowerCase() === this.filterMethod.toLowerCase());
    }

    // Sort
    list.sort((a, b) => {
      if (this.sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
      if (this.sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
      if (this.sortBy === 'amount_desc') return b.amount - a.amount;
      if (this.sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

    return list;
  },

  onSearch(val) {
    this.searchQuery = val;
    this.render();
  },

  onTypeChange(val) {
    this.filterType = val;
    this.render();
  },

  onCategoryChange(val) {
    this.filterCategory = val;
    this.render();
  },

  onMethodChange(val) {
    this.filterMethod = val;
    this.render();
  },

  onSortChange(val) {
    this.sortBy = val;
    this.render();
  },

  duplicateTransaction(id) {
    const original = Store.getTransactionById(id);
    if (!original) return;

    const copy = {
      ...original,
      id: Utils.generateId('txn'),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      description: `${original.description || original.merchant} (Copy)`
    };

    Store.addTransaction(copy);
    Utils.showToast('Transaction duplicated with today\'s date!', 'success');
    Utils.playSound('success');
  },

  confirmDelete(id) {
    App.openConfirmDialog({
      title: 'Delete Transaction?',
      message: 'Are you sure you want to delete this transaction record? This action cannot be undone.',
      confirmText: 'Delete',
      confirmClass: 'btn-expense',
      onConfirm: () => {
        Store.deleteTransaction(id);
        Utils.playSound('delete');
        Utils.showToast('Transaction deleted successfully', 'info');
      }
    });
  },

  exportCSV() {
    const txns = this.getFilteredAndSorted();
    const rows = txns.map(t => ({
      ID: t.id,
      Date: t.date,
      Time: t.time || '',
      Type: t.type,
      Category: t.category,
      Amount: t.amount,
      PaymentMethod: t.paymentMethod,
      Merchant: t.merchant || '',
      Description: t.description || '',
      HasReceipt: t.receiptUrl ? 'Yes' : 'No'
    }));
    Utils.exportToCsv('finflow_transactions', rows);
  }
};

window.TransactionsView = TransactionsView;
