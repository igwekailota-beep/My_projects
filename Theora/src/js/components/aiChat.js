import { appState } from '../state/appState.js';
import { generateAIResponse, generateChatName } from '../services/ai.js'; // Added generateChatName
import { generateId } from '../utils/helpers.js';
import { getTheme } from '../utils/theme.js';
import { marked } from 'marked';

export function renderAIChat(container) {
  container.innerHTML = `
    <div class="ai-chat-layout flex h-[calc(100vh-180px)] relative">
      <!-- Chat Sessions Sidebar -->
      <div id="chat-sidebar" class="chat-sidebar absolute top-0 left-0 h-full w-64 bg-bg-secondary border-r border-border-color p-4 overflow-y-auto z-10 transform -translate-x-full md:relative md:translate-x-0 md:block transition-transform duration-300 ease-in-out">
        <button id="new-chat-btn" class="w-full bg-primary-blue text-white py-2 rounded-lg mb-4 hover:bg-primary-blue-dark transition-colors duration-200">
          + New Chat
        </button>
        <div id="chat-sessions-list">
          <!-- Chat sessions will be rendered here -->
        </div>
      </div>

      <!-- Main Chat Window -->
      <div class="main-chat-window flex-1 flex flex-col bg-bg-primary rounded-lg shadow-md">
        <div class="chat-header bg-bg-secondary border-b border-border-color p-4 flex items-center justify-between rounded-t-lg">
          <button id="chat-menu-toggle" class="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-primary">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <h2 id="current-chat-title" class="text-xl font-bold"></h2>
          <button id="delete-chat-btn" class="text-error hover:text-red-700 transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
        <div id="chat-messages" class="flex-1 overflow-y-auto p-4">
          <!-- Chat messages will be appended here -->
        </div>
        <div id="chat-loading-indicator" class="text-center p-2 text-text-secondary hidden">
          <div class="dot-pulse"></div>
        </div>
        <div class="chat-input flex p-4 border-t border-border-color bg-bg-secondary rounded-b-lg">
          <input type="text" id="chat-input-field" class="flex-1 p-3 border border-border-color rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-blue bg-bg-primary text-text-primary" placeholder="Ask Theora anything...">
          <button id="send-chat-btn" class="bg-primary-blue text-white px-6 py-3 rounded-r-lg hover:bg-primary-blue-dark transition-colors duration-200">
            Send
          </button>
        </div>
      </div>
    </div>
  `;

  const chatSidebar = container.querySelector('#chat-sidebar');
  const chatMenuToggle = container.querySelector('#chat-menu-toggle');
  const chatSessionsList = container.querySelector('#chat-sessions-list');
  const newChatBtn = container.querySelector('#new-chat-btn');
  const currentChatTitle = container.querySelector('#current-chat-title');
  const deleteChatBtn = container.querySelector('#delete-chat-btn');
  const chatMessages = container.querySelector('#chat-messages');
  const chatInputField = container.querySelector('#chat-input-field');
  const sendChatBtn = container.querySelector('#send-chat-btn');
  const chatLoadingIndicator = container.querySelector('#chat-loading-indicator');

  // --- Event Listeners ---
  chatMenuToggle.addEventListener('click', () => {
    chatSidebar.classList.toggle('-translate-x-full');
  });

  // --- Helper Functions ---
  function renderChatSessions() {
    chatSessionsList.innerHTML = appState.chatSessions.map(session => `
      <div class="chat-session-item p-3 mb-2 rounded-lg cursor-pointer transition-colors duration-200
        ${session.id === appState.currentChatSessionId ? 'bg-primary-blue text-white' : 'hover:bg-bg-primary text-text-primary'}"
        data-session-id="${session.id}">
        ${session.title}
      </div>
    `).join('');

    // Add event listeners for session switching
    chatSessionsList.querySelectorAll('.chat-session-item').forEach(item => {
      item.addEventListener('click', (e) => {
        appState.setCurrentChatSession(e.currentTarget.dataset.sessionId);
        // Hide sidebar on selection in mobile
        if (window.innerWidth < 768) {
          chatSidebar.classList.add('-translate-x-full');
        }
      });
    });
  }

  function appendMessage(sender, message, messageId) { // Added messageId
    const messageElement = document.createElement('div');
    const theme = getTheme(); // Get current theme

    let messageClass = 'mb-2 p-2 rounded-lg max-w-[70%] relative group'; // Added relative group for delete button
    let textClass = '';

    if (sender === 'user') {
      messageClass += ' ml-auto'; // Align user messages to the right
      messageElement.style.backgroundColor = `rgba(var(--primary-blue-rgb), 0.8)`;
      textClass = 'text-white'; // White text for user messages
    } else { // AI messages
      messageClass += ' mr-auto'; // Align AI messages to the left
      messageElement.style.backgroundColor = `rgba(var(--bg-secondary-rgb), 0.8)`;
      textClass = 'text-text-primary'; // Dynamically changing text color
    }

    messageElement.className = messageClass;
    messageElement.innerHTML = `
      <span class="${textClass}">${marked.parse( message || "")}</span>
      <button class="delete-message-btn absolute top-0 right-0 -mt-2 -mr-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200" data-message-id="${messageId}">
        x
      </button>
    `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
  }

  function renderCurrentChatMessages() {
    chatMessages.innerHTML = ''; // Clear existing messages
    const currentSession = appState.getCurrentChatSession();
    if (currentSession) {
      currentChatTitle.innerHTML = currentSession.title;
      deleteChatBtn.classList.remove('hidden');
      currentSession.messages.forEach(msg => appendMessage(msg.sender, msg.message, msg.id)); // Pass msg.id

      // Add event listeners for delete buttons
      chatMessages.querySelectorAll('.delete-message-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const messageIdToDelete = e.currentTarget.dataset.messageId;
          appState.deleteChatMessage(currentSession.id, messageIdToDelete);
        });
      });
    } else {
      currentChatTitle.innerHTML = 'No Chat Selected';
      deleteChatBtn.classList.add('hidden');
    }
  }

  function showLoadingIndicator() {
    chatLoadingIndicator.classList.remove('hidden');
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to show indicator
  }

  function hideLoadingIndicator() {
    chatLoadingIndicator.classList.add('hidden');
  }

  // --- Event Listeners & Initial Render ---

  // Initial check for chat sessions
  if (appState.chatSessions.length === 0) {
    const newSession = appState.addChatSession('New Chat');
    appState.setCurrentChatSession(newSession.id);
  } else {
    // If there are chat sessions, try to set the last active one
    const lastActiveSessionId = appState.currentChatSessionId;
    if (lastActiveSessionId && appState.getChatSession(lastActiveSessionId)) {
      appState.setCurrentChatSession(lastActiveSessionId);
    } else {
      // If last active session is invalid or not found, default to the first one
      appState.setCurrentChatSession(appState.chatSessions[0].id);
    }
  }

  renderChatSessions();
  renderCurrentChatMessages();

  newChatBtn.addEventListener('click', () => {
    const newSession = appState.addChatSession('New Chat');
    appState.setCurrentChatSession(newSession.id);
  });

  deleteChatBtn.addEventListener('click', () => {
    if (appState.currentChatSessionId) {
      appState.deleteChatSession(appState.currentChatSessionId);
    }
  });

  sendChatBtn.addEventListener('click', async () => {
    const userMessage = chatInputField.value.trim();
    const currentSession = appState.getCurrentChatSession();

    if (userMessage && currentSession) {
      appendMessage('user', userMessage);
      appState.addChatMessage(currentSession.id, 'user', userMessage);
      chatInputField.value = '';
      showLoadingIndicator();

      // If it's a new chat and the first message, generate a name
      if (currentSession.messages.length === 1) { // Only the user's first message is present
        appState.updateChatSessionTitle(currentSession.id, 'Generating title...'); // Placeholder
        generateChatName(userMessage).then(generatedName => {
          appState.updateChatSessionTitle(currentSession.id, generatedName);
        }).catch(() => {
          appState.updateChatSessionTitle(currentSession.id, 'New Chat');
        });
      }

      try {
        // Prepare previousHistory for Eden AI format
        const previousHistory = currentSession.messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          message: msg.message
        }));

        // Define chatbot_global_action (system message)
        // Define chatbot_global_action (system message)
        const globalAction = `As Theora, a supportive AI assistant and financial copilot for Nigerian students and young adults. You have access to the user's summarized data. Provide contextual advice based on this data. Be encouraging, helpful, and culturally relevant.
        User Data Summary:
        - Todos: ${appState.getCompressedTodos()}
        - Events: ${appState.getCompressedEvents()}
        - Budget: ${appState.getCompressedBudget()}`;

        // Construct a concise prompt for the current user message
        const aiPrompt = userMessage; // The actual user message

        const aiPersonality = appState.aiPersonality; // Retrieve personality
        const userName = appState.userName; // Retrieve user name

        const aiResponse = await generateAIResponse(
          aiPrompt,
          { maxTokens: 200 },
          previousHistory,
          globalAction,
          aiPersonality, // Pass personality
          userName // Pass user name
        );
        appendMessage('ai', aiResponse);
        appState.addChatMessage(currentSession.id, 'ai', aiResponse);
      } catch (error) {
        console.error('Error generating AI chat response:', error);
        appendMessage('ai', 'Sorry, I\'m having trouble connecting right now. Please try again later.');
        appState.addChatMessage(currentSession.id, 'ai', 'Sorry, I\'m having trouble connecting right now. Please try again later.');
      } finally {
        hideLoadingIndicator();
      }
    }
  });

  chatInputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatBtn.click();
    }
  });

  // Subscribe to state changes to re-render UI
  appState.subscribe('chatSessionsChanged', renderChatSessions);
  appState.subscribe('currentChatSessionChanged', renderCurrentChatMessages);
}