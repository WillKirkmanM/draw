import { EventBus } from './EventBus.js';
import { HistoryManager } from './HistoryManager.js';
import { ToolManager } from './ToolManager.js';
import { UIManager } from './UIManager.js';
import { PropertyManager } from './PropertyManager.js';
import { ShapeFactory } from './ShapeFactory.js';
import { SelectTool } from './tools/SelectTool.js';
import { RectTool } from './tools/RectTool.js';
import { CollaborationManager } from './collaboration/CollaborationManager.js';

// Singleton pattern
export class DrawingApp {
  static instance = null;
  
  constructor() {
    if (DrawingApp.instance) {
      return DrawingApp.instance;
    }
    
    this.canvas = null;
    this.p5Instance = null;
    this.shapes = [];
    this.selectedShape = null;
    this.currentShape = null;
    this.isDrawing = false;
    this.zoomLevel = 1;
    this.strokeColor = '#000000';
    this.fillColor = '#ffffff';
    this.strokeWeight = 4;
    this.opacity = 100;
    this.currentTool = 'select';
    this.isDarkTheme = false;
    this.loadedImages = {};
    
    this.canvasOffsetX = 0;
    this.canvasOffsetY = 0;
    
    this.eventBus = EventBus.getInstance();
    this.historyManager = new HistoryManager(this);
    this.toolManager = new ToolManager(this);
    this.uiManager = new UIManager(this);
    this.propertyManager = PropertyManager.getInstance();
    this.shapeFactory = ShapeFactory.getInstance();
    this.collaborationManager = new CollaborationManager(this);
    
    this.setupTools();
    
    DrawingApp.instance = this;
  }
  
  static getInstance() {
    if (!DrawingApp.instance) {
      DrawingApp.instance = new DrawingApp();
    }
    return DrawingApp.instance;
  }
  
  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.setupPropertyListeners();
    this.uiManager.initiaiseEventListeners();
    
    // Make sure ToolManager is initiaised with all tools
    this.toolManager.setupTools();
    
    // Initiaise UI elements for all available tools
    this.uiManager.initiaiseToolUI(Object.keys(this.toolManager.tools));
    
    // Select the default tool
    this.toolManager.selectTool('select');
    
    this.uiManager.initiaiseFileOperations();
    this.setupP5();
    
