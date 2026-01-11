const themeKey = 'theora-theme';

function applyTheme(theme) {
  const html = document.documentElement;
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');
  const mobileSunIcon = document.getElementById('mobile-theme-icon-sun');
  const mobileMoonIcon = document.getElementById('mobile-theme-icon-moon');

  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');
    if (mobileSunIcon) mobileSunIcon.classList.remove('hidden');
    if (mobileMoonIcon) mobileMoonIcon.classList.add('hidden');
  } else {
    html.removeAttribute('data-theme');
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');
    if (mobileSunIcon) mobileSunIcon.classList.add('hidden');
    if (mobileMoonIcon) mobileMoonIcon.classList.remove('hidden');
  }
}

export function initTheme() {
  const savedTheme = localStorage.getItem(themeKey);
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  applyTheme(theme);
}

export function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.hasAttribute('data-theme') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(themeKey, newTheme);
  applyTheme(newTheme);
}

export function getTheme() {
  const html = document.documentElement;
  return html.hasAttribute('data-theme') ? 'dark' : 'light';
}
