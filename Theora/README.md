# Theora - Productivity & Financial Copilot

![Theora Logo](Assets/Theora_logo.png)

**Theora** is a productivity and financial management web application designed specifically for Nigerian students and young adults (ages 18-35). The app helps users juggle multiple responsibilities like school, work, and side hustles while managing their finances through a simulated virtual card system.

## ✨ Key Features

*   **Dashboard**: Get an AI-generated daily brief with personalized suggestions, and see quick stats on your tasks, spending, and schedule.
*   **Todos**: Manage your tasks with priority levels, categories, and different views (Day/Week/Month).
*   **Calendar**: Keep track of your events with month, week, and day views.
*   **Budgeting**: A virtual card system to manually track your spending, set budget goals, and get AI-powered budget insights.
*   **AI Chat**: An interactive AI assistant that has access to your data to provide personalized advice.
*   **Offline First**: The app is a Progressive Web App (PWA) and works offline using service workers.
*   **Dual AI Provider Support**: Theora uses Amazon Bedrock as the primary AI provider, with an automatic fallback to Eden AI.

## 🛠️ Tech Stack

*   **Frontend**: Vanilla JavaScript (ES6+), Tailwind CSS v3
*   **Backend**: Firebase (Firestore + Authentication)
*   **AI**: Amazon Bedrock (DeepSeek-R1 model) and Eden AI
*   **Build Tool**: Rollup
*   **Offline**: Service Workers + localStorage

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) installed on your system.
*   [npm](https://www.npmjs.com/) (which comes with Node.js).

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/igwekailota-beep/My_projects.git
    cd My_projects/Theora
    ```

2.  Install the dependencies:
    ```bash
    npm install
    ```

### Configuration

Theora requires configuration for Firebase and the AI services to run with full functionality. These are managed in the `rollup.config.js` file and are expected to be provided as environment variables.

Create a `.env` file in the root of the `Theora` directory and add the following variables:

```
# Firebase (Authentication & Database)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id

# AWS Bedrock (AI Features)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Eden AI (AI Fallback)
EDEN_AI_API_KEY=your-eden-ai-key
```

*Note: The app will work in offline mode without these, but with limited functionality.*

### Development

To start the development server with live reload:

```bash
npm run dev
```

The app will be available at `http://localhost:5005`.

### Production

To build the application for production:

```bash
npm run build
```

The production-ready files will be generated in the `site` directory.

## 📄 License

This project is proprietary. See `GEMINI.md` for more detailed documentation.
