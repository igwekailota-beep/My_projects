import '../styles/main.css';
import { initializeApp } from './utils/init.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}
