/* ==========================================================================
   FINFLOW - SETTINGS & PREFERENCES VIEW CONTROLLER
   ========================================================================== */

const SettingsView = {
  init() {
    Store.subscribe('settings:updated', () => this.render());
  },

  render() {
    const container = document.getElementById('view-settings');
    if (!container) return;

    const settings = Store.getSettings();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    container.innerHTML = `
      <div class="card-header" style="padding: 0 0 var(--space-md) 0;">
        <div>
          <h2>Settings & System Preferences</h2>
          <p>Customize your profile, currency, theme, category tags, and data security</p>
        </div>
      </div>

      <div class="settings-grid">
        <!-- 1. Profile Information Card -->
        <div class="settings-card">
          <div class="card-header" style="padding: 0 0 var(--space-sm) 0;">
            <h3><i data-lucide="user" style="color: var(--primary-500);"></i> User Profile</h3>
          </div>
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="settingUserName" class="form-control" value="${settings.userName || ''}" placeholder="Your name">
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="settingUserEmail" class="form-control" value="${settings.userEmail || ''}" placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label class="form-label">Monthly Target Income (${settings.currency})</label>
            <input type="number" id="settingMonthlyTarget" class="form-control" value="${settings.monthlyIncomeTarget || 100000}">
          </div>
          <button class="btn btn-primary btn-sm" onclick="SettingsView.saveProfile()" style="align-self: flex-start;">
            <i data-lucide="save"></i> Save Profile
          </button>
        </div>

        <!-- 2. Currency & Localization Card -->
        <div class="settings-card">
          <div class="card-header" style="padding: 0 0 var(--space-sm) 0;">
            <h3><i data-lucide="coins" style="color: var(--color-warning);"></i> Currency & Display</h3>
          </div>
          <div class="form-group">
            <label class="form-label">Primary Currency</label>
            <select id="settingCurrency" class="form-control" onchange="SettingsView.changeCurrency(this.value)">
              ${Object.values(Utils.CURRENCIES).map(c => `
                <option value="${c.code}" ${settings.currency === c.code ? 'selected' : ''}>
                  ${c.name} (${c.symbol})
                </option>
              `).join('')}
            </select>
            <span style="font-size: 0.75rem; color: var(--text-tertiary);">Default is Indian Rupee (₹ INR). All amounts update instantly.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Interface Theme</label>
            <div style="display: flex; gap: var(--space-xs);">
              <button class="btn ${!isDark ? 'btn-primary' : 'btn-outline'} btn-sm" style="flex: 1;" onclick="App.setTheme('light')">
                <i data-lucide="sun"></i> Light Mode
              </button>
              <button class="btn ${isDark ? 'btn-primary' : 'btn-outline'} btn-sm" style="flex: 1;" onclick="App.setTheme('dark')">
                <i data-lucide="moon"></i> Dark Mode
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Audio & Sound FX</label>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.85rem; color: var(--text-secondary);">Synthesized interaction chimes</span>
              <button class="btn btn-outline btn-sm" onclick="SettingsView.toggleSound()">
                <i data-lucide="${settings.soundEnabled ? 'volume-2' : 'volume-x'}"></i>
                ${settings.soundEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>
          </div>
        </div>

        <!-- 3. Security & App PIN Lock -->
        <div class="settings-card">
          <div class="card-header" style="padding: 0 0 var(--space-sm) 0;">
            <h3><i data-lucide="shield" style="color: var(--color-income);"></i> Security & Passcode</h3>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Protect your financial privacy with a 4-digit PIN screen lock.
          </p>

          <div class="form-group">
            <label class="form-label">PIN Lock Protection</label>
            <div style="display: flex; align-items: center; gap: var(--space-sm);">
              <input 
                type="password" 
                id="settingPinInput" 
                class="form-control" 
                maxlength="4" 
                placeholder="4-digit PIN" 
                value="${settings.pinLock?.pin || '1234'}"
                style="letter-spacing: 0.3em; font-weight: bold; width: 140px; text-align: center;"
              />
              <button class="btn ${settings.pinLock?.enabled ? 'btn-expense' : 'btn-primary'} btn-sm" onclick="SettingsView.togglePinLock()">
                ${settings.pinLock?.enabled ? 'Disable PIN Lock' : 'Enable PIN Lock'}
              </button>
            </div>
          </div>

          <div style="margin-top: auto; padding-top: var(--space-sm); border-top: 1px solid var(--border-subtle);">
            <button class="btn btn-outline btn-sm" onclick="App.lockScreen()">
              <i data-lucide="lock"></i> Lock App Now
            </button>
          </div>
        </div>

        <!-- 4. Custom Categories Management -->
        <div class="settings-card">
          <div class="card-header" style="padding: 0 0 var(--space-sm) 0;">
            <h3><i data-lucide="tags" style="color: var(--primary-500);"></i> Custom Categories</h3>
          </div>
          
          <div class="form-row" style="margin-bottom: var(--space-xs);">
            <input type="text" id="newCategoryName" class="form-control" placeholder="New category name" style="flex: 2;">
            <input type="color" id="newCategoryColor" class="form-control" value="#6366F1" style="width: 50px; padding: 2px;">
            <button class="btn btn-primary btn-sm" onclick="SettingsView.addCategory()">
              <i data-lucide="plus"></i> Add
            </button>
          </div>

          <div class="category-manager-list">
            ${[...Utils.DEFAULT_CATEGORIES, ...(settings.customCategories || [])].map(cat => `
              <span class="manageable-category-chip">
                <span class="category-dot" style="background: ${cat.color};"></span>
                ${cat.name}
                ${cat.id && cat.id.startsWith('custom_') ? `
                  <i data-lucide="x" style="width: 12px; height: 12px; cursor: pointer; color: var(--color-expense);" onclick="SettingsView.removeCategory('${cat.name}')"></i>
                ` : ''}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- 5. Data Backup, Restore & Reset -->
        <div class="settings-card" style="grid-column: 1 / -1;">
          <div class="card-header" style="padding: 0 0 var(--space-sm) 0;">
            <h3><i data-lucide="database" style="color: var(--color-income);"></i> Data Management & Backups</h3>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            All your financial data is safely stored in your browser storage. You can backup, restore, or reset sample data anytime.
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-sm);">
            <button class="btn btn-outline" onclick="SettingsView.exportBackup()">
              <i data-lucide="download"></i> Download JSON Backup
            </button>

            <label class="btn btn-outline" style="cursor: pointer; margin-bottom: 0;">
              <i data-lucide="upload"></i> Restore from JSON
              <input type="file" accept=".json" style="display: none;" onchange="SettingsView.importBackup(event)">
            </label>

            <button class="btn btn-secondary" onclick="SettingsView.reloadSampleData()">
              <i data-lucide="refresh-cw"></i> Reload Demo Data
            </button>

            <button class="btn btn-danger-ghost" onclick="SettingsView.confirmResetAll()">
              <i data-lucide="trash-2"></i> Clear All Data
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ root: container });
  },

  saveProfile() {
    const name = document.getElementById('settingUserName')?.value || 'User';
    const email = document.getElementById('settingUserEmail')?.value || '';
    const target = Number(document.getElementById('settingMonthlyTarget')?.value) || 100000;

    Store.updateSettings({ userName: name, userEmail: email, monthlyIncomeTarget: target });
    Utils.showToast('Profile updated successfully!', 'success');
    Utils.playSound('success');
  },

  changeCurrency(cur) {
    Store.updateSettings({ currency: cur });
    Utils.showToast(`Currency changed to ${cur}`, 'success');
    Utils.playSound('click');
  },

  toggleSound() {
    const s = Store.getSettings();
    Store.updateSettings({ soundEnabled: !s.soundEnabled });
    Utils.showToast(`Sound ${!s.soundEnabled ? 'Enabled' : 'Muted'}`, 'info');
  },

  togglePinLock() {
    const s = Store.getSettings();
    const pin = document.getElementById('settingPinInput')?.value || '1234';
    if (pin.length !== 4) {
      Utils.showToast('PIN must be exactly 4 digits', 'warning');
      return;
    }
    const enabled = !s.pinLock?.enabled;
    Store.updateSettings({
      pinLock: { enabled, pin }
    });
    Utils.showToast(`PIN Lock ${enabled ? 'Enabled' : 'Disabled'}`, 'success');
    Utils.playSound('success');
  },

  addCategory() {
    const nameInput = document.getElementById('newCategoryName');
    const colorInput = document.getElementById('newCategoryColor');
    const name = nameInput?.value.trim();
    const color = colorInput?.value || '#6366F1';

    if (!name) {
      Utils.showToast('Please enter category name', 'warning');
      return;
    }

    Store.addCustomCategory({
      id: Utils.generateId('custom_cat'),
      name,
      color,
      icon: 'tag'
    });

    nameInput.value = '';
    Utils.showToast(`Category "${name}" added`, 'success');
    Utils.playSound('success');
    this.render();
  },

  removeCategory(name) {
    Store.removeCustomCategory(name);
    Utils.showToast(`Category "${name}" removed`, 'info');
    this.render();
  },

  exportBackup() {
    const jsonStr = Store.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    Utils.showToast('Backup JSON downloaded successfully!', 'success');
    Utils.playSound('success');
  },

  importBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const res = Store.importDataJSON(e.target.result);
      if (res.success) {
        Utils.showToast('Data restored successfully!', 'success');
        Utils.playSound('success');
        setTimeout(() => location.reload(), 600);
      } else {
        Utils.showToast(`Restore failed: ${res.error}`, 'error');
      }
    };
    reader.readAsText(file);
  },

  reloadSampleData() {
    App.openConfirmDialog({
      title: 'Reload Demo Data?',
      message: 'This will reset and load realistic demo transactions, budgets, goals, and bills.',
      confirmText: 'Reload Demo',
      confirmClass: 'btn-primary',
      onConfirm: () => {
        Store.resetToDefaults();
        Utils.showToast('Demo dataset reloaded successfully!', 'success');
        Utils.playSound('success');
      }
    });
  },

  confirmResetAll() {
    App.openConfirmDialog({
      title: 'Reset All Financial Data?',
      message: 'Are you sure? This will permanently wipe all transactions, budgets, and savings goals from this browser.',
      confirmText: 'Clear Everything',
      confirmClass: 'btn-expense',
      onConfirm: () => {
        localStorage.clear();
        Store.init();
        Utils.showToast('All financial data cleared', 'info');
        setTimeout(() => location.reload(), 500);
      }
    });
  }
};

window.SettingsView = SettingsView;
