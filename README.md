# 💸 FinFlow — Personal Expense Tracker & Finance Management App

FinFlow is a modern, responsive, and feature-rich **Personal Expense Tracker and Financial Management Web Application** crafted with a sleek fintech dashboard aesthetic, rich data visualization, and comprehensive budgeting controls.

---

## 🌟 Key Features

### 1. 📊 Interactive Dashboard
- **Real-Time Financial Overview**: Total Balance, Total Income, Total Expenses, Total Savings, and Savings Rate.
- **Quick Action Triggers**: Fast shortcuts for *+ Add Income*, *+ Add Expense*, *Transfer Money*, *Set Budget*, and *Add Savings Goal*.
- **Cash Flow Analysis**: Dual-bar comparison of Income vs. Expenses across recent months.
- **Category Breakdown**: Interactive Donut chart displaying proportion of expenditures.
- **Smart Financial Insights**: Dynamic AI-like behavioral insights (e.g. food spend warnings, budget safety runway, subscription commitments).
- **Recent Transactions & Upcoming Bills**: Live ledger preview and fast *Pay Now* actions.
- **Time Filters**: Filter metrics by *Today*, *This Week*, *This Month*, *Last Month*, or *All Time*.

### 2. 💳 Transaction Management
- Comprehensive transaction recording: Amount, Category, Date, Time, Payment Method, Merchant/Payee, and Notes.
- **Attached Tax Invoices/Receipts**: Upload receipts with thumbnail previews and full lightbox inspection.
- **Recurring Transactions**: Auto-tagging for recurring flows.
- **Live Search & Multi-Filters**: Instant debounced search by merchant or notes; filter by category, payment method, or type.
- **Quick Actions**: View details, duplicate previous transaction, edit, and delete with confirmation dialog.
- **Data Export**: One-click filtered CSV export.

### 3. 🎯 Budget Planning & Smart Alerts
- **Monthly Overall Budget Ceiling**: Hero progress banner displaying remaining buffer and safe daily spend rate.
- **Category-Wise Spending Caps**: Set dedicated monthly limits for Food, Groceries, Shopping, Transportation, Rent, Bills, Subscriptions, etc.
- **Threshold Visual Indicators**:
  - 🟢 **Normal**: < 80%
  - 🟡 **Warning**: 80% – 89%
  - 🟠 **Critical Alert**: 90% – 99%
  - 🔴 **Exceeded (with pulse animation)**: 100%+

### 4. 🏆 Savings Goals Tracker
- Track long-term funds (e.g., *Emergency Fund*, *New MacBook Pro*, *Vacation Trip*, *Vehicle Fund*).
- Visual progress meters, target completion dates, and remaining balances.
- **Add Money (Deposit)**: Modal to allocate funds to a goal with automatic ledger synchronization.
- **Withdraw Funds**: Safely transfer savings back into active circulation.

### 5. 🔄 Recurring Bills & Subscriptions
- Track Netflix, Spotify, Broadband Fiber, Rent, EMIs, SIP Mutual Funds, and Insurance.
- Compute total monthly commitment burden and projected annual expense.
- **Due Date Countdown**: Highlights bills due within 3 days.
- **One-Click "Pay & Log"**: Automatically logs expense into ledger and advances due date to next billing cycle.

### 6. 📈 Deep Analytics & Velocity Tracking
- Monthly financial KPIs: Income, Expenses, Daily Burn Rate, Savings Rate.
- **Daily Spending Velocity Curve**: Line chart tracking day-to-day burn rate.
- **Payment Method Distribution**: Compare UPI, Credit Card, Debit Card, Bank Transfer, and Cash usage.
- **Category Share Table**: Granular percentage share of every outflow category.

### 7. 🗓️ Financial Calendar View
- Interactive 7-column monthly calendar.
- Color-coded cashflow badges for daily income and daily expenses.
- Click any day cell to open the day's transaction drawer with quick *Add for this day* action.

### 8. 📄 Formal Statements & Reports
- Generate itemized monthly financial statements for any Month/Year.
- Executive summary with inflows, outflows, and net savings surplus.
- Export as CSV or use the built-in `@media print` styled **Print to PDF** button.

### 9. ⚙️ Profile, Customization & Security
- **Currency Switcher**: Default **Indian Rupee (₹ INR)**, plus USD ($), EUR (€), GBP (£), AED, JPY (¥), CAD, AUD.
- **Light Mode & Dark Mode**: Persistent theme toggle with smooth color transitions and dark-optimized charts.
- **4-Digit PIN Lock**: App security passcode protection with numeric keypad overlay.
- **Custom Categories**: Add custom expense categories with custom color pickers.
- **Data Backup & Restore**: Download full JSON backup, restore from file, reload realistic demo data, or reset.
- **Synthesized Web Audio FX**: Subtle sound effects on user interactions.

---

## 🛠️ Architecture & Technology Stack

- **Structure**: Semantic HTML5 with responsive layouts and modal dialogs.
- **Styling**: Pure Modern Vanilla CSS (CSS Custom Properties, Glassmorphism, CSS Grid, Flexbox, Keyframe animations).
- **Logic**: Modular Vanilla JavaScript (ES6+):
  - `js/store.js`: Central PubSub state management with `localStorage` persistence and realistic Indian demo data.
  - `js/utils.js`: Currency formatters, date formatters, audio synthesizer, CSV exporter, receipt generator.
  - `js/charts.js`: Chart.js wrapper with dark/light theme awareness.
  - `js/views/*`: View controllers for each application screen.
  - `js/app.js`: Global router, keyboard shortcuts (`Ctrl+K`, `Alt+N`, `Esc`), PIN lock, and notifications.
- **Vendors**: Offline local copies of Chart.js (`v4.4.1`) and Lucide Icons (`v0.344.0`) inside `assets/vendor/`.

---

## 🚀 How to Run Locally

### Option 1: Using Python HTTP Server (Already running on port 8080)
Open your browser and navigate to:
```
http://localhost:8080
```

### Option 2: Run Anytime from Terminal
In PowerShell or Command Prompt:
```powershell
cd finflow-expense-tracker
python -m http.server 8080
```
Then visit `http://localhost:8080`.

### Option 3: Direct File Opening
Double-click `index.html` to open directly in any modern browser (Chrome, Edge, Firefox, Brave, Safari).
