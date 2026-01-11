import { appState } from '../state/appState.js';
import { generateId, formatDate, isToday, deduplicateBy } from '../utils/helpers.js';

let currentDisplayMonth;
let currentDisplayYear;

export function renderCalendar(container, month = new Date().getMonth(), year = new Date().getFullYear()) {
  currentDisplayMonth = month;
  currentDisplayYear = year;

  container.innerHTML = `
    <div class="fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold">Calendar</h2>
        <button id="addEventBtn" class="btn btn-primary">+ Add Event</button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Calendar View -->
        <div class="lg:col-span-2 card">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold" id="currentMonthYear">${getMonthName(currentDisplayMonth)} ${currentDisplayYear}</h3>
            <div class="flex space-x-2">
              <button id="prevMonth" class="btn btn-secondary text-sm">←</button>
              <button id="nextMonth" class="btn btn-secondary text-sm">→</button>
            </div>
          </div>
          <div class="grid grid-cols-7 gap-2 mb-4">
            ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
              `<div class="text-center text-sm font-medium text-text-secondary py-2">${day}</div>`
            ).join('')}
          </div>
          <div id="calendarGrid" class="grid grid-cols-7 gap-2">
            ${renderCalendarDays(currentDisplayMonth, currentDisplayYear)}
          </div>
        </div>

        <!-- Upcoming Events -->
        <div class="card">
          <h3 class="text-xl font-semibold mb-4">Upcoming Events</h3>
          <div id="upcomingEvents" class="space-y-3">
            ${renderUpcomingEvents()}
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Event Modal -->
    <div id="eventModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="card max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold" id="modalTitle">Add New Event</h2>
          <button id="closeModal" class="text-text-secondary hover:text-text-primary">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form id="eventForm" class="space-y-4">
          <input type="hidden" id="eventId">
          <div>
            <label class="block text-sm font-medium mb-1">Event Title</label>
            <input type="text" id="eventTitle" class="input" placeholder="Team meeting" required>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea id="eventDescription" class="input" rows="2" placeholder="Optional details..."></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Date</label>
              <input type="date" id="eventDate" class="input" required>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Time</label>
              <input type="time" id="eventTime" class="input">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Icon</label>
            <div class="grid grid-cols-6 gap-2">
              ${['📅', '📝', '💼', '🎓', '💰', '🎉', '🏃', '🍔', '✈️', '📱', '🎯', '⚡'].map(icon => `
                <button type="button" class="icon-select p-2 text-2xl hover:bg-bg-primary rounded border border-transparent" data-icon="${icon}">${icon}</button>
              `).join('')}
            </div>
            <input type="hidden" id="eventIcon" value="📅">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Recurrence</label>
            <select id="eventRecurrence" class="input">
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div class="flex space-x-3">
            <button type="submit" class="btn btn-primary flex-1">Save Event</button>
            <button type="button" id="cancelEventBtn" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Daily Events Modal -->
    <div id="dailyEventsModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="card max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold" id="dailyEventsModalTitle">Events for </h2>
          <button id="closeDailyEventsModal" class="text-text-secondary hover:text-text-primary">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div id="dailyEventsList" class="space-y-3"></div>
      </div>
    </div>
  `;

  setupCalendarListeners(container);
}

function getMonthName(month) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month];
}

function renderCalendarDays(month, year) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  let html = '';
  
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="aspect-square"></div>';
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = appState.getEventsForDateRange(dateStr, dateStr); // Use new method
    const isTodayDate = today.toDateString() === date.toDateString();
    
    html += `
      <div class="aspect-square p-2 border rounded-lg hover:bg-bg-primary cursor-pointer ${isTodayDate ? 'bg-bg-primary border-primary-blue' : 'border-border-color'}" data-date="${dateStr}">
        <div class="text-sm font-medium ${isTodayDate ? 'text-primary-blue' : ''}">${day}</div>
        ${dayEvents.length > 0 ? `<div class="text-xs text-text-secondary mt-1">${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}</div>` : ''}
      </div>
    `;
  }
  
  return html;
}

