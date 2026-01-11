import { storage, StorageKeys, loadFromLocal, saveToLocal } from '../utils/storage.js';
import { marked } from 'marked';
import { generateId } from '../utils/helpers.js';

class AppState {
  constructor() {
    this.user = loadFromLocal(StorageKeys.USER, null);
    console.log('AppState constructor: Initial user:', this.user);

    this.todos = [];
    this.events = [];
    this.transactions = [];
    this.budget = { weekly: 50000, monthly: 200000, limit: 50000 };
    this.settings = { hustleMode: false, sapaMode: false, notifications: true };
    this.aiPersonality = 'supportive';
    this.userName = 'User';
    this.aiProvider = 'bedrock';
    this.aiResponseStyle = 'normal';
    this.customAiModes = [];
    this.aiMessages = { dailyBrief: null, budgetInsight: null, timeManagementAdvice: null };
    this.currentView = 'dashboard';
    this.todoFilter = 'all';
    this.notifications = [];
    this.chatSessions = [];
    this.currentChatSessionId = null;
    
    this.listeners = new Map();
  }

  async init() {
    if (!this.user || !this.user.uid) {
      console.log('No user, skipping data initialization.');
      return;
    }
    console.log('Initializing user data...');
    const userData = await storage.loadUserData(this.user.uid);

    this.todos = userData.todos || [];
    this.events = userData.events || [];
    this.transactions = userData.transactions || [];
    this.budget = userData.budget || { weekly: 50000, monthly: 200000, limit: 50000 };
    this.settings = userData.settings || { hustleMode: false, sapaMode: false, notifications: true };
    this.aiMessages = userData.aiMessages || { dailyBrief: null, budgetInsight: null, timeManagementAdvice: null };
    this.chatSessions = userData.chatSessions || [];
    this.currentChatSessionId = userData.currentChatSessionId || (this.chatSessions.length > 0 ? this.chatSessions[0].id : null);
    this.aiProvider = userData.aiProvider || 'bedrock';
    this.aiResponseStyle = userData.aiResponseStyle || 'normal';
    this.customAiModes = userData.customAiModes || [];
    
    console.log('User data initialized.');
    this.emit('stateLoaded');
  }

  getRemainingBudget() {
    const totalSpent = this.transactions.reduce((sum, t) => sum + t.amount, 0);
    return this.budget.limit - totalSpent;
  }

  getEventsForDateRange(startDate, endDate) {
    const allExpandedEvents = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    this.events.forEach(event => {
      if (event.recurrence === 'none') {
        const eventDate = new Date(event.date);
        if (eventDate >= start && eventDate <= end) {
          allExpandedEvents.push(event);
        }
      } else {
        let currentRecurrenceDate = new Date(event.date);
        while (currentRecurrenceDate <= end) {
          if (currentRecurrenceDate >= start) {
            allExpandedEvents.push({ ...event, date: currentRecurrenceDate.toISOString().split('T')[0] });
          }

          if (event.recurrence === 'daily') {
            currentRecurrenceDate.setDate(currentRecurrenceDate.getDate() + 1);
          } else if (event.recurrence === 'weekly') {
            currentRecurrenceDate.setDate(currentRecurrenceDate.getDate() + 7);
          } else if (event.recurrence === 'monthly') {
            currentRecurrenceDate.setMonth(currentRecurrenceDate.getMonth() + 1);
          } else {
            break; 
          }
        }
      }
    });
    return allExpandedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  async setUser(user) {
    console.log('setUser called with:', user);
    if (user && user.uid) {
      const userInfo = await storage.get('userinfo', user.uid);
      this.user = { ...user, ...(userInfo || {}) };
      this.userName = this.user.displayName || 'User';
      saveToLocal(StorageKeys.USER, this.user);
    } else {
      this.user = null;
      this.userName = 'User';
      this.todos = [];
      this.events = [];
      this.transactions = [];
      this.budget = { weekly: 50000, monthly: 200000, limit: 50000 };
      this.settings = { hustleMode: false, sapaMode: false, notifications: true };
      this.notifications = [];
      this.chatSessions = [];
    }
    console.log('setUser finished. appState.user:', this.user);
    this.emit('userChanged', this.user);
  }

  setView(view) {
    this.currentView = view;
    this.emit('viewChanged', view);
  }

  addTodo(todo) {
    this.todos.push(todo);
    storage.saveUserData(this.user.uid, 'todos', this.todos);
    this.setAIMessage('dailyBrief', null);
    this.setAIMessage('timeManagementAdvice', null);
    this.emit('todosChanged', this.todos);
  }

  updateTodo(id, updates) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index !== -1) {
      this.todos[index] = { ...this.todos[index], ...updates };
      storage.saveUserData(this.user.uid, 'todos', this.todos);
      this.setAIMessage('dailyBrief', null);
      this.setAIMessage('timeManagementAdvice', null);
      this.emit('todosChanged', this.todos);
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    storage.saveUserData(this.user.uid, 'todos', this.todos);
    this.setAIMessage('dailyBrief', null);
    this.setAIMessage('timeManagementAdvice', null);
    this.emit('todosChanged', this.todos);
  }

