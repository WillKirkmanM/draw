import { EventBus } from './EventBus.js';

export class HistoryManager {
  constructor(app) {
    this.app = app;
    this.history = []; // Stack of past states
    this.redoStack = []; // Stack for redo operations
    this.maxHistoryLength = 50;
    this.currentState = null;
    this.isSaving = false;
    this.eventBus = EventBus.getInstance();
  }

  saveToHistory() {
    if (this.isSaving) return; // Prevent recursive saves
    this.isSaving = true;
    
    // Create a deep copy of the current shapes array
    const currentState = JSON.stringify(this.app.shapes);
    
    // Only save if state changed
    if (currentState !== this.currentState) {
      this.history.push(currentState);
      this.redoStack = []; // Clear redo stack on new action
      this.currentState = currentState;
      
      // Keep history within limit
      if (this.history.length > this.maxHistoryLength) {
        this.history.shift();
      }
      
      // Emit history event for UI updates
      this.eventBus.emit('historyChanged', { 
        canUndo: this.canUndo(), 
        canRedo: this.canRedo() 
      });
    }
    
    this.isSaving = false;
  }

  undo() {
    if (!this.canUndo()) return;
    
    // Save current state to redo stack
    const currentState = JSON.stringify(this.app.shapes);
    this.redoStack.push(currentState);
    
    // Pop previous state from history
    this.history.pop();
    
    // Apply previous state if available
    if (this.history.length > 0) {
      const previousState = this.history[this.history.length - 1];
      this.app.shapes = JSON.parse(previousState);
      this.currentState = previousState;
    } else {
      // If no more history, clear the canvas
      this.app.shapes = [];
      this.currentState = null;
    }
    
    // Emit history event for UI updates
    this.eventBus.emit('historyChanged', { 
      canUndo: this.canUndo(), 
      canRedo: this.canRedo() 
    });
  }

  redo() {
    if (!this.canRedo()) return;
    
    // Get next state from redo stack
    const nextState = this.redoStack.pop();
    
    // Save current state to history
    const currentState = JSON.stringify(this.app.shapes);
    this.history.push(currentState);
    
    // Apply next state
    this.app.shapes = JSON.parse(nextState);
    this.currentState = nextState;
    
    // Emit history event for UI updates
    this.eventBus.emit('historyChanged', { 
      canUndo: this.canUndo(), 
      canRedo: this.canRedo() 
    });
  }

  canUndo() {
    return this.history.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  clearHistory() {
    this.history = [];
    this.redoStack = [];
    this.currentState = null;
    
    // Emit history event for UI updates
    this.eventBus.emit('historyChanged', { 
      canUndo: false, 
      canRedo: false 
    });
  }
}