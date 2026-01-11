# Theora - Productivity & Financial Copilot

## Overview
**Theora** is a productivity and financial management web application designed specifically for Nigerian students and young adults (ages 18-35). The app helps users juggle multiple responsibilities like school, work, and side hustles while managing their finances through a simulated virtual card system. Built with vanilla JavaScript for simplicity and performance.

**Current State**: MVP complete with all core features implemented and tested. App works both online (with Firebase/AI) and offline (local storage only).

**Last Updated**: October 24, 2025

---

## Recent Changes

### October 24, 2025 - AI Integration Update
- **Dual AI Provider Support**: Implemented support for both Amazon Bedrock and Eden AI.
- **Fallback Mechanism**: Configured to use Amazon Bedrock as the primary AI provider, with automatic fallback to Eden AI if Bedrock is unavailable or fails.
- **Configurable AI Provider**: Added `AI_PROVIDER` setting in `rollup.config.js` to specify the primary AI service.
- **Eden AI Configuration**: Eden AI API key and model are now configured as constants directly in `rollup.config.js`.
- **Refactored AI Service**: Renamed `src/js/services/bedrock.js` to `src/js/services/ai.js` to encapsulate both AI providers.

### October 24, 2025 - AI Notification Overhaul
- **Enhanced Context-Awareness**: AI prompts for notifications now include a comprehensive summary of the user's current state, including budget, tasks, and events.
- **Data-Driven & Specific**: AI is instructed to directly reference user data (e.g., last transaction amount, task priority) in its responses, making notifications more personal and actionable.
- **Randomized Topics**: The notification topic is now chosen randomly from all available data types (todos, events, budget, transactions), ensuring variety and preventing over-emphasis on a single area like finance.

### October 24, 2025 - Critical Bug Fixes
- **Fixed Firebase offline mode crash**: Added credential check before Firebase initialization to enable true offline mode without crashes
- **Fixed budget double-counting bug**: Refactored to use `budget.limit` as single source of truth, with remaining balance derived from transactions via `getRemainingBudget()` method
- **Updated all components**: Dashboard and Budget components now consistently use the new derived state pattern
- **Verified working**: App successfully loads with "Firebase initialized successfully" message

### Earlier - MVP Development
- Complete project setup with Rollup build system and Tailwind CSS v3
- Firebase integration for authentication and data persistence
- AWS Bedrock integration with DeepSeek-R1 for AI-powered suggestions
- Core features: Dashboard, Todos, Calendar, Budget with virtual card
- Event-driven state management with localStorage persistence
- Service Worker for offline PWA capabilities

---

## User Preferences

### Technical Constraints
- **No frameworks**: Must use vanilla JavaScript only (no React, Vue, etc.)
- **Offline-first**: App must work without internet connection using service workers
- **Build system**: Rollup for bundling with environment variable injection
- **Styling**: Tailwind CSS v3 for utility-first styling

### Design Philosophy
- **Simulated finances**: Virtual card system where users manually track spending (no real bank integration)
- **Proactive AI**: AI provides suggestions without user prompting (not reactive/chatbot style)
- **Nigerian context**: Designed for local currency (₦) and cultural context (terms like "sapa mode", "hustle mode")
- **Modern & Clean UI**: A minimalist interface with a card-based layout, responsive design, and a dual-theme (light/dark) system.
- **Interactive & Conversational**: The app provides proactive feedback through non-blocking notifications and AI-powered tips.

---

## Design System

### 1. Core Color Palette
The color system is built on a primary brand palette, semantic colors for user feedback, and a complete dual-theme (light/dark) system using CSS variables.

**Brand & Semantic Colors**
- **Primary Blue (`--primary-blue`):** `#00bcd4` - Main brand color for buttons, links, and highlights.
- **Gradient Start (`--gradient-start`):** `#00e0ff` - Neon cyan for gradients.
- **Gradient End (`--gradient-end`):** `#00bfa6` - Deep teal for gradients.
- **Success (`--success`):** `#4caf50` - Green for positive feedback.
- **Warning (`--warning`):** `#ffc107` - Yellow for cautions.
- **Error (`--error`):** `#f44336` - Red for alerts.

