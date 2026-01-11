import { appState } from '../state/appState.js';
import { initTheme, toggleTheme } from '../utils/theme.js';
import { stopNotificationService } from '../services/notificationService.js'; // Import stopNotificationService
import { clearAllLocal } from '../utils/storage.js';

function renderNavItems() {
  const views = ['dashboard', 'todos', 'calendar', 'budget', 'aiChat', 'settings'];
  return views.map(view => `
    <button 
      data-view="${view}"
      class="nav-item block w-full text-left py-2 px-4 font-medium capitalize transition-colors duration-200
      ${appState.currentView === view
        ? 'bg-gradient-to-r from-gradient-start to-gradient-end text-white'
        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'}"
    >
      ${view}
    </button>
  `).join('');
}

export function renderLayout(container, viewRenderer) {
  const appShell = `
    <div class="min-h-screen bg-bg-primary text-text-primary">
      <!-- Header -->
      <header class="bg-bg-secondary/80 backdrop-blur-sm border-b border-border-color sticky top-0 z-20">
        <div class="container mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <img src="assets/logo.png" alt="Theora Logo" class="h-8 w-8">
            <h1 class="text-2xl font-bold text-gradient">Theora</h1>
          </div>

          <div class="hidden md:flex items-center space-x-4">
            <button id="notification-bell" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-primary relative">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-3 3H9a3 3 0 01-3-3v-1m6-10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <span id="notification-count" class="absolute top-1 right-1 bg-error text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center hidden">0</span>
            </button>
            <button id="theme-toggle" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-primary">
              <svg id="theme-icon-sun" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              <svg id="theme-icon-moon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            </button>
            <button id="logoutBtn" class="text-text-secondary hover:text-text-primary">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
          
          <div class="md:hidden flex items-center">
            <button id="menu-toggle" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-primary">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Desktop Navigation -->
      <nav class="hidden md:block bg-bg-secondary border-b border-border-color sticky top-[61px] z-10">
        <div class="container mx-auto px-4">
          <div class="flex space-x-8 overflow-y-scroll max-w-[100vw]">
            ${renderNavItems().replace(/block w-full text-left py-2 px-4/g, 'py-4 px-2')}
          </div>
        </div>
      </nav>

      <!-- Mobile Navigation -->
      <div id="mobile-nav" class="hidden md:hidden bg-bg-secondary border-b border-border-color fixed top-[61px] left-0 right-0 z-40">
        <div class="container mx-auto px-4 py-2">
          ${renderNavItems()}
           <div class="mt-4 pt-4 border-t border-border-color flex items-center justify-around">
             <button id="mobile-notification-bell" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-primary relative">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-3 3H9a3 3 0 01-3-3v-1m6-10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <span id="mobile-notification-count" class="absolute top-1 right-1 bg-error text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center hidden">0</span>
            </button>
            <button id="mobile-theme-toggle" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-primary">
              <svg id="mobile-theme-icon-sun" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              <svg id="mobile-theme-icon-moon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            </button>
            <button id="mobile-logoutBtn" class="text-text-secondary hover:text-text-primary">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main id="main-content" class="container mx-auto px-4 py-8">
        <!-- View content will be rendered here -->
      </main>

      <!-- Notifications -->
      <div id="notification-toast" class="notification-toast">
        <p id="notification-message"></p>
      </div>
      <div id="ai-tip-card" class="ai-tip-card">
        <p id="ai-tip-message"></p>
      </div>

      <!-- Notification Sidebar -->
      <div id="notification-sidebar" class="fixed top-0 right-0 w-80 bg-bg-secondary h-full shadow-lg transform translate-x-full transition-transform duration-300 ease-in-out z-50">
        <div class="flex items-center justify-between p-4 border-b border-border-color">
          <h3 class="text-xl font-semibold">Notifications</h3>
          <button id="close-notification-sidebar" class="text-text-secondary hover:text-text-primary">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div id="notification-list" class="p-4 space-y-3 overflow-y-auto h-[calc(100%-60px)]">
          <!-- Notifications will be rendered here -->
          <p class="text-text-secondary text-center">No new notifications.</p>
        </div>
      </div>

      <!-- Notification Popups Container -->
      <div id="notification-popups" class="fixed top-40 right-4 space-y-3 z-50"></div>
    </div>
  `;

  container.innerHTML = appShell;
  
  const mainContent = container.querySelector('#main-content');
  viewRenderer(mainContent);

  // Setup listeners
  const logout = () => {
    clearAllLocal();
    appState.setUser(null);
    appState.setView('auth');
    stopNotificationService(); // Stop notification service on logout
  };

  // Desktop listeners
  container.querySelector('#theme-toggle').addEventListener('click', toggleTheme);
  container.querySelector('#logoutBtn').addEventListener('click', logout);
  container.querySelector('#notification-bell').addEventListener('click', () => {
    container.querySelector('#notification-sidebar').classList.remove('translate-x-full');
  });

  // Mobile listeners
  container.querySelector('#menu-toggle').addEventListener('click', () => {
    container.querySelector('#mobile-nav').classList.toggle('hidden');
  });
  container.querySelector('#mobile-theme-toggle').addEventListener('click', toggleTheme);
  container.querySelector('#mobile-logoutBtn').addEventListener('click', logout);
  container.querySelector('#mobile-notification-bell').addEventListener('click', () => {
    container.querySelector('#notification-sidebar').classList.remove('translate-x-full');
  });


  container.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      if (view) {
        appState.setView(view);
        // Close mobile nav on selection
        const mobileNav = container.querySelector('#mobile-nav');
        if (!mobileNav.classList.contains('hidden')) {
          mobileNav.classList.add('hidden');
        }
      }
    });
  });

  const closeNotificationSidebarBtn = container.querySelector('#close-notification-sidebar');
  closeNotificationSidebarBtn?.addEventListener('click', () => {
    container.querySelector('#notification-sidebar').classList.add('translate-x-full');
  });
  
  initTheme();
  updateNotificationUI(); // Initial render of notifications

  appState.subscribe('notificationsChanged', updateNotificationUI);
}
function updateNotificationUI() {
  const notificationCountSpan = document.querySelector('#notification-count');
  const notificationListDiv = document.querySelector('#notification-list');

  const unreadNotifications = appState.notifications.filter(n => !n.read);
  if (unreadNotifications.length > 0) {
    notificationCountSpan.textContent = unreadNotifications.length;
    notificationCountSpan.classList.remove('hidden');
  } else {
    notificationCountSpan.classList.add('hidden');
  }

  if (appState.notifications.length > 0) {
    notificationListDiv.innerHTML = appState.notifications.map(n => `
      <div class="notification-item general ${n.type} ${n.read ? 'opacity-60' : ''}" data-id="${n.id}">
        <span class="text-xl">${getNotificationIcon(n.type)}</span>
        <div class="flex-1">
          <p class="font-medium">${n.message}</p>
          <p class="text-xs text-text-secondary">${new Date(n.timestamp).toLocaleString()}</p>
        </div>
        <button class="mark-read-btn text-text-secondary hover:text-text-primary" data-id="${n.id}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    `).join('');
  } else {
    notificationListDiv.innerHTML = '<p class="text-text-secondary text-center">No new notifications.</p>';
  }

  // Render popups for unread notifications
  const notificationPopupsContainer = document.querySelector('#notification-popups');
  notificationPopupsContainer.innerHTML = ''; // Clear previous popups

  const latestUnreadNotification = appState.notifications.filter(n => !n.read)[0]; // Get only the latest unread

  if (latestUnreadNotification) {
    const n = latestUnreadNotification;
    const popup = document.createElement('div');
    popup.className = `notification-popup ${n.type}`;
    popup.dataset.id = n.id;
    popup.innerHTML = `
      <span class="text-xl">${getNotificationIcon(n.type)}</span>
      <div class="flex-1">
        <p class="font-medium">${n.message}</p>
          <p class="text-xs text-text-secondary">${new Date(n.timestamp).toLocaleTimeString()}</p>
      </div>
      <button class="mark-read-btn text-text-secondary hover:text-text-primary" data-id="${n.id}">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    `;
    notificationPopupsContainer.appendChild(popup);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      popup.classList.add('opacity-0', 'translate-x-full');
      popup.addEventListener('transitionend', () => popup.remove());
      appState.markNotificationAsRead(n.id); // Mark as read when it disappears
    }, 5000);
  }

  // Add event listeners for mark-read buttons
  document.querySelectorAll('.mark-read-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const notificationId = e.currentTarget.dataset.id;
      appState.markNotificationAsRead(notificationId);
    });
  });
}

function getNotificationIcon(type) {
  switch (type) {
    case 'todo': return '📝';
    case 'event': return '📅';
    case 'budget': return '💰';
    case 'aiChat': return '🤖';
    default: return '💡';
  }
}
