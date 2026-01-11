import { appState } from '../state/appState.js';
import { onAuthStateChanged, auth } from '../services/firebase.js';
import { renderAuthScreen } from './auth.js';
import { renderDashboard } from './dashboard.js';
import { renderTodos } from './todos.js';
import { renderCalendar } from './calendar.js';
import { renderBudget } from './budget.js';
import { renderAIChat } from './aiChat.js';
import { Settings } from './settings.js';
import { renderLayout } from './layout.js';
import { getCountdown } from '../utils/helpers.js';

{
//A hack to make sure that the user's name displays
const replaceNames=()=>[...document.querySelectorAll("body *")].forEach(elem=>elem.innerHTML= elem.innerHTML.replace("User",appState.userName))

//setTimeout(replaceNames,3000)

//setInterval(replaceNames, 10*1000)

}

export function renderApp(container) {
  onAuthStateChanged(auth, (user) => {
    if (user && !appState.user) {
      appState.setUser(user);
    }
  });

  const render = () => renderCurrentView(container);

  appState.subscribe('userChanged', async (user) => {
    if (!user) {
      appState.setView('auth');
    } else {
      await appState.init();
      if (appState.currentView === 'auth') {
        appState.setView('dashboard');
      } else {
        render();
      }
    }
  });

  appState.subscribe('viewChanged', render);
  appState.subscribe('todosChanged', render);
  appState.subscribe('eventsChanged', render);
  appState.subscribe('transactionsChanged', render);
  appState.subscribe('budgetChanged', render);

  renderCurrentView(container);

  setInterval(() => {
    document.querySelectorAll('.countdown-timer').forEach(el => {
        const dueDate = el.dataset.dueDate;
        if (dueDate) {
            el.innerHTML = `⏰ ${getCountdown(dueDate)}`;
        }
    });
  }, 1000);
}

function renderCurrentView(container) {
  if (!appState.user && appState.currentView !== 'auth') {
    appState.setView('auth');
    return;
  }

  const viewRenderers = {
    auth: renderAuthScreen,
    dashboard: renderDashboard,
    todos: renderTodos,
    calendar: renderCalendar,
    budget: renderBudget,
    aiChat: renderAIChat,
    settings: (container) => container.appendChild(new Settings().getHtml()),
  };

  const renderer = viewRenderers[appState.currentView] || renderDashboard;

  if (appState.currentView === 'auth') {
    renderer(container);
  } else {
    renderLayout(container, renderer);
  }
}
