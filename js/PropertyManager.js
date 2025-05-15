export class PropertyManager {
  static instance = null;
  
  constructor() {
    if (PropertyManager.instance) {
      return PropertyManager.instance;
    }
    
    this.properties = {
      strokeColor: '#000000',
      fillColor: '#ffffff',
      strokeWeight: 2,
      opacity: 100,
      fontSize: 16,
      fontFamily: 'Arial',
      textAlign: 'left'
    };
    
    // Event listeners
    this.listeners = {
      propertyChanged: []
    };
    
    PropertyManager.instance = this;
  }
  
  static getInstance() {
    if (!PropertyManager.instance) {
      PropertyManager.instance = new PropertyManager();
    }
    return PropertyManager.instance;
  }
  
  getProperties() {
    return { ...this.properties };
  }
  
  getProperty(name) {
    return this.properties[name];
  }
  
  setProperty(name, value) {
    if (this.properties[name] !== value) {
      this.properties[name] = value;
      this.notifyListeners('propertyChanged', { name, value });
    }
  }
  
  setProperties(props) {
    let changed = false;
    
    for (const [key, value] of Object.entries(props)) {
      if (this.properties[key] !== value) {
        this.properties[key] = value;
        changed = true;
      }
    }
    
    if (changed) {
      this.notifyListeners('propertyChanged', props);
    }
  }
  
  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    
    this.listeners[eventName].push(callback);
  }
  
  off(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(
        cb => cb !== callback
      );
    }
  }
  
  notifyListeners(eventName, data) {
    if (this.listeners[eventName]) {
      for (const callback of this.listeners[eventName]) {
        callback(data);
      }
    }
  }
}