    // Initiaise theme based on user preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      this.toggleTheme();
    }
    
    this.initCollaboration();
    this.initCollaborationUI();
    
    console.log('Drawing application initiaised with tools:', Object.keys(this.toolManager.tools).join(', '));
  }


  
  setupToolKeyboardShortcuts(shortcuts) {
    // Remove previous listener to avoid duplicates
    document.removeEventListener('keydown', this._keydownHandler);
    
    this._keydownHandler = (e) => {
      // Skip if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Skip if modifier keys are pressed
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }
      
      const key = e.key.toLowerCase();
      
      // Find the tool for this key
      const toolName = Object.keys(shortcuts).find(tool => shortcuts[tool] === key);
      
      if (toolName) {
        e.preventDefault();
        
        // Select the tool
        this.app.toolManager.selectTool(toolName);
        
        // Update UI
        document.querySelectorAll('.tool').forEach(btn => {
          btn.classList.remove('bg-blue-100', 'dark:bg-blue-900');
          btn.classList.add('hover:bg-gray-100', 'dark:hover:bg-gray-700');
        });
        
        const toolButton = document.querySelector(`#${toolName}-tool`);
        if (toolButton) {
          toolButton.classList.add('bg-blue-100', 'dark:bg-blue-900');
          toolButton.classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-700');
        }
        
        // Set appropriate cursor
        this.setCursorForTool(toolName);
      }
    };
    
    document.addEventListener('keydown', this._keydownHandler);
  }
  
  // Update cursor method to support all tools
  setCursorForTool(toolName) {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;
    
    switch (toolName) {
      case 'pencil':
      case 'rect':
      case 'ellipse':
      case 'diamond':
      case 'line':
      case 'arrow':
      case 'text':
        canvasContainer.style.cursor = 'crosshair';
        break;
      case 'hand':
        canvasContainer.style.cursor = 'grab';
        break;
      case 'eraser':
        canvasContainer.style.cursor = 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="black" stroke-width="2" d="M14,4 L20,10 L10,20 L4,14 L14,4 Z M4.5,13.5 L10.5,19.5"/></svg>\') 10 10, auto';
        break;
      case 'select':
        canvasContainer.style.cursor = 'default';
        break;
      default:
        canvasContainer.style.cursor = 'default';
        break;
    }
  }
  
  setupCanvas() {
    const sketch = (p) => {
      p.setup = () => {
        const canvasContainer = document.getElementById('canvas-container');
        if (!canvasContainer) {
          console.error("Canvas container not found!");
          return;
        }
        this.canvas = p.createCanvas(
          canvasContainer.offsetWidth || 800,
          canvasContainer.offsetHeight || 600
        );
        this.canvas.parent('canvas-container');
      };
      
      p.draw = () => {
        p.background(255);
        this.draw(p);
      };
      
      p.mousePressed = () => {
        this.mousePressed(p);
      };
      
      p.mouseDragged = () => {
        this.mouseDragged(p);
      };
      
      p.mouseReleased = () => {
        this.mouseReleased(p);
      };
      
      p.windowResized = () => {
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) {
          p.resizeCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
        }
      };
      
      this.p5Instance = p;
    };
    
    new p5(sketch);
  }
  
  // Update setupTools method
  setupTools() {
    // Get existing tools from ToolManager
    this.tools = this.toolManager.tools;
    
    if (!this.tools['select']) {
      this.tools['select'] = new SelectTool(this);
    }
    
    if (!this.tools['rect']) {
      this.tools['rect'] = new RectTool(this);
    }
    
    // Initiaise current tool
    this.currentTool = this.tools['select'];
  }

  setupEventListeners() {
    // Set up keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedShape) {
          this.removeShape(this.selectedShape);
          this.selectedShape = null;
        }
      }
    });
  }
  
  // Update the draw method to handle offsets
  draw(p) {
    p.push();
    // Scale first
    p.scale(this.zoomLevel);
    
    // Then apply canvas offset for panning
    // Note: We divide by zoomLevel because the scaling is already applied
    // and we need the offset in unscaled coordinates
    p.translate(this.canvasOffsetX / this.zoomLevel, this.canvasOffsetY / this.zoomLevel);
    
    // Draw all shapes
    for (const shape of this.shapes) {
      this.shapeFactory.getRenderer(shape.type).render(p, shape);
    }
    
    // Draw current shape being created
    if (this.isDrawing && this.currentShape) {
      this.shapeFactory.getRenderer(this.currentShape.type).render(p, this.currentShape);
    }
    
    // Highlight selected shape
    if (this.selectedShape) {
      this.shapeFactory.getRenderer(this.selectedShape.type).renderSelection(p, this.selectedShape);
    }
    
    p.pop();
  }
  
  redraw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw all shapes
    this.shapes.forEach(shape => {
      shape.render(this.ctx);
    });
    
    // Draw current shape being created
    if (this.currentShape) {
      this.currentShape.render(this.ctx);
    }
    
    // Draw selection UI from the current tool if applicable
    const currentTool = this.toolManager.getCurrentTool();
    if (currentTool && typeof currentTool.render === 'function') {
      currentTool.render(this.ctx);
    }
  }
  
  mousePressed(p) {
    if (!this.isMouseInCanvas(p)) return;
    
    const coords = this.getScaledMouseCoordinates(p);
    const currentTool = this.toolManager.getCurrentTool();
    
    if (currentTool && typeof currentTool.onMouseDown === 'function') {
      currentTool.onMouseDown(coords.x, coords.y);
    } else {
      console.warn('No valid tool found for mouse down event');
    }
  }
  
  mouseDragged(p) {
    if (!this.isMouseInCanvas(p)) return;
    
    const coords = this.getScaledMouseCoordinates(p);
    const currentTool = this.toolManager.getCurrentTool();
    
    if (currentTool && typeof currentTool.onMouseDrag === 'function') {
      currentTool.onMouseDrag(coords.x, coords.y);
    } else {
      console.warn('No valid tool found for mouse drag event');
    }
  }
  
  mouseReleased(p) {
    const coords = this.getScaledMouseCoordinates(p);
    const currentTool = this.toolManager.getCurrentTool();
    
    if (currentTool && typeof currentTool.onMouseUp === 'function') {
      currentTool.onMouseUp(coords.x, coords.y);
    } else {
      console.warn('No valid tool found for mouse up event');
    }
  }
  
  isMouseInCanvas(p) {
    return p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
  }
  
  // Update this method to handle the canvas offset
  getScaledMouseCoordinates(p) {
    const x = p.mouseX / this.zoomLevel - this.canvasOffsetX / this.zoomLevel;
    const y = p.mouseY / this.zoomLevel - this.canvasOffsetY / this.zoomLevel;
    return { x, y };
  }
  
  addShape(shape) {
    this.shapes.push(shape);
    this.historyManager.saveToHistory();
  }
  
  removeShape(shape) {
    const index = this.shapes.indexOf(shape);
    if (index > -1) {
      this.shapes.splice(index, 1);
      this.historyManager.saveToHistory();
    }
  }
  
  setZoomLevel(level) {
    this.zoomLevel = level;
    this.eventBus.emit('zoomChanged', level);
  }
  
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    document.body.classList.toggle('dark', this.isDarkTheme);
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', this.isDarkTheme);
    
    // Update UI elements for dark mode
    if (this.isDarkTheme) {
      document.getElementById('theme-toggle').innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
        </svg>
      `;
    } else {
      document.getElementById('theme-toggle').innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      `;
    }
    
    this.eventBus.emit('themeChanged', this.isDarkTheme);
  }

  loadImage(src, callback) {
    const img = new Image();
    img.onload = () => {
      this.loadedImages[src] = img;
      if (callback) callback(img);
    };
    img.src = src;
  }

  setupP5() {
    console.log("Setting up p5.js extensions");
  }

  setupPropertyListeners() {
    // Listen for color changes
    document.getElementById('stroke-color').addEventListener('input', (e) => {
      this.strokeColor = e.target.value;
    });
    
    document.getElementById('fill-color').addEventListener('input', (e) => {
      this.fillColor = e.target.value;
    });
    
    document.getElementById('stroke-weight').addEventListener('input', (e) => {
      this.strokeWeight = parseInt(e.target.value);
      document.getElementById('stroke-weight-value').textContent = `${this.strokeWeight}px`;
    });
    
    document.getElementById('opacity').addEventListener('input', (e) => {
      this.opacity = parseInt(e.target.value);
      document.getElementById('opacity-value').textContent = `${this.opacity}%`;
    });
  }

  initCollaborationUI() {
    const toolbar = document.querySelector('.toolbar') || document.body;
    
    const shareButton = document.createElement('button');
    shareButton.className = 'share-button';
    shareButton.innerHTML = '<i class="fas fa-share-alt"></i> Share';
    shareButton.onclick = () => this.showShareDialog();
    
    toolbar.appendChild(shareButton);
  }

  showShareDialog() {
    // Create a modal for sharing options
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
      <div class="share-modal-content">
        <h2>Share Your Drawing</h2>
        <p>Create a room to collaborate with others in real-time.</p>
        <div class="share-buttons">
          <button id="create-room-btn">Create Room</button>
          <button id="copy-link-btn" disabled>Copy Link</button>
        </div>
        <div class="share-link-container" style="display: none;">
          <input type="text" id="share-link" readonly>
        </div>
        <button class="close-btn">&times;</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup event handlers
    document.getElementById('create-room-btn').onclick = () => {
      this.collaborationManager.createRoom();
      document.getElementById('copy-link-btn').disabled = false;
      
      const shareLinkContainer = document.querySelector('.share-link-container');
      shareLinkContainer.style.display = 'block';
      
      const shareLink = document.getElementById('share-link');
      shareLink.value = this.collaborationManager.getShareableLink() || 'Creating link...';
    };
    
    document.getElementById('copy-link-btn').onclick = () => {
      this.collaborationManager.copyShareableLinkToClipboard();
    };
    
    document.querySelector('.close-btn').onclick = () => {
      document.body.removeChild(modal);
    };
  }

  getShapesAsJSON() {
    return this.shapes.map(shape => {
      return {
        id: shape.id,
        type: shape.type,
        ...shape
      };
    });
  }

  loadShapesFromJSON(shapesData) {
    // Clear current shapes
    this.shapes = [];
    
    shapesData.forEach(shapeData => {
      this.addShapeFromJSON(shapeData);
    });
    
    // Redraw canvas
    this.redraw();
  }

  addShapeFromJSON(shapeData) {
    // Create appropriate shape object based on type
    let newShape;
    switch(shapeData.type) {
      case 'rectangle':
        // Create rectangle with properties
        // newShape = new RectangleShape(...);
        break;
      case 'circle':
        // Similar for other shape types
        break;
      // Handle all shape types
    }
    
    if (newShape) {
      this.shapes.push(newShape);
      this.redraw();
    }
  }

  updateShapeFromJSON(shapeData) {
    const index = this.shapes.findIndex(s => s.id === shapeData.id);
    if (index >= 0) {
      // Update shape properties
      Object.assign(this.shapes[index], shapeData);
      this.redraw();
    }
  }

  initMouseTracking() {
    document.addEventListener('mousemove', (e) => {
      if (this.collaborationManager.connected) {
        // Only send occasionally to avoid overloading
        if (Date.now() - this.lastCursorUpdate > 100) {
          this.collaborationManager.updateCursorPosition(e.clientX, e.clientY);
          this.lastCursorUpdate = Date.now();
        }
      }
    });
  }

  initCollaboration() {
    this.collaborationManager.connect();
    this.initMouseTracking();
  }
}