**Dual-Theme System (Light & Dark)**
- **Default Mode:** Dark Mode.
- **Theme Attribute:** `data-theme` on `<html>` tag.
- **Main Background (`--bg-primary`):** `#f0f7fa` (Light) / `#00111E` (Dark).
- **Card Background (`--bg-secondary`):** `#ffffff` (Light) / `#021B34` (Dark).
- **Primary Text (`--text-primary`):** `#00111E` (Light) / `#f5faff` (Dark).
- **Secondary Text (`--text-secondary`):** `#5A6B7B` (Light) / `rgba(245, 250, 255, 0.7)` (Dark).
- **Borders (`--border-color`):** `#dbe9f0` (Light) / `rgba(0, 188, 212, 0.2)` (Dark).

### 2. Typography
- **Font Family:** Inter (from Google Fonts).
- **Hierarchy:**
    - **Brand Title (h1):** 28px, 700 weight.
    - **Page Title (h2):** 28px, 700 weight.
    - **Section Title (h5):** 20px, 700 weight.
    - **Card/Item Title (h6):** 14px, 600 weight.
    - **Body Text:** 1rem, 400 weight.
    - **Form Labels:** 600 weight.

### 3. Layout & Component System
- **Layout:** Fully responsive, single-page application (SPA) with a centered container (`max-width: 1200px`).
- **Core Component: Cards:**
    - **Style:** Rounded corners (15-20px), themed backgrounds (`--bg-secondary`), and borders (`--border-color`).
    - **Interactivity:** Hover effects (lift and border highlight).
- **Buttons & Forms:**
    - **Buttons:** Rounded (10px), with primary actions using a gradient background and secondary actions using outline styles.
    - **Forms:** Themed, rounded inputs with clear focus states for accessibility.

### 4. Interactivity & User Feedback
- **Proactive Notifications:**
    - **`.notification-toast`:** Slides in from the right for event-driven feedback (e.g., "Task Added!").
    - **`.ai-tip-card`:** Slides in from the top for proactive, contextual AI advice.
- **Theme Toggling:** A sun/moon icon in the navbar allows instant switching between Light and Dark modes, with the preference saved to `localStorage`.

---

## Project Architecture

### Directory Structure
```
theora/
├── src/
│   ├── index.html              # Main HTML entry point
│   ├── styles/
│   │   └── main.css            # Tailwind directives + custom styles
│   ├── js/
│   │   ├── main.js             # App initialization and routing
│   │   ├── components/         # UI components (App, Auth, Dashboard, Todos, Calendar, Budget, AIChat, Layout)
│   │   ├── services/           # External services (Firebase, AI, Notification)
│   │   ├── state/              # AppState management with localStorage
│   │   └── utils/              # Helpers (storage, formatting, date functions)
│   └── sw.js                   # Service Worker for offline functionality
├── dist/                       # Build output (bundle.js, styles.css)
├── rollup.config.js            # Rollup build configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── package.json                # Dependencies and scripts
```

### Key Architectural Decisions

#### 1. State Management (appState.js)
- **Pattern**: Event-driven architecture with centralized state
- **Storage**: Automatic localStorage persistence for offline support
- **Budget Logic**: Uses derived state pattern - `budget.limit` stores the budget amount, `getRemainingBudget()` calculates remaining balance from transactions to prevent double-counting
- **Events**: Subscribe/emit pattern for reactive UI updates

#### 2. Firebase Integration (firebase.js)
- **Conditional initialization**: Only initializes if credentials exist via `hasFirebaseCredentials()` check
- **Offline graceful degradation**: Returns null for auth/db when offline. The app requires user authentication, so full functionality is not available without a logged-in user.
- **No crashes**: Guards against Firebase errors in offline mode

#### 3. AI Integration (ai.js)
- **Services**: Integrates both Amazon Bedrock (DeepSeek-R1 model) and Eden AI as providers.
- **Primary/Fallback**: Configured to use Amazon Bedrock as the primary AI service. If Bedrock is unavailable or fails, it automatically falls back to Eden AI.
- **Usage**: Proactive suggestions (daily brief, todo prioritization, budget insights).
- **Fallback**: Mock responses are used if both Bedrock and Eden AI are unavailable or fail.
- **Deeply Context-Aware**: Passes a rich snapshot of user data (todos, budget, events, transactions) for personalized suggestions. For notifications, it randomly selects a topic and provides specific data points (e.g., a random todo, the last transaction) to generate highly relevant, data-driven advice.
- **Configuration**: The primary AI provider (`AI_PROVIDER`), AWS Bedrock credentials (via environment variables), and Eden AI credentials (API key and model as constants) are configured in `rollup.config.js`.



