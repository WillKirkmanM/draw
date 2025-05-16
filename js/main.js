import { DrawingApp } from './DrawingApp.js';
import { initDarkMode } from './darkMode.js';
import "./sampleShapes.js"

// Initiaise the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = DrawingApp.getInstance();
  app.init();
  window.drawingApp = app;

  initDarkMode();
});