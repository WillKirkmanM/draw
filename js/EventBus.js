export class EventBus {
  static instance = null;
  
  constructor() {
    this.listeners = {};
  }
  
  static getInstance() {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  on(event, callback) {
    if (!event || typeof callback !== 'function') {
      console.warn('Invalid event listener registration:', event, callback);
      return;
    }
    
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  off(event, callback) {
    if (!this.listeners[event]) return;
    
    if (callback) {
      this.listeners[event] = this.listeners[event].filter(
        listener => listener !== callback
      );
    } else {
      // If no callback provided, remove all listeners for this event
      delete this.listeners[event];
    }
  }
  
  emit(event, data) {
    if (!this.listeners[event]) return;
    
    try {
      this.listeners[event].forEach(callback => callback(data));
    } catch (err) {
      console.error(`Error in event listener for "${event}":`, err);
    }
  }
}

// Make EventBus globally available to help with debugging
if (typeof window !== 'undefined') {
  window.EventBus = EventBus;
}