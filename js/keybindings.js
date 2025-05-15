import { DrawingApp } from './DrawingApp.js';

export class KeyBindings {
  static init() {
    document.addEventListener('keydown', KeyBindings.handleKeyDown);
    document.addEventListener('keyup', KeyBindings.handleKeyUp);
  }
  
  static handleKeyDown(event) {
    // Don't trigger shortcuts if user is typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }
    
    const app = DrawingApp.getInstance();
    const toolManager = app.toolManager;
    
    // Tool shortcuts
    if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
      switch (event.key.toLowerCase()) {
        case 'h': // Hand tool
          toolManager.selectTool('hand');
          break;
        case 'v': // Selection tool
        case '1':
          toolManager.selectTool('select');
          break;
        case 'r': // Rectangle tool
        case '2':
          toolManager.selectTool('rect');
          break;
        case 'd': // Diamond tool
        case '3':
          toolManager.selectTool('diamond');
          break;
        case 'o': // Ellipse tool
        case '4':
          toolManager.selectTool('ellipse');
          break;
        case 'a': // Arrow tool
        case '5':
          toolManager.selectTool('arrow');
          break;
        case 'l': // Line tool
        case '6':
          toolManager.selectTool('line');
          break;
        case 'p': // Draw/Pencil tool
        case '7':
          toolManager.selectTool('pencil');
          break;
        case 't': // Text tool
        case '8':
          toolManager.selectTool('text');
          break;
        case '9': // Image tool
          toolManager.selectTool('image');
          break;
        case 'e': // Eraser tool
        case '0':
          toolManager.selectTool('eraser');
          break;
        case 'q': // Lock/Keep tool active
          toolManager.toggleLockTool();
          break;
        case 'delete': // Delete selected
        case 'backspace':
          if (app.selectedShape) {
            app.removeShape(app.selectedShape);
            app.selectedShape = null;
          }
          break;
      }
    }
    
    // Handle Zoom
    if (event.ctrlKey && !event.altKey) {
      switch (event.key) {
        case '+': // Zoom in
        case '=':
          event.preventDefault();
          app.setZoomLevel(Math.min(app.zoomLevel * 1.2, 5));
          break;
        case '-': // Zoom out
        case '_':
          event.preventDefault();
          app.setZoomLevel(Math.max(app.zoomLevel / 1.2, 0.1));
          break;
        case 'z': // Undo
          event.preventDefault();
          if (event.shiftKey) {
            app.historyManager.redo();
          } else {
            app.historyManager.undo();
          }
          break;
      }
    }
    
    // Theme toggle with Alt+Shift+D
    if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      app.toggleTheme();
    }
  }
  
  static handleKeyUp(event) {
    // Key up logic if needed
  }
}

// Initiaise keybindings when imported
KeyBindings.init();