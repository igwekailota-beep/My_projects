import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { appState } from '../state/appState.js';
import { getRelativeTime } from '../utils/helpers.js';

window.appState=appState

// --- Constants ---
const BEDROCK_MODEL_ID = 'us.deepseek.r1-v1:0';

// --- Credentials from Rollup ---
const AWS_CREDENTIALS = {
  accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
  region: import.meta.env.AWS_REGION,
};

const EDEN_AI_CREDENTIALS = {
  apiKey: import.meta.env.EDEN_AI_API_KEY,
  model: import.meta.env.EDEN_AI_MODEL,
};

let bedrockClient = null;

// --- Initialization ---

/**
 * Initializes the AI clients based on available credentials.
 */
export function initAIClients() {
  if (AWS_CREDENTIALS.accessKeyId && AWS_CREDENTIALS.secretAccessKey) {
    try {
      bedrockClient = new BedrockRuntimeClient({
        region: AWS_CREDENTIALS.region,
        credentials: {
          accessKeyId: AWS_CREDENTIALS.accessKeyId,
          secretAccessKey: AWS_CREDENTIALS.secretAccessKey,
        },
      });
      console.log('AWS Bedrock client initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize AWS Bedrock client:', error);
    }
  } else {
    console.warn('AWS Bedrock credentials not found.');
  }

  if (EDEN_AI_CREDENTIALS.apiKey && EDEN_AI_CREDENTIALS.apiKey !== 'YOUR_EDEN_AI_API_KEY') {
    console.log('Eden AI configured.');
  } else {
    console.warn('Eden AI API key not found or is a placeholder.');
  }
}


// --- Bedrock API Call ---

