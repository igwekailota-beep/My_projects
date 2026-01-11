
import { db } from '../services/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const StorageKeys = {
  USER: 'theora_user',
  TODOS: 'theora_todos',
  EVENTS: 'theora_events',
  TRANSACTIONS: 'theora_transactions',
  BUDGET: 'theora_budget',
  SETTINGS: 'theora_settings',
  AI_MESSAGES: 'theora_aiMessages',
  CHAT_SESSIONS: 'theora_chatSessions',
  LAST_CHAT_SESSION_ID: 'theora_lastChatSessionId',
  AI_PROVIDER: 'theora_aiProvider',
  AI_RESPONSE_STYLE: 'theora_aiResponseStyle',
  CUSTOM_AI_MODES: 'theora_customAiModes',
  USER_INFO: 'theora_user_info',
};

export function saveToLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

export function loadFromLocal(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}

export function removeFromLocal(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
}

export function clearAllLocal() {
  try {
    Object.values(StorageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

const storageKeyMap = {
    'todos': StorageKeys.TODOS,
    'events': StorageKeys.EVENTS,
    'transactions': StorageKeys.TRANSACTIONS,
    'budget': StorageKeys.BUDGET,
    'settings': StorageKeys.SETTINGS,
    'aiMessages': StorageKeys.AI_MESSAGES,
    'chatSessions': StorageKeys.CHAT_SESSIONS,
    'currentChatSessionId': StorageKeys.LAST_CHAT_SESSION_ID,
    'aiProvider': StorageKeys.AI_PROVIDER,
    'aiResponseStyle': StorageKeys.AI_RESPONSE_STYLE,
    'customAiModes': StorageKeys.CUSTOM_AI_MODES,
};

export const storage = {
  async loadUserData(uid) {
    if (!uid) return {};

    const keysToSync = Object.keys(storageKeyMap);

    let remoteUserDoc = {};
    if (db) {
      try {
        const remoteDocRef = doc(db, 'userdata', uid);
        const remoteDocSnap = await getDoc(remoteDocRef);
        if (remoteDocSnap.exists()) {
          remoteUserDoc = remoteDocSnap.data();
        }
      } catch (error) {
        console.error('Firestore fetch failed, will rely on local data.', error);
      }
    }

    const finalData = {};
    for (const key of keysToSync) {
      const storageKey = storageKeyMap[key];
      const localItem = loadFromLocal(storageKey);
      const remoteItem = remoteUserDoc[key];

      if (remoteItem && (!localItem || new Date(remoteItem.lastUpdated) > new Date(localItem.lastUpdated))) {
        finalData[key] = remoteItem.data;
        saveToLocal(storageKey, remoteItem);
      } else if (localItem) {
        finalData[key] = localItem.data;
      } else {
        finalData[key] = undefined;
      }
    }
    return finalData;
  },

  async saveUserData(uid, firestoreKey, data) {
    if (!uid || !firestoreKey) return;
    
    const storageKey = storageKeyMap[firestoreKey];
    if (!storageKey) {
        console.error(`No storage key found for firestore key: ${firestoreKey}`);
        return;
    }

    const payload = {
      lastUpdated: new Date().toISOString(),
      data: data,
    };

    saveToLocal(storageKey, payload);

    if (db) {
      try {
        const remoteDocRef = doc(db, 'userdata', uid);
        await setDoc(remoteDocRef, { [firestoreKey]: payload }, { merge: true });
      } catch (error) {
        console.error(`Error saving ${firestoreKey} to Firestore:`, error);
      }
    }
  },
  
  async get(collectionName, docId) {
    const localData = loadFromLocal(`${collectionName}_${docId}`);
    if (localData) return localData;
    if (db) {
      try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          saveToLocal(`${collectionName}_${docId}`, data);
          return data;
        }
      } catch (error) {
        console.error(`Error getting document ${collectionName}/${docId} from Firestore:`, error);
      }
    }
    return null;
  },

  async set(collectionName, docId, data) {
    saveToLocal(`${collectionName}_${docId}`, data);
    if (db) {
      try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data, { merge: true });
        return true;
      } catch (error) {
        console.error(`Error setting document ${collectionName}/${docId} in Firestore:`, error);
        return false;
      }
    }
    return false;
  },
};