  addEvent(event) {
    this.events.push({ ...event, recurrence: event.recurrence || 'none' });
    storage.saveUserData(this.user.uid, 'events', this.events);
    this.setAIMessage('dailyBrief', null);
    this.setAIMessage('timeManagementAdvice', null);
    this.emit('eventsChanged', this.events);
  }

  updateEvent(id, updates) {
    const index = this.events.findIndex(e => e.id === id);
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...updates };
      storage.saveUserData(this.user.uid, 'events', this.events);
      this.setAIMessage('dailyBrief', null);
      this.setAIMessage('timeManagementAdvice', null);
      this.emit('eventsChanged', this.events);
    }
  }

  deleteEvent(id) {
    this.events = this.events.filter(e => e.id !== id);
    storage.saveUserData(this.user.uid, 'events', this.events);
    this.setAIMessage('dailyBrief', null);
    this.setAIMessage('timeManagementAdvice', null);
    this.emit('eventsChanged', this.events);
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
    storage.saveUserData(this.user.uid, 'transactions', this.transactions);
    this.setAIMessage('dailyBrief', null);
    this.setAIMessage('budgetInsight', null);
    this.emit('transactionsChanged', this.transactions);
    this.emit('budgetChanged', this.budget);
  }

  setBudget(budgetData) {
    this.budget = { ...this.budget, ...budgetData };
    storage.saveUserData(this.user.uid, 'budget', this.budget);
    this.setAIMessage('budgetInsight', null);
    this.emit('budgetChanged', this.budget);
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    storage.saveUserData(this.user.uid, 'settings', this.settings);
    this.emit('settingsChanged', this.settings);
  }

  setAIMessage(type, message) {
    if (this.aiMessages.hasOwnProperty(type)) {
      this.aiMessages[type] = message ? marked.parse(message) : null;
      storage.saveUserData(this.user.uid, 'aiMessages', this.aiMessages);
      this.emit('aiMessagesChanged', this.aiMessages);
    }
  }

  addCustomAiMode(mode) {
    this.customAiModes.push(mode);
    storage.saveUserData(this.user.uid, 'customAiModes', this.customAiModes);
    this.emit('customAiModesChanged', this.customAiModes);
  }

  removeCustomAiMode(modeName) {
    this.customAiModes = this.customAiModes.filter(mode => mode.name !== modeName);
    storage.saveUserData(this.user.uid, 'customAiModes', this.customAiModes);
    this.emit('customAiModesChanged', this.customAiModes);
  }

  addNotification(notification) {
    const newNotification = { ...notification, id: generateId(), timestamp: new Date().toISOString(), read: false };
    this.notifications.unshift(newNotification);
    saveToLocal(StorageKeys.NOTIFICATIONS, this.notifications);
    this.emit('notificationsChanged', this.notifications);
  }

  markNotificationAsRead(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index].read = true;
      saveToLocal(StorageKeys.NOTIFICATIONS, this.notifications);
      this.emit('notificationsChanged', this.notifications);
    }
  }

  addChatMessage(sessionId, sender, message) {
    const session = this.chatSessions.find(s => s.id === sessionId);
    if (session) {
      const newMessage = { id: generateId(), sender, message, timestamp: new Date().toISOString() };
      session.messages.push(newMessage);
      storage.saveUserData(this.user.uid, 'chatSessions', this.chatSessions);
      this.emit('chatSessionsChanged', this.chatSessions);
      this.emit('currentChatSessionChanged', session);
    }
  }

  deleteChatMessage(sessionId, messageId) {
    const session = this.chatSessions.find(s => s.id === sessionId);
    if (session) {
      session.messages = session.messages.filter(msg => msg.id !== messageId);
      storage.saveUserData(this.user.uid, 'chatSessions', this.chatSessions);
      this.emit('chatSessionsChanged', this.chatSessions);
      this.emit('currentChatSessionChanged', session);
    }
  }

  addChatSession(title) {
    const newSession = {
      id: generateId(),
      title: title || `Chat ${this.chatSessions.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    this.chatSessions.push(newSession);
    storage.saveUserData(this.user.uid, 'chatSessions', this.chatSessions);
    this.setCurrentChatSession(newSession.id);
    this.emit('chatSessionsChanged', this.chatSessions);
    return newSession;
  }

  updateChatSessionTitle(sessionId, newTitle) {
    const session = this.chatSessions.find(s => s.id === sessionId);
    if (session) {
      session.title = newTitle;
      storage.saveUserData(this.user.uid, 'chatSessions', this.chatSessions);
      this.emit('chatSessionsChanged', this.chatSessions);
      if (this.currentChatSessionId === sessionId) {
        this.emit('currentChatSessionChanged', session);
      }
    }
  }

  deleteChatSession(id) {
    this.chatSessions = this.chatSessions.filter(s => s.id !== id);
    storage.saveUserData(this.user.uid, 'chatSessions', this.chatSessions);
    if (this.currentChatSessionId === id) {
      this.setCurrentChatSession(this.chatSessions.length > 0 ? this.chatSessions[0].id : null);
    }
    this.emit('chatSessionsChanged', this.chatSessions);
    this.emit('currentChatSessionChanged', this.getCurrentChatSession());
  }

  setCurrentChatSession(id) {
    if (this.chatSessions.some(s => s.id === id)) {
      this.currentChatSessionId = id;
      storage.saveUserData(this.user.uid, 'currentChatSessionId', this.currentChatSessionId);
      this.emit('currentChatSessionChanged', this.getCurrentChatSession());
    }
  }

  getChatSession(id) {
    return this.chatSessions.find(s => s.id === id);
  }

  getCurrentChatSession() {
    return this.chatSessions.find(s => s.id === this.currentChatSessionId);
  }

  getCompressedTodos() {
    const totalTodos = this.todos.length;
    const completedTodos = this.todos.filter(t => t.completed).length;
    const highPriorityTodos = this.todos.filter(t => t.priority === 'high' && !t.completed).length;
    const upcomingTodos = this.todos.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) > new Date()).length;
    return `Total todos: ${totalTodos}, Completed: ${completedTodos}, High priority: ${highPriorityTodos}, Upcoming: ${upcomingTodos}`;
  }

  getCompressedEvents() {
    const totalEvents = this.events.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = this.events.filter(e => new Date(e.date) >= today).length;
    return `Total events: ${totalEvents}, Upcoming events: ${upcomingEvents}`;
  }

  getCompressedBudget() {
    const totalSpent = this.transactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = this.budget.limit - totalSpent;
    return `Budget limit: ₦${this.budget.limit.toLocaleString()}, Total spent: ₦${totalSpent.toLocaleString()}, Remaining: ₦${remaining.toLocaleString()}`;
  }
}

export const appState = new AppState();