async function fetchBedrockResponse(prompt, options) {
  if (!bedrockClient) {
    throw new Error('Bedrock client not initialized.');
  }
  
  const formattedPrompt = `<｜begin of sentence｜><｜User｜>${prompt}<｜Assistant｜><think>`;
  const body = JSON.stringify({
    prompt: formattedPrompt,
    max_tokens: options.maxTokens || 512,
    temperature: options.temperature || 0.7,
    top_p: options.topP || 0.9,
  });

  const command = new InvokeModelCommand({
    modelId: BEDROCK_MODEL_ID,
    body,
    contentType: 'application/json',
    accept: 'application/json',
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const completion = responseBody.completion || responseBody.text;

  if (!completion) {
    throw new Error('Invalid response structure from Bedrock.');
  }
  return completion;
}

// --- Eden AI API Call ---

async function fetchEdenAIResponse(prompt, options, previousHistory = [], globalAction = "") {
  if (!EDEN_AI_CREDENTIALS.apiKey || EDEN_AI_CREDENTIALS.apiKey === 'YOUR_EDEN_AI_API_KEY') {
    throw new Error('Eden AI API key not configured.');
  }

  const response = await fetch('https://api.edenai.run/v2/text/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${EDEN_AI_CREDENTIALS.apiKey}`,
    },
    body: JSON.stringify({
      providers: 'deepseek',
      text: prompt,
      model: EDEN_AI_CREDENTIALS.model,
      max_tokens: options.maxTokens || 512,
      temperature: options.temperature || 0.7,
      previous_history: previousHistory,
      chatbot_global_action: globalAction
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Eden AI API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  console.log(data)
  const generatedText = data.deepseek.generated_text;

  if (!generatedText) {
    throw new Error('Invalid response structure from Eden AI.');
  }
  return generatedText;
}

// --- Main Generator Function ---

/**
 * Generates an AI response, trying the primary provider first, then falling back.
 * @param {string} prompt - The prompt to send to the AI.
 * @param {object} options - Options like maxTokens, temperature.
 * @returns {Promise<string>} - The AI-generated response.
 */
export async function generateAIResponse(prompt, options = {}, previousHistory = [], globalAction = "", userName = 'User', userData = {}) {
  const currentAIProvider = appState.aiProvider; // Get AI provider from appState
  const aiResponseStyle = appState.aiResponseStyle; // Get AI response style from appState

  let selectedPersonalityPrompt = '';

  // Check if the selected aiResponseStyle is a custom mode
  const customMode = appState.customAiModes.find(mode => mode.name === aiResponseStyle);
  if (customMode) {
    selectedPersonalityPrompt = customMode.instruction;
  } else {
    // Define a mapping for personalities and response styles
    const personalityPrompts = {
      'supportive': `As Theora, a supportive AI assistant and financial copilot for Nigerian students and young adults. Address the user as ${userName}. Provide encouraging, helpful, and culturally relevant advice.`,
      'direct': `As Theora, a direct and concise AI assistant and financial copilot for Nigerian students and young adults. Address the user as ${userName}. Provide straightforward, actionable, and culturally relevant advice.`,
      'normal': `As Theora, a helpful AI assistant and financial copilot for Nigerian students and young adults. Address the user as ${userName}. Provide clear, standard, and culturally relevant advice.`,
      'concise': `As Theora, a concise AI assistant and financial copilot for Nigerian students and young adults. Address the user as ${userName}. Provide brief, to-the-point, and actionable advice.`,
      'sapa': `As Theora, your financial copilot, I understand say money no dey. Address the user as ${userName}. I go give you advice for pidgin English, make we manage this sapa together. Focus on saving, finding small hustles, and cutting unnecessary spending. Make the advice relatable to Nigerian students/young adults.`,
      'hustle': `As Theora, your productivity and financial copilot, I dey for your back as you dey hustle. Address the user as ${userName}. I go give you advice for pidgin English, make you fit achieve your goals. Focus on maximizing productivity, smart financial decisions for growth, and leveraging opportunities. Make the advice relatable to Nigerian students/young adults.`,
      // Add more personalities as needed
    };
    selectedPersonalityPrompt = personalityPrompts[aiResponseStyle] || personalityPrompts['normal'];
  }

  // Construct a comprehensive user context string from userData
  const userContextString = `
User's Current State:
- Name: ${userName}
- Budget Limit: ₦${userData.budget?.limit?.toLocaleString() || 'N/A'}
- Remaining Budget: ₦${userData.budget?.remaining?.toLocaleString() || 'N/A'}
- Total Todos: ${userData.todos?.length || 0}
- Total Events: ${userData.events?.length || 0}
- Last 3 Transactions: ${userData.transactions?.slice(0, 3).map(t => `₦${t.amount} on ${t.category}`).join(', ') || 'None'}
- Urgent Todos: ${userData.todos?.filter(t => t.priority === 'high').map(t => t.title).join(', ') || 'None'}
- Upcoming Events (next 24h): ${userData.events?.filter(e => new Date(e.date) - new Date() < 24 * 60 * 60 * 1000).map(e => e.title).join(', ') || 'None'}
`;

  const effectiveGlobalAction = `${selectedPersonalityPrompt}

${userContextString}

${globalAction}`;

  // Primary: User-selected provider (or Bedrock as default if not set)
  if (currentAIProvider === 'bedrock' && bedrockClient) {
    try {
      // For Bedrock, integrate previousHistory and effectiveGlobalAction into the prompt
      const bedrockPrompt = `${effectiveGlobalAction ? effectiveGlobalAction + '\n\n' : ''}${previousHistory.map(msg => `${msg.sender}: ${msg.message}`).join('\n')}\n${prompt}`;
      const response = await fetchBedrockResponse(bedrockPrompt, options);
      return response;
    } catch (error) {
      console.warn(`Bedrock request failed: ${error.message}. Falling back to Eden AI.`);
      // Fallback: Eden AI
      try {
        const response = await fetchEdenAIResponse(prompt, options, previousHistory, effectiveGlobalAction);
        return response.generated_text || response.completion || response.text || response;
      } catch (fallbackError) {
        console.error(`Eden AI fallback failed: ${fallbackError.message}. Using mock response.`);
        return getMockAIResponse(prompt);
      } finally {
        // Ensure toolResults is reset or handled appropriately if this path is taken
        // For now, we assume no tool calls are processed in this direct fallback path
      }
    }
  }

  // Primary: User-selected provider (Eden AI)
  if (currentAIProvider === 'edenai') {
    try {
      const response = await fetchEdenAIResponse(prompt, options, previousHistory, effectiveGlobalAction);
      // Handle tool calls if they exist in the response
      if (response.tool_calls && response.tool_calls.length > 0) {
        console.log('AI requested tool calls:', response.tool_calls);
        const executedToolResults = [];
        for (const toolCall of response.tool_calls) {
          const result = await executeTool(toolCall);
          executedToolResults.push(result);
        }
        // Make a second call to Eden AI with tool results
        const finalAIResponse = await fetchEdenAIResponse(prompt, options, previousHistory, effectiveGlobalAction, 'auto', toolDefinitions, executedToolResults);
        return finalAIResponse.generated_text || finalAIResponse.completion || finalAIResponse.text;
      }
      return response.generated_text || response.completion || response.text;
    } catch (error) {
      console.warn(`Eden AI request failed: ${error.message}. Falling back to Bedrock.`);
      // Fallback: Bedrock
      if (bedrockClient) {
        try {
          const bedrockPrompt = `${effectiveGlobalAction ? effectiveGlobalAction + '\n\n' : ''}${previousHistory.map(msg => `${msg.sender}: ${msg.message}`).join('\n')}\n${prompt}`;
          const response = await fetchBedrockResponse(bedrockPrompt, options);
          return response;
        } catch (fallbackError) {
          console.error(`Bedrock fallback failed: ${fallbackError.message}. Using mock response.`);
          return getMockAIResponse(prompt);
        }
      } else {
        console.error('Bedrock client not available for fallback. Using mock response.');
        return getMockAIResponse(prompt);
      }
    }
  }

  // Default fallback if no provider is configured or available. This should ideally not be reached if currentAIProvider is always set.
  console.warn('No primary AI provider configured or available. Using mock response.');
  return getMockAIResponse(prompt);
}


// --- Mock Response ---

function getMockAIResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('prioritize') || lowerPrompt.includes('sort')) {
    return 'Based on your tasks, I recommend focusing on high-priority items first, especially those with upcoming deadlines. Your exam preparation should be top priority this week.';
  }
  
  if (lowerPrompt.includes('budget') || lowerPrompt.includes('spending')) {
    return "Your spending looks good this week. Consider setting aside more for savings if possible. Watch your data expenses - they're trending higher than usual.";
  }
  
  if (lowerPrompt.includes('today') || lowerPrompt.includes('plan')) {
    return 'Good morning! Today you have 3 high-priority tasks and 2 medium-priority items. I suggest starting with your assignment due tomorrow, then tackling your freelance project. You have ₦15,000 left in your weekly budget.';
  }
  
  return "I'm here to help you stay organized and reach your goals. Let me know what you need assistance with!";
}

// --- High-Level API ---

export async function prioritizeTodos(todos) {
  if (appState.aiMessages.todoPrioritization) {
    return appState.aiMessages.todoPrioritization;
  }
;
  const userName = appState.userName;
  const aiPersonality = appState.aiPersonality;
  const budget = appState.budget;
  const events = appState.events;
  const transactions = appState.transactions;

  const userData = {
    budget: budget,
    todos: todos,
    events: events,
    transactions: transactions,
  };

  const prompt = `Given these tasks: ${todos.map(t => `"${t.title}" (priority: ${t.priority}, due: ${t.dueDate || 'no date'})`).join(', ')}. 
  
  Suggest the optimal order to complete them, considering priority levels, deadlines, and typical student/young professional workflows. Return a brief recommendation. You should encourage the user to use Theora's features where necessary. The features include adding setting todos, setting events on a calender and managing budget. Make sure you call the user by their name, which is ${userName || "User"} where necessary.`;
  
  const result = await generateAIResponse(prompt, { maxTokens: 256 }, [], "", userName, userData);
  appState.setAIMessage('todoPrioritization', result);
  return result;
}

export async function analyzeBudget(transactions, budget) {
  if (appState.aiMessages.budgetInsight) {
    return appState.aiMessages.budgetInsight;
  }
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  const userName = appState.userName;
  const aiPersonality = appState.aiPersonality;
  const todos = appState.todos;
  const events = appState.events;

  const userData = {
    budget: budget,
    todos: todos,
    events: events,
    transactions: transactions,
  };
  
  const prompt = `A user has spent ₦${totalSpent} out of their ₦${budget} budget. Recent transactions: ${transactions.slice(0, 5).map(t => `₦${t.amount} on ${t.category}`).join(', ')}. 
  
  Provide brief spending insights and suggestions for a Nigerian student/young professional named ${userName || "user"}.`;
  
  const result = await generateAIResponse(prompt, { maxTokens: 200 }, [], "", userName, userData);
  appState.setAIMessage('budgetInsight', result);
  return result;
}

export async function generateDailyBrief(todos, budget, todayEvents) {
  if (appState.aiMessages.dailyBrief) {
    return appState.aiMessages.dailyBrief;
  }

  const userName = appState.userName;
  const aiPersonality = appState.aiPersonality;
  const transactions = appState.transactions; // Get transactions from appState
  const events = appState.events; // Get all events from appState for comprehensive userData

  const userData = {
    budget: budget,
    todos: todos,
    events: events, // Use all events for userData, not just todayEvents
    transactions: transactions,
  };

  const prompt = `Create a brief, motivational daily game plan for ${userName}.

Here's the user's situation:
- **Budget:** ₦${budget} remaining for the week.
- **Urgent Tasks (${todos.length}):**
  ${todos.map(t => `- "${t.title}" (Due: ${getRelativeTime(t.dueDate)})`).join('\n  ')}
- **Today's Events (${todayEvents.length}):**
  ${todayEvents.map(e => `- "${e.title}" at ${e.time || 'All day'}`).join('\n  ')}}

Your tasks:
1.  **Acknowledge ${userName}'s hustle.**
2.  **Analyze the tasks and events.** Point out the most critical item for today based on urgency, content, and remaining time.
3.  **Provide a concrete, actionable suggestion.** What should they focus on first?
4.  **Keep it concise and encouraging (2-3 sentences).**

Example: "Morning ${userName}! You've got a full plate today. That "${todos[0]?.title || 'assignment'}" is your top priority. Knock it out first, then you can focus on your meeting this afternoon. You've got this! Your budget is looking solid at ₦${budget}."`;

  const result = await generateAIResponse(prompt, { maxTokens: 250 }, [], "", userName, userData);
  appState.setAIMessage('dailyBrief', result);
  return result;
}

export async function generateTimeManagementAdvice(todos, events) {
  // Combine todos and events for context
  const allItems = [
    ...todos.map(t => ({ type: 'todo', title: t.title, priority: t.priority, dueDate: t.dueDate, completed: t.completed })),
    ...events.map(e => ({ type: 'event', title: e.title, date: e.date, time: e.time, recurrence: e.recurrence }))
  ];

  const userName = appState.userName;
  const aiPersonality = appState.aiPersonality;
  const budget = appState.budget;
  const transactions = appState.transactions;

  const userData = {
    budget: budget,
    todos: todos,
    events: events,
    transactions: transactions,
  };

  const prompt = `As Theora, an AI productivity and financial copilot, provide concise time management advice (about 3 paragraphs) to a Nigerian student or young professional. Base your advice on the following current tasks and events:

${JSON.stringify(allItems, null, 2)}

Your advice should focus on:
1.  **Key Priorities:** Identify the most critical tasks/events based on urgency and importance.
2.  **Actionable Steps:** Suggest immediate, practical steps for managing their time effectively today/this week.
3.  **Theora's Role:** Briefly mention how Theora can assist in implementing these strategies.

Ensure the tone is encouraging, culturally relevant (e.g., acknowledging "hustle"), and highly actionable. The response should be well-structured into about 3 paragraphs.`

  const result = await generateAIResponse(prompt, { maxTokens: 300 }, [], "", userName, userData); // Adjusted maxTokens for ~3 paragraphs
  appState.setAIMessage('timeManagementAdvice', result);
  return result;
}

export async function generateNotification(budget, todos, events, transactions) {
  const possibleNotifications = [];

  // Add a todo notification if todos exist
  if (todos.length > 0) {
    const randomTodo = todos[Math.floor(Math.random() * todos.length)];
    possibleNotifications.push({ type: 'todo', item: randomTodo });
  }

  // Add an event notification if events exist
  if (events.length > 0) {
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    possibleNotifications.push({ type: 'event', item: randomEvent });
  }

  // Add a budget notification if a budget is set
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remainingBudget = budget.limit - totalSpent;
  if (budget.limit > 0) {
    possibleNotifications.push({ type: 'budget', item: { ...budget, remaining: remainingBudget } });
  }

  // Add a transaction notification if transactions exist
  if (transactions.length > 0) {
    const randomTransaction = transactions[Math.floor(Math.random() * transactions.length)];
    possibleNotifications.push({ type: 'transaction', item: randomTransaction });
  }

  // Always add a general tip as an option
  possibleNotifications.push({ type: 'general' });

  // Select a random notification type from the possibilities
  const selectedNotification = possibleNotifications[Math.floor(Math.random() * possibleNotifications.length)];

  let prompt = '';
  let notificationType = selectedNotification.type;
  let message = '';

  const userName = appState.userName;
  const aiPersonality = appState.aiPersonality;

  const userContext = `Context for AI: User ${userName} has ${todos.length} tasks, ${events.length} events. Remaining budget: ₦${remainingBudget.toLocaleString()}.`;

  switch (selectedNotification.type) {
    case 'todo':
      const todo = selectedNotification.item;
      prompt = `Write a short, direct notification (1-2 sentences) for ${userName} about this task: "${todo.title}" (Priority: ${todo.priority}). Reference their budget (₦${remainingBudget.toLocaleString()}) or task count (${todos.length}) to add context. Be specific. ${userContext}`;
      break;
    case 'event':
      const event = selectedNotification.item;
      prompt = `Write a short, direct notification (1-2 sentences) for ${userName} for this event: "${event.title}" on ${event.date}. State how much budget is left (₦${remainingBudget.toLocaleString()}) and remind them to plan accordingly. Be specific. ${userContext}`;
      break;
    case 'budget':
      prompt = `Write a short, direct notification (1-2 sentences) for ${userName} about their budget. State they have ₦${selectedNotification.item.remaining.toLocaleString()} left. Mention their total number of tasks (${todos.length}) as something to focus on. ${userContext}`;
      break;
    case 'transaction':
      const transaction = selectedNotification.item;
      prompt = `Write a short, direct notification (1-2 sentences) for ${userName} commenting on a user transaction: ₦${transaction.amount} on ${transaction.category}. Give a specific, brief opinion on this spending and state their remaining budget (₦${remainingBudget.toLocaleString()}). ${userContext}`;
      break;
    case 'general':
    default:
      prompt = `Write a short, motivational tip (1-2 sentences) for ${userName}. Directly reference one piece of user data: remaining budget (₦${remainingBudget.toLocaleString()}), number of tasks (${todos.length}), or number of events (${events.length}). Make the tip highly specific to that data point. ${userContext}`;
      notificationType = 'general';
      break;
  }

  try {
    message = await generateAIResponse(prompt, { maxTokens: 80 }, [], "", userName);
  } catch (error) {
    console.error('AI Notification Error:', error);
    message = 'Stay productive! Theora is here to help.';
    notificationType = 'general';
  }

  return { message, type: notificationType };
}

export async function generateChatName(initialPrompt) {
  const namingPrompt = `Given the following initial chat message, generate a very concise (3-5 words) and descriptive title for the chat session. The title should capture the main topic.\n  Initial Message: "${initialPrompt}"\n  Chat Title:`;
  try {
    // Use generateAIResponse with a very low maxTokens to ensure conciseness
    const result = await generateAIResponse(namingPrompt, { maxTokens: 15, temperature: 0.5 });
    // Clean up any potential leading/trailing whitespace or quotes from the AI response
    return result.trim().replace(/["']/g, '');
  } catch (error) {
    console.error('Error generating chat name:', error);
    return 'New Chat'; // Fallback title
  }
}