#### 4. Build System (rollup.config.js)
- **Bundling**: Rollup with plugins for Node.js polyfills (@rollup/plugin-node-resolve, @rollup/plugin-commonjs)
- **Environment variables**: @rollup/plugin-replace injects `import.meta.env.*` values at build time, including AI provider configuration.
- **Development**: rollup-plugin-serve with LiveReload on port 5000
- **Production**: @rollup/plugin-terser for minification

#### 5. Offline Support (sw.js)
- **Service Worker**: Caches static assets and API responses
- **Strategy**: Cache-first for assets, network-first for API calls
- **PWA ready**: Can be installed as standalone app

### Data Models

#### Budget State
```javascript
budget: {
  weekly: 50000,      // Reference weekly budget
  monthly: 200000,    // Reference monthly budget
  limit: 50000        // Current period budget (single source of truth)
}
// Remaining balance derived via: limit - sum(transactions)
```

#### Transactions
```javascript
{
  id: "unique-id",
  amount: 5000,
  category: "food",
  description: "Lunch at cafeteria",
  date: "2025-10-24T12:00:00Z"
}
```

#### Todos
```javascript
{
  id: "unique-id",
  title: "Submit assignment",
  completed: false,
  priority: "high",
  dueDate: "2025-10-25T23:59:59Z",
  category: "school"
}
```

#### Events
```javascript
{
  id: "unique-id",
  title: "Team meeting",
  date: "2025-10-25T14:00:00Z",
  description: "Discuss project progress",
  color: "#3B82F6"
}
```

#### User Data
```javascript
{
  uid: "firebase-user-id",
  email: "user@example.com",
  displayName: "Full Name", // Stored in Firebase Auth and Firestore
  // Other user-specific preferences or data
}
```
User data, including `displayName` and `email`, is stored in Firebase Authentication and also synchronized to the "userinfo" Firestore collection via `storage.js`. This ensures data persistence and offline accessibility.

---

## Core Features

### 1. Authentication
- Firebase Auth (email/password)
- **Mandatory Login/Signup**: Users must log in or sign up to access the app. Offline mode without an account is no longer supported.
- **User Data Storage**: User's full name and email are stored in Firebase Authentication's `displayName` and synchronized with the "userinfo" Firestore collection via `storage.js` for persistent and offline access.
- Auto-persist user state

### 2. AI Chat
- **Interactive AI Assistant**: A full chat interface allowing users to ask Theora questions directly.
- **Context-Aware Responses**: The AI has access to the user's current todos, events, budget, and transactions to provide personalized and relevant advice.
- **Chat History**: Conversations are saved, and users can create multiple chat sessions to organize their queries.

### 3. Dashboard
- AI-generated daily brief with personalized suggestions
- Quick stats: urgent tasks, week spending, today's schedule, AI tips
- Quick actions to navigate to other sections
- Hustle Mode toggle for focus

### 4. Todos
- Add/edit/delete todos with priority levels
- Categories: School, Work, Side Hustle, Personal
- Day/Week/Month filtered views
- AI-powered smart suggestions for prioritization
- Mark as complete with satisfaction tracking

### 5. Calendar
- Month/Week/Day views
- Add/edit/delete events
- Color-coded events
- Event reminders

### 6. Budget (Virtual Card System)
- 3D flip card design showing balance
- Manual transaction entry (simulated spending)
- Category-based spending tracking (Food, Transport, Data, Education, Entertainment, Bills)
- Budget goals (weekly/monthly/current)
- Spending visualization with charts
- AI budget insights and recommendations

### 7. Settings
- Hustle Mode: Focus mode with motivational messaging
- Sapa Mode: Budget-conscious suggestions when funds are low
- Notification preferences
- **Light & Dark Mode Toggle**: Switch between themes.

