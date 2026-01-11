import { appState } from '../state/appState.js';
import { generateId, formatCurrency, formatDate, getCategoryIcon } from '../utils/helpers.js';
import { analyzeBudget } from '../services/ai.js';

export function renderBudget(container) {
  const totalSpent = appState.transactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = appState.getRemainingBudget();
  const percentageUsed = ((totalSpent / appState.budget.limit) * 100).toFixed(1);

  const categoryTotals = {};
  appState.transactions.forEach(t => {
    if (!categoryTotals[t.category]) {
      categoryTotals[t.category] = 0;
    }
    categoryTotals[t.category] += t.amount;
  });

  container.innerHTML = `
    <div class="fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold">Budget Tracker</h2>
        <button id="setBudgetBtn" class="btn btn-secondary">⚙️ Set Budget</button>
      </div>

      <!-- Virtual Card -->
      <div class="mb-8 max-w-md mx-auto">
        <div class="flip-card" id="virtualCard">
          <div class="flip-card-inner">
            <!-- Card Front -->
              <div class="flip-card-front absolute inset-0">
              <div class="card bg-gradient-to-br from-gradient-start to-gradient-end text-white p-6 cursor-pointer" style="aspect-ratio: 1.586;">
                <div class="flex items-center justify-between mb-8">
                  <span class="text-2xl">💳</span>
                  <span class="text-sm opacity-80">Virtual Card</span>
                </div>
                <div class="mb-4">
                  <p class="text-xs opacity-80 mb-1">Balance</p>
                  <p class="text-3xl font-bold">${formatCurrency(remaining)}</p>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs opacity-80">Budget</p>
                    <p class="font-medium">${formatCurrency(appState.budget.limit)}</p>
                  </div>
                  
                  <div>
                    <p class="text-xs opacity-80">Spent</p>
                    <p class="font-medium">${formatCurrency(totalSpent)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Card Back - Transaction Entry -->
              <div class="flip-card-back absolute inset-0">
              <div class="card bg-gradient-to-br from-bg-secondary to-bg-primary text-white p-6" style="aspect-ratio: 1.586;">
                <h3 class="text-lg font-semibold mb-4">Add Transaction</h3>
                <form id="quickTransactionForm" class="space-y-3">
                  <input type="number" id="quickAmount" class="input text-text-primary" placeholder="Amount (₦)" required min="1">
                  <select id="quickCategory" class="input text-text-primary" required>
                    <option value="">Select category</option>
                    <option value="food">🍔 Food</option>
                    <option value="transport">🚗 Transport</option>
                    <option value="data">📱 Data/Airtime</option>
                    <option value="education">📚 Education</option>
                    <option value="entertainment">🎮 Entertainment</option>
                    <option value="bills">⚡ Bills</option>
                    <option value="other">📦 Other</option>
                  </select>
                  <button type="submit" class="btn btn-primary w-full">Deduct from Card</button>
                </form>
                <button id="flipBack" class="text-xs text-text-secondary hover:text-text-primary mt-3">← Back to card</button>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center mt-4">
          <button id="flipCard" class="text-primary-blue hover:underline text-sm">
            Click card to add transaction
          </button>
        </div>
      </div>

      <!-- Budget Overview -->
      <div class="card mb-6" style="margin-top: 275px;"> <!--The margin is there so the card dosen't overlap the divs-->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold">Budget Overview</h3>
        </div>
        
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Spending Progress</span>
            <span class="text-sm font-semibold ${percentageUsed > 80 ? 'text-error' : 'text-text-secondary'}">
              ${percentageUsed}%
            </span>
          </div>
          <div class="w-full bg-bg-primary rounded-full h-4 overflow-hidden">
            <div class="h-full rounded-full transition-all ${
              percentageUsed > 80 ? 'bg-error' : percentageUsed > 60 ? 'bg-warning' : 'bg-success'
            }" style="width: ${Math.min(percentageUsed, 100)}%"></div>
          </div>
        </div>

        <div id="aiInsights" class="p-4 bg-bg-primary rounded-lg mb-4">
          <p class="text-sm text-text-secondary">Loading budget insights...</p>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-4 bg-success/10 rounded-lg">
            <p class="text-xs text-text-secondary mb-1">Remaining</p>
            <p class="text-xl font-bold text-success">${formatCurrency(remaining)}</p>
          </div><br class="lg:hidden block">
          <div class="text-center p-4 bg-error/10 rounded-lg">
            <p class="text-xs text-text-secondary mb-1">Spent</p>
            <p class="text-xl font-bold text-error">${formatCurrency(totalSpent)}</p>
          </div>
          
          <div class="text-center p-4 bg-primary-blue/10 rounded-lg">
            <p class="text-xs text-text-secondary mb-1">Budget</p>
            <p class="text-xl font-bold text-primary-blue">${formatCurrency(appState.budget.limit)}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Spending by Category -->
        <div class="card">
          <h3 class="text-xl font-semibold mb-4">Spending by Category</h3>
          <div class="space-y-3">
            ${Object.keys(categoryTotals).length === 0 
              ? '<p class="text-text-secondary text-center py-8">No transactions yet</p>'
              : Object.entries(categoryTotals)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const percentage = ((amount / totalSpent) * 100).toFixed(1);
                    return `
                      <div>
                        <div class="flex items-center justify-between mb-1">
                          <span class="text-sm font-medium">${getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                          <span class="text-sm font-semibold">${formatCurrency(amount)}</span>
                        </div>
                        <div class="w-full bg-bg-primary rounded-full h-2">
                          <div class="h-full bg-primary-blue rounded-full" style="width: ${percentage}%"></div>
                        </div>
                      </div>
                    `;
                  }).join('')
            }
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold">Recent Transactions</h3>
            <button id="addTransactionBtn" class="text-primary-blue hover:underline text-sm">+ Add</button>
          </div>
          <div class="space-y-2 max-h-96 overflow-y-auto">
            ${appState.transactions.length === 0
              ? '<p class="text-text-secondary text-center py-8">No transactions yet</p>'
              : appState.transactions
                  .slice()
                  .reverse()
                  .slice(0, 20)
                  .map(transaction => `
                    <div class="flex items-center justify-between p-3 bg-bg-primary rounded-lg">
                      <div class="flex items-center space-x-3">
                        <span class="text-2xl">${getCategoryIcon(transaction.category)}</span>
                        <div>
                          <p class="font-medium">${transaction.description || transaction.category}</p>
                          <p class="text-xs text-text-secondary">${formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="font-semibold text-error">-${formatCurrency(transaction.amount)}</p>
                      </div>
                    </div>
                  `).join('')
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Set Budget Modal -->
    <div id="budgetModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="card max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold">Set Budget</h2>
          <button id="closeBudgetModal" class="text-text-secondary hover:text-text-primary">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form id="budgetForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Weekly Budget</label>
            <input type="number" id="weeklyBudget" class="input" placeholder="50000" value="${appState.budget.weekly}" required min="1">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Monthly Budget</label>
            <input type="number" id="monthlyBudget" class="input" placeholder="200000" value="${appState.budget.monthly}" required min="1">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Current Budget Limit</label>
            <input type="number" id="currentBudget" class="input" placeholder="50000" value="${appState.budget.limit}" required min="1">
          </div>
          <button type="submit" class="btn btn-primary w-full">Save Budget</button>
        </form>
      </div>
    </div>

    <!-- Add Transaction Modal -->
    <div id="transactionModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="card max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold">Add Transaction</h2>
          <button id="closeTransactionModal" class="text-text-secondary hover:text-text-primary">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form id="transactionForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Amount (₦)</label>
            <input type="number" id="transactionAmount" class="input" placeholder="5000" required min="1">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Category</label>
            <select id="transactionCategory" class="input" required>
              <option value="food">🍔 Food</option>
              <option value="transport">🚗 Transport</option>
              <option value="data">📱 Data/Airtime</option>
              <option value="education">📚 Education</option>
              <option value="entertainment">🎮 Entertainment</option>
              <option value="health">🏥 Health</option>
              <option value="shopping">🛍️ Shopping</option>
              <option value="bills">⚡ Bills</option>
              <option value="other">📦 Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <input type="text" id="transactionDescription" class="input" placeholder="Lunch at cafeteria">
          </div>
          <button type="submit" class="btn btn-primary w-full">Add Transaction</button>
        </form>
      </div>
    </div>
  `;

  setupBudgetListeners(container);
  loadBudgetInsights(container);
}

async function loadBudgetInsights(container) {
  const aiInsightsElement = container.querySelector('#aiInsights p');
  if (!aiInsightsElement) return;

  if (appState.aiMessages.budgetInsight) {
    aiInsightsElement.innerHTML = appState.aiMessages.budgetInsight;
    return;
  }

  try {
    const insights = await analyzeBudget(appState.transactions, appState.budget.limit);
    appState.setAIMessage('budgetInsight', insights);
    aiInsightsElement.innerHTML = insights;
  } catch (error) {
    console.error('AI Insights Error:', error);
    aiInsightsElement.innerHTML = 'Could not get AI insights.';
  }
}

function setupBudgetListeners(container) {
  const virtualCard = container.querySelector('#virtualCard');
  const flipCardBtn = container.querySelector('#flipCard');
  const flipBackBtn = container.querySelector('#flipBack');

  flipCardBtn?.addEventListener('click', () => {
    virtualCard.classList.add('flipped');
  });

  flipBackBtn?.addEventListener('click', () => {
    virtualCard.classList.remove('flipped');
  });

  virtualCard?.addEventListener('click', (e) => {
    if (!e.target.closest('form') && !e.target.closest('button[type="submit"]')) {
      virtualCard.classList.toggle('flipped');
    }
  });

  const quickTransactionForm = container.querySelector('#quickTransactionForm');
  quickTransactionForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(container.querySelector('#quickAmount').value);
    const category = container.querySelector('#quickCategory').value;

    appState.addTransaction({
      id: generateId(),
      amount,
      category,
      description: `${category.charAt(0).toUpperCase() + category.slice(1)} purchase`,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    virtualCard.classList.remove('flipped');
  });

  const setBudgetBtn = container.querySelector('#setBudgetBtn');
  const budgetModal = document.getElementById('budgetModal'); // Modal is outside container now
  const closeBudgetModal = budgetModal.querySelector('#closeBudgetModal');
  const budgetForm = budgetModal.querySelector('#budgetForm');

  setBudgetBtn?.addEventListener('click', () => {
    budgetModal.classList.remove('hidden');
  });

  const closeBudgetModalAction = () => budgetModal.classList.add('hidden');
  closeBudgetModal?.addEventListener('click', closeBudgetModalAction);

  budgetForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    appState.setBudget({
      weekly: parseFloat(budgetModal.querySelector('#weeklyBudget').value),
      monthly: parseFloat(budgetModal.querySelector('#monthlyBudget').value),
      limit: parseFloat(budgetModal.querySelector('#currentBudget').value)
    });
    closeBudgetModalAction();
  });

  const addTransactionBtn = container.querySelector('#addTransactionBtn');
  const transactionModal = document.getElementById('transactionModal'); // Modal is outside container now
  const closeTransactionModal = transactionModal.querySelector('#closeTransactionModal');
  const transactionForm = transactionModal.querySelector('#transactionForm');

  addTransactionBtn?.addEventListener('click', () => {
    transactionModal.classList.remove('hidden');
  });

  const closeTransactionModalAction = () => transactionModal.classList.add('hidden');
  closeTransactionModal?.addEventListener('click', closeTransactionModalAction);

  transactionForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(transactionModal.querySelector('#transactionAmount').value);
    const category = transactionModal.querySelector('#transactionCategory').value;
    const description = transactionModal.querySelector('#transactionDescription').value;

    appState.addTransaction({
      id: generateId(),
      amount,
      category,
      description: description || `${category.charAt(0).toUpperCase() + category.slice(1)} purchase`,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    closeTransactionModalAction();
  });

  
}

