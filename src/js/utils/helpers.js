export function formatCurrency(amount) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-NG', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-NG', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function getRelativeTime(date) {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  
  return formatDate(date);
}

export function isToday(date) {
  const today = new Date();
  const target = new Date(date);
  return today.toDateString() === target.toDateString();
}

export function isThisWeek(date) {
  const today = new Date();
  const target = new Date(date);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return target >= weekStart && target <= weekEnd;
}

export function isThisMonth(date) {
  const today = new Date();
  const target = new Date(date);
  return today.getMonth() === target.getMonth() && 
         today.getFullYear() === target.getFullYear();
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function getPriorityColor(priority) {
  switch(priority) {
    case 'high': return 'red';
    case 'medium': return 'yellow';
    case 'low': return 'green';
    default: return 'gray';
  }
}

export function getCategoryIcon(category) {
  const icons = {
    food: '🍔',
    transport: '🚗',
    data: '📱',
    education: '📚',
    entertainment: '🎮',
    health: '🏥',
    shopping: '🛍️',
    bills: '⚡',
    savings: '💰',
    other: '📦'
  };
  return icons[category.toLowerCase()] || '📦';
}

 /**
 * Removes duplicates from an array of objects based on a given property.
 * Keeps only the first occurrence of each unique property value.
 *
 * @param {Object[]} arr - The array of objects
 * @param {string} key - The property to deduplicate by
 * @returns {Object[]} A new array with duplicates removed
 */
export function deduplicateBy(arr, key) {
  const seen = new Set();
  return arr.filter(item => {
    if (seen.has(item[key])) {
      return false; // already seen this key value
    }
    seen.add(item[key]);
    return true;
  });
}

export function getCountdown(date) {
  if (!date) return '';
  const now = new Date();
  const target = new Date(date);
  let diffMs = target - now;

  if (diffMs <= 0) return 'Overdue';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  diffMs -= diffDays * 1000 * 60 * 60 * 24;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= diffHours * 1000 * 60 * 60;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  diffMs -= diffMins * 1000 * 60;
  const diffSecs = Math.floor(diffMs / 1000);

  let output = '';
  if (diffDays > 0) {
    output += `${diffDays}d `;
  }
  
  output += `${String(diffHours).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;
  
  return output;
}