### 8. Notifications
- **Toast Notifications**: For event-driven feedback (e.g., "Task Added!").
- **AI Tip Cards**: For proactive, contextual advice. The AI generates randomized, data-driven notifications that comment on various aspects of the user's activity, from specific transactions to individual tasks, ensuring the advice is always fresh and relevant.

---

## Environment Variables

Required for full functionality (app works in offline mode without these):

### Firebase (Authentication & Database)
```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id
```

### AWS Bedrock (AI Features)
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

**Note**: All environment variables are injected at build time via Rollup's replace plugin. Eden AI configuration is handled as constants directly within `rollup.config.js`.

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://0.0.0.0:5000)
npm run dev

# Build for production
npm run build
```

---

## Technical Stack

### Core
- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS v3
- **Build Tool**: Rollup
- **Package Manager**: npm

### Services
- **Backend**: Firebase (Firestore + Auth)
- **AI**: Amazon Bedrock (DeepSeek-R1 model) and Eden AI
- **Offline**: Service Workers + localStorage

### Key Dependencies
- `firebase`: Authentication and database
- `@aws-sdk/client-bedrock-runtime`: AI inference for Amazon Bedrock
- `fetch` API: For Eden AI integration (native browser API)
- `rollup` + plugins: Build system with environment variable injection
- `tailwindcss` + `postcss` + `autoprefixer`: Styling

---

## Known Limitations & Future Enhancements

### Current Limitations
1. Simulated financial data only (no real bank integration)
2. AI features require AWS Bedrock credentials (fallback to mock responses if both Bedrock and Eden AI fail).
3. Calendar limited to basic event management (no recurring events)
4. No data sync between devices (unless using Firebase)

### Potential Enhancements
- Add recurring events to calendar
- Implement spending analytics dashboard with charts
- Add budget alerts/notifications when approaching limits
- Social features (share goals with friends)
- Export financial reports
- Integration with mobile money APIs (MTN, Airtel, etc.)
- Multi-currency support

---

## Deployment Notes

### Prerequisites for Production
1. Set up Firebase project and obtain credentials
2. Configure AWS Bedrock access (optional, app works without AI). If using Eden AI, ensure `EDEN_AI_API_KEY` and `EDEN_AI_MODEL` are correctly set in `rollup.config.js`.
3. Set environment variables in Replit Secrets
4. Run `npm run build` to generate production bundle
5. Serve `dist/` directory

### Performance Considerations
- Bundle size: ~800KB (includes Firebase + AWS SDK)
- First load: ~2s on 3G connection
- Offline mode: Instant load after first visit
- Service Worker caches all static assets

### Security Notes
- All secrets managed via environment variables (for AWS Bedrock) or constants in `rollup.config.js` (for Eden AI).
- Firebase security rules should be configured server-side
- No sensitive data stored in localStorage (only user preferences)
- CSP headers recommended for production deployment

---

## Architecture Patterns

### Single Source of Truth
Budget amount stored in `budget.limit`, remaining balance always derived from transactions to prevent state synchronization bugs.

### Event-Driven Updates
Components subscribe to state changes and automatically re-render when relevant data updates.

### Graceful Degradation
App works fully offline with localStorage, seamlessly upgrades to cloud sync when credentials provided. AI features gracefully degrade from Bedrock to Eden AI, and then to mock responses if both fail.

### Progressive Enhancement
Core features work without AI, AI suggestions enhance the experience when available.

---

## Debugging Tips

### Common Issues

**Issue**: Firebase offline crash  
**Solution**: Ensure credentials are checked before initialization (fixed in firebase.js)

**Issue**: Budget shows incorrect remaining balance  
**Solution**: Use `appState.getRemainingBudget()` instead of accessing `budget.current` directly (fixed in v1.0)

**Issue**: Service Worker not updating  
**Solution**: Clear browser cache or unregister old SW in DevTools → Application → Service Workers

**Issue**: Environment variables not working  
**Solution**: Rebuild with `npm run build` to inject new values via Rollup replace plugin

### Development Mode
- Server runs on port 5005 with LiveReload
- Check browser console for Firebase/Bedrock/Eden AI initialization messages
- Use "Continue without account" to test offline mode

---

## Credits & License

**Created**: October 2025  
**Target Users**: Nigerian students and young adults (18-35)  
**License**: Proprietary

Built with ❤️ for productive hustlers everywhere 💪