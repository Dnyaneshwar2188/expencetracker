/* ==========================================================================
   FINFLOW - UTILITY FUNCTIONS & HELPERS
   ========================================================================== */

const Utils = {
  // Available Currencies
  CURRENCIES: {
    INR: { symbol: '₹', code: 'INR', name: 'Indian Rupee (₹)', locale: 'en-IN' },
    USD: { symbol: '$', code: 'USD', name: 'US Dollar ($)', locale: 'en-US' },
    EUR: { symbol: '€', code: 'EUR', name: 'Euro (€)', locale: 'de-DE' },
    GBP: { symbol: '£', code: 'GBP', name: 'British Pound (£)', locale: 'en-GB' },
    AED: { symbol: 'AED', code: 'AED', name: 'UAE Dirham (AED)', locale: 'en-AE' },
    CAD: { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar (C$)', locale: 'en-CA' },
    AUD: { symbol: 'A$', code: 'AUD', name: 'Australian Dollar (A$)', locale: 'en-AU' },
    JPY: { symbol: '¥', code: 'JPY', name: 'Japanese Yen (¥)', locale: 'ja-JP' }
  },

  // Category visual metadata (icons & colors)
  DEFAULT_CATEGORIES: [
    { id: 'cat_food', name: 'Food', icon: 'utensils', color: '#F97316' },
    { id: 'cat_shopping', name: 'Shopping', icon: 'shopping-bag', color: '#EC4899' },
    { id: 'cat_transport', name: 'Transportation', icon: 'car', color: '#3B82F6' },
    { id: 'cat_bills', name: 'Bills', icon: 'zap', color: '#EAB308' },
    { id: 'cat_entertainment', name: 'Entertainment', icon: 'film', color: '#8B5CF6' },
    { id: 'cat_education', name: 'Education', icon: 'book-open', color: '#14B8A6' },
    { id: 'cat_healthcare', name: 'Healthcare', icon: 'activity', color: '#EF4444' },
    { id: 'cat_travel', name: 'Travel', icon: 'plane', color: '#06B6D4' },
    { id: 'cat_groceries', name: 'Groceries', icon: 'shopping-cart', color: '#10B981' },
    { id: 'cat_rent', name: 'Rent', icon: 'home', color: '#6366F1' },
    { id: 'cat_subscriptions', name: 'Subscriptions', icon: 'credit-card', color: '#A855F7' },
    { id: 'cat_salary', name: 'Salary', icon: 'briefcase', color: '#10B981', isIncome: true },
    { id: 'cat_freelance', name: 'Freelance', icon: 'laptop', color: '#059669', isIncome: true },
    { id: 'cat_investment', name: 'Investment', icon: 'trending-up', color: '#3B82F6', isIncome: true },
    { id: 'cat_other', name: 'Other', icon: 'more-horizontal', color: '#64748B' }
  ],

  PAYMENT_METHODS: [
    { id: 'upi', name: 'UPI', icon: 'smartphone', color: '#8B5CF6' },
    { id: 'credit_card', name: 'Credit Card', icon: 'credit-card', color: '#EC4899' },
    { id: 'debit_card', name: 'Debit Card', icon: 'credit-card', color: '#3B82F6' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: 'building-2', color: '#10B981' },
    { id: 'cash', name: 'Cash', icon: 'banknote', color: '#F59E0B' },
    { id: 'wallet', name: 'Wallet', icon: 'wallet', color: '#06B6D4' }
  ],

  // Unique ID
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  },

  // Format currency
  formatCurrency(amount, currencyCode = 'INR') {
    const config = this.CURRENCIES[currencyCode] || this.CURRENCIES.INR;
    const num = Number(amount) || 0;
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(num);
    } catch {
      return `${config.symbol}${num.toLocaleString('en-IN')}`;
    }
  },

  // Format dates
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  formatShortDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  },

  formatDateTime(dateString, timeString) {
    const dStr = this.formatDate(dateString);
    if (!timeString) return dStr;
    return `${dStr} • ${timeString}`;
  },

  getRelativeTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffDays = Math.round((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return this.formatDate(dateString);
  },

  // Category Icon & Color Lookup
  getCategoryMeta(categoryName, customCategories = []) {
    const all = [...this.DEFAULT_CATEGORIES, ...customCategories];
    const match = all.find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase());
    if (match) return match;
    return {
      name: categoryName || 'Other',
      icon: 'tag',
      color: '#64748B'
    };
  },

  // Payment Method Meta
  getPaymentMethodMeta(methodId) {
    const match = this.PAYMENT_METHODS.find(p => p.id === methodId || p.name.toLowerCase() === (methodId || '').toLowerCase());
    if (match) return match;
    return { id: methodId || 'cash', name: methodId || 'Cash', icon: 'wallet', color: '#64748B' };
  },

  // Toast Notification System
  showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-circle';
    if (type === 'warning') iconName = 'alert-triangle';

    toast.innerHTML = `
      <div class="toast-icon"><i data-lucide="${iconName}"></i></div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons({ root: toast });

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    };

    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, duration);
  },

  // Synthesized Web Audio Sound Effects
  playSound(type = 'click') {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'delete') {
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      }
    } catch {
      // Audio context disabled or not allowed
    }
  },

  // Export Data as CSV
  exportToCsv(filename, rows) {
    if (!rows || !rows.length) {
      this.showToast('No data to export', 'warning');
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        headers
          .map(header => {
            let val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
            val = val.replace(/"/g, '""');
            return `"${val}"`;
          })
          .join(',')
      )
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showToast(`Exported ${filename}.csv successfully!`, 'success');
  },

  // Generate Sample Receipt SVG Data URI for realistic preview
  generateSampleReceipt(merchant, amount, date) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="520" viewBox="0 0 400 520">
        <rect width="400" height="520" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
        <rect x="20" y="20" width="360" height="80" rx="8" fill="#4F46E5"/>
        <text x="200" y="65" font-family="sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">TAX INVOICE</text>
        <text x="200" y="85" font-family="sans-serif" font-size="12" fill="#C7D2FE" text-anchor="middle">${merchant || 'Merchant Receipt'}</text>
        <circle cx="20" cy="120" r="12" fill="#0B0F19"/>
        <circle cx="380" cy="120" r="12" fill="#0B0F19"/>
        <line x1="35" y1="120" x2="365" y2="120" stroke="#CBD5E1" stroke-dasharray="6,6" stroke-width="2"/>
        <text x="40" y="160" font-family="sans-serif" font-size="13" fill="#64748B">Date &amp; Time:</text>
        <text x="360" y="160" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="end">${date || '2026-10-08'}</text>
        <text x="40" y="195" font-family="sans-serif" font-size="13" fill="#64748B">Order / Ref ID:</text>
        <text x="360" y="195" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="end">TXN-${Math.floor(100000 + Math.random() * 900000)}</text>
        <line x1="40" y1="225" x2="360" y2="225" stroke="#E2E8F0" stroke-width="1"/>
        <text x="40" y="260" font-family="sans-serif" font-size="14" fill="#334155">Subtotal</text>
        <text x="360" y="260" font-family="sans-serif" font-size="14" fill="#334155" text-anchor="end">${amount}</text>
        <text x="40" y="290" font-family="sans-serif" font-size="13" fill="#64748B">GST / Tax (18% Incl.)</text>
        <text x="360" y="290" font-family="sans-serif" font-size="13" fill="#64748B" text-anchor="end">Included</text>
        <line x1="40" y1="320" x2="360" y2="320" stroke="#CBD5E1" stroke-width="1.5"/>
        <text x="40" y="360" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0F172A">Total Paid</text>
        <text x="360" y="360" font-family="sans-serif" font-size="20" font-weight="bold" fill="#10B981" text-anchor="end">${amount}</text>
        <rect x="100" y="410" width="200" height="38" rx="6" fill="#ECFDF5" stroke="#A7F3D0"/>
        <text x="200" y="434" font-family="sans-serif" font-size="13" font-weight="bold" fill="#059669" text-anchor="middle">✓ Payment Verified</text>
        <text x="200" y="490" font-family="sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Thank you for your business!</text>
      </svg>
    `;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
};

window.Utils = Utils;