function renderUpcomingEvents() {
  const today = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const upcoming = appState.getEventsForDateRange(today.toISOString().split('T')[0], threeMonthsLater.toISOString().split('T')[0]);



  if (upcoming.length === 0) {
    return '<p class="text-text-secondary text-center py-8">No upcoming events 📅</p>';
  }
  console.log(upcoming)

  return (deduplicateBy(upcoming,"id")).map(event => `
    <div class="p-3 bg-bg-primary rounded-lg hover:bg-bg-secondary transition-colors">
      <div class="flex items-start space-x-3">
        <span class="text-2xl">${event.icon || '📅'}</span>
        <div class="flex-1">
          <p class="font-medium">${event.title}</p>
          <p class="text-sm text-text-secondary">${formatDate(event.date)} ${event.time ? `at ${event.time}` : ''} ${event.recurrence === 'daily' ? '( Every day )' : event.recurrence === 'weekly' ? '( Every week )' : event.recurrence === 'monthly' ? '( Every month )' : ''}</p>
        </div>
        <button class="delete-event text-error hover:opacity-70" data-event-id="${event.id}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function setupCalendarListeners(container) {
  const addEventBtn = container.querySelector('#addEventBtn');
  const eventModal = document.getElementById('eventModal'); // Modal is outside container now
  const closeModal = eventModal.querySelector('#closeModal');
  const cancelEventBtn = eventModal.querySelector('#cancelEventBtn');
  const eventForm = eventModal.querySelector('#eventForm');

  const dailyEventsModal = document.getElementById('dailyEventsModal');
  const dailyEventsModalTitle = dailyEventsModal.querySelector('#dailyEventsModalTitle');
  const dailyEventsList = dailyEventsModal.querySelector('#dailyEventsList');
  const closeDailyEventsModal = dailyEventsModal.querySelector('#closeDailyEventsModal');

  addEventBtn?.addEventListener('click', () => {
    eventForm.reset();
    eventModal.querySelector('#eventId').value = '';
    eventModal.querySelector('#modalTitle').textContent = 'Add New Event';
    eventModal.querySelector('#eventDate').value = new Date().toISOString().split('T')[0];
    eventModal.querySelector('#eventRecurrence').value = 'none'; // Reset recurrence
    eventModal.classList.remove('hidden');
  });

  const closeModalAction = () => eventModal.classList.add('hidden');
  closeModal?.addEventListener('click', closeModalAction);
  cancelEventBtn?.addEventListener('click', closeModalAction);

  closeDailyEventsModal?.addEventListener('click', () => {
    dailyEventsModal.classList.add('hidden');
  });

  const iconBtns = eventModal.querySelectorAll('.icon-select');
  iconBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      iconBtns.forEach(b => b.classList.remove('border-primary-blue', 'bg-bg-primary'));
      btn.classList.add('border-primary-blue', 'bg-bg-primary');
      eventModal.querySelector('#eventIcon').value = btn.dataset.icon;
    });
  });

  eventForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = eventModal.querySelector('#eventId').value;
    const eventData = {
      title: eventModal.querySelector('#eventTitle').value,
      description: eventModal.querySelector('#eventDescription').value,
      date: eventModal.querySelector('#eventDate').value,
      time: eventModal.querySelector('#eventTime').value,
      icon: eventModal.querySelector('#eventIcon').value,
      recurrence: eventModal.querySelector('#eventRecurrence').value, // Add recurrence
    };

    if (id) {
      appState.updateEvent(id, { ...appState.events.find(ev=>ev.id===id), ...eventData });
    } else {
      appState.addEvent({ ...eventData, id: generateId(), createdAt: new Date().toISOString() });
    }

    closeModalAction();
  });

  container.addEventListener('click', (e) => {
    const target = e.target;
    const deleteBtn = target.closest('.delete-event');
    const calendarDay = target.closest('[data-date]');

    if (deleteBtn) {
      if (confirm('Delete this event?')) {
        appState.deleteEvent(deleteBtn.dataset.eventId);
      }
    }

    if (calendarDay) {
      const dateStr = calendarDay.dataset.date;
      const dayEvents = appState.getEventsForDateRange(dateStr, dateStr); // Use new method

      dailyEventsModalTitle.textContent = `Events for ${formatDate(dateStr)}`;
      if (dayEvents.length > 0) {
        dailyEventsList.innerHTML = dayEvents.map(event => `
          <div class="p-3 bg-bg-primary rounded-lg">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">${event.icon || '📅'}</span>
              <div class="flex-1">
                <p class="font-medium">${event.title}</p>
                <p class="text-sm text-text-secondary">${event.time ? `at ${event.time}` : ''} ${event.recurrence === 'daily' ? '( Every day )' : event.recurrence === 'weekly' ? '( Every week )' : event.recurrence === 'monthly' ? '( Every month )' : ''}</p>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        dailyEventsList.innerHTML = '<p class="text-text-secondary text-center py-4">No events for this day.</p>';
      }
      dailyEventsModal.classList.remove('hidden');
    }
  });

  // New event listeners for month navigation
  const prevMonthBtn = container.querySelector('#prevMonth');
  const nextMonthBtn = container.querySelector('#nextMonth');

  prevMonthBtn?.addEventListener('click', () => {
    currentDisplayMonth--;
    if (currentDisplayMonth < 0) {
      currentDisplayMonth = 11;
      currentDisplayYear--;
    }
    appState.setView('calendar', { month: currentDisplayMonth, year: currentDisplayYear });
  });

  nextMonthBtn?.addEventListener('click', () => {
    currentDisplayMonth++;
    if (currentDisplayMonth > 11) {
      currentDisplayMonth = 0;
      currentDisplayYear++;
    }
    appState.setView('calendar', { month: currentDisplayMonth, year: currentDisplayYear });
  });
}
