/* ==========================================================================
   FINFLOW - CHART.JS WRAPPER & VISUALIZATION ENGINE
   ========================================================================== */

const AppCharts = {
  instances: {},

  getChartColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      textColor: isDark ? '#94A3B8' : '#64748B',
      gridColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(226, 232, 240, 0.8)',
      income: '#10B981',
      incomeLight: 'rgba(16, 185, 129, 0.2)',
      expense: '#EF4444',
      expenseLight: 'rgba(239, 68, 68, 0.2)',
      primary: '#6366F1',
      primaryLight: 'rgba(99, 102, 241, 0.15)',
      palette: [
        '#6366F1', '#EC4899', '#F97316', '#10B981', '#06B6D4',
        '#8B5CF6', '#F59E0B', '#3B82F6', '#14B8A6', '#64748B'
      ]
    };
  },

  destroy(chartKey) {
    if (this.instances[chartKey]) {
      this.instances[chartKey].destroy();
      delete this.instances[chartKey];
    }
  },

  // 1. Income vs Expense Comparison Bar Chart
  renderIncomeExpenseChart(canvasId, labels, incomeData, expenseData) {
    if (!window.Chart) return;
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    const colors = this.getChartColors();

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: colors.income,
            borderRadius: 6,
            maxBarThickness: 32
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: colors.expense,
            borderRadius: 6,
            maxBarThickness: 32
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600' },
              boxWidth: 12,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: '#0F172A',
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: "'Outfit', sans-serif", size: 13 },
            callbacks: {
              label: function(ctx) {
                const cur = Store.getSettings().currency;
                return ` ${ctx.dataset.label}: ${Utils.formatCurrency(ctx.parsed.y, cur)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.textColor, font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              callback: val => {
                const cur = Store.getSettings().currency;
                const sym = Utils.CURRENCIES[cur]?.symbol || '₹';
                return val >= 1000 ? `${sym}${val / 1000}k` : `${sym}${val}`;
              }
            }
          }
        }
      }
    });
  },

  // 2. Expense Category Breakdown Donut Chart
  renderCategoryDonut(canvasId, categoryNames, categoryAmounts) {
    if (!window.Chart) return;
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    const colors = this.getChartColors();

    if (!categoryAmounts.length || categoryAmounts.every(v => v === 0)) {
      categoryNames = ['No expenses yet'];
      categoryAmounts = [1];
    }

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categoryNames,
        datasets: [{
          data: categoryAmounts,
          backgroundColor: colors.palette.slice(0, categoryNames.length),
          borderWidth: 2,
          borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#151D30' : '#FFFFFF',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '500' },
              boxWidth: 10,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: '#0F172A',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(ctx) {
                const cur = Store.getSettings().currency;
                return ` ${ctx.label}: ${Utils.formatCurrency(ctx.parsed, cur)}`;
              }
            }
          }
        }
      }
    });
  },

  // 3. Monthly Spending Trend Line Chart
  renderSpendingTrendLine(canvasId, labels, amounts) {
    if (!window.Chart) return;
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    const colors = this.getChartColors();

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Spending',
          data: amounts,
          borderColor: colors.primary,
          backgroundColor: colors.primaryLight,
          fill: true,
          tension: 0.38,
          borderWidth: 3,
          pointBackgroundColor: colors.primary,
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(ctx) {
                const cur = Store.getSettings().currency;
                return ` Spent: ${Utils.formatCurrency(ctx.parsed.y, cur)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.textColor, font: { size: 11 } }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { size: 11 },
              callback: val => {
                const cur = Store.getSettings().currency;
                const sym = Utils.CURRENCIES[cur]?.symbol || '₹';
                return val >= 1000 ? `${sym}${val / 1000}k` : `${sym}${val}`;
              }
            }
          }
        }
      }
    });
  },

  // 4. Payment Method Distribution Chart
  renderPaymentMethodDonut(canvasId, labels, amounts) {
    if (!window.Chart) return;
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    const colors = this.getChartColors();

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: amounts,
          backgroundColor: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#06B6D4'],
          borderWidth: 2,
          borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#151D30' : '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: colors.textColor,
              font: { size: 11, weight: '500' },
              boxWidth: 10,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: '#0F172A',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(ctx) {
                const cur = Store.getSettings().currency;
                return ` ${ctx.label}: ${Utils.formatCurrency(ctx.parsed, cur)}`;
              }
            }
          }
        }
      }
    });
  },

  // Update theme of all active charts
  updateTheme() {
    Object.keys(this.instances).forEach(k => {
      const chart = this.instances[k];
      if (chart) {
        const colors = this.getChartColors();
        if (chart.options.scales?.x) chart.options.scales.x.ticks.color = colors.textColor;
        if (chart.options.scales?.y) {
          chart.options.scales.y.ticks.color = colors.textColor;
          chart.options.scales.y.grid.color = colors.gridColor;
        }
        if (chart.options.plugins?.legend?.labels) {
          chart.options.plugins.legend.labels.color = colors.textColor;
        }
        chart.update();
      }
    });
  }
};

window.AppCharts = AppCharts;
