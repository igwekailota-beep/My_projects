import { appState } from '../state/appState.js';
import { formatCurrency, getRelativeTime, isToday, deduplicateBy, getCountdown } from '../utils/helpers.js';
import { generateDailyBrief } from '../services/ai.js';

export function renderDashboard(container) {
  const todayTodos = appState.todos.filter(t => !t.completed && isToday(t.dueDate));
  
  // New logic for urgent tasks
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const urgentTasks = appState.todos.filter(t => {
    if (t.completed) return false;
    const isHighPriority = t.priority === 'high';
    let isDueSoon = false;
    if (t.dueDate) {
      const dueDate = new Date(t.dueDate);
      isDueSoon = dueDate > now && dueDate <= twentyFourHoursFromNow;
    }
    return isHighPriority || isDueSoon;
  });

  // Sort urgent tasks
  const priorityMap = { high: 1, medium: 2, low: 3 };
  urgentTasks.sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      if (dateA !== dateB) {
          return dateA - dateB;
      }
      return (priorityMap[a.priority] || 4) - (priorityMap[b.priority] || 4);
  });

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayEvents = appState.getEventsForDateRange(todayStr, todayStr);
  const weekSpending = appState.transactions
    .filter(t => {
      const date = new Date(t.date);
      const weekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  container.innerHTML = `
    <div class="fade-in">
      <!-- AI Daily Brief -->
      <div class="card mb-6 bg-gradient-to-r from-bg-primary to-bg-secondary border-border-color">
        <div class="flex items-start space-x-4">
          <div class="text-4xl">🤖</div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold mb-2">Today's Game Plan</h2>
            <p id="dailyBrief" class="text-text-secondary">Loading your personalized brief...</p>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="card stat-card bg-error/10 border-border-color">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-text-secondary">Urgent Tasks</h3>
            <span class="text-2xl">🔥</span>
          </div>
          <p class="text-3xl font-bold text-error">${urgentTasks.length}</p>
          <p class="text-xs text-text-secondary mt-1">Due soon or high priority</p>
        </div>

        <div class="card stat-card bg-primary-blue/10 border-border-color">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-text-secondary">Today's Tasks</h3>
            <span class="text-2xl">📝</span>
          </div>
          <p class="text-3xl font-bold text-primary-blue">${todayTodos.length}</p>
          <p class="text-xs text-text-secondary mt-1">Due today</p>
        </div>

        <div class="card stat-card bg-gradient-start/10 border-border-color">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-text-secondary">Events Today</h3>
            <span class="text-2xl">📅</span>
          </div>
          <p class="text-3xl font-bold text-gradient-start">${todayEvents.length}</p>
          <p class="text-xs text-text-secondary mt-1">Scheduled</p>
        </div>

        <div class="card stat-card bg-success/10 border-border-color">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-text-secondary">Week Spending</h3>
            <span class="text-2xl">💰</span>
          </div>
          <p class="text-3xl font-bold text-success">${formatCurrency(weekSpending)}</p>
          <p class="text-xs text-text-secondary mt-1">Last 7 days</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Priority Tasks -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">Priority Tasks</h2>
            <button id="viewAllTodos" class="text-primary-blue hover:underline text-sm">View All</button>
          </div>
          <div id="priorityTodosList" class="space-y-3">
            ${urgentTasks.length === 0 
              ? '<p class="text-text-secondary text-center py-8">No urgent tasks! You\'re doing great 🎉</p>'
              : urgentTasks.slice(0, 3).map(todo => `
                <div class="flex items-start space-x-3 p-3 bg-bg-primary rounded-lg">
                  <input type="checkbox" class="mt-1 rounded" data-todo-id="${todo.id}">
                  <div class="flex-1">
                    <p class="font-medium">${todo.title}</p>
                    ${todo.dueDate
                      ? `<p class="text-sm font-semibold text-error countdown-timer" data-due-date="${todo.dueDate}">
                           ⏰ ${getCountdown(todo.dueDate)}
                         </p>`
                      : `<p class="text-sm text-text-secondary">${getRelativeTime(todo.dueDate)}</p>`
                    }
                  </div>
                  <span class="badge badge-${todo.priority}">${todo.priority.toUpperCase()}</span>
                </div>
              `).join('')
            }
          </div>
        </div>

        <!-- Today's Events -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">Today's Schedule</h2>
            <button id="viewCalendar" class="text-primary-blue hover:underline text-sm">View Calendar</button>
          </div>
          <div id="todayEventsList" class="space-y-3">
            ${todayEvents.length === 0
              ? '<p class="text-text-secondary text-center py-8">No events scheduled today ✨</p>'
              : todayEvents.map(event => `
                <div class="flex items-start space-x-3 p-3 bg-bg-primary rounded-lg">
                  <span class="text-2xl">${event.icon || '📌'}</span>
                  <div class="flex-1">
                    <p class="font-medium">${event.title}</p>
                    <p class="text-sm text-text-secondary">${event.time || 'All day'} ${event.recurrence === 'daily' ? '( Every day )' : event.recurrence === 'weekly' ? '( Every week )' : event.recurrence === 'monthly' ? '( Every month )' : ''}</p>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    </div>
  `;

  setupDashboardListeners(container);
  loadDailyBrief(container);
}

function setupDashboardListeners(container) {
  const viewAllTodos = container.querySelector('#viewAllTodos');
  viewAllTodos?.addEventListener('click', () => {
    appState.setView('todos');
  });

  const viewCalendar = container.querySelector('#viewCalendar');
  viewCalendar?.addEventListener('click', () => {
    appState.setView('calendar');
  });

  const todoCheckboxes = container.querySelectorAll('input[type="checkbox"][data-todo-id]');
  todoCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const todoId = e.target.dataset.todoId;
      appState.updateTodo(todoId, { completed: e.target.checked });
    });
  });
}

async function loadDailyBrief(container) {
  const briefElement = container.querySelector('#dailyBrief');
  if (!briefElement) return;

  if (appState.aiMessages.dailyBrief) {
    briefElement.innerHTML = appState.aiMessages.dailyBrief;
    return;
  }

  try {
    const todayTodos = appState.todos.filter(t => !t.completed && isToday(t.dueDate));
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayEvents = appState.getEventsForDateRange(todayStr, todayStr);
    const brief = await generateDailyBrief(todayTodos, appState.getRemainingBudget(), todayEvents);
    appState.setAIMessage('dailyBrief', brief);
    briefElement.innerHTML = brief;
  } catch (error) {
    briefElement.innerHTML = 'Good morning! Ready to crush your goals today? 💪';
  }
}
