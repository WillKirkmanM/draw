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
    
    this.lastSelectedShape = null;
    this.ignoreNextDeselect = false;
    
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
    
    this.initCollaboration();
    this.initCollaborationUI();
    
    console.log('Drawing application initiaised with tools:', Object.keys(this.toolManager.tools).join(', '));
  }
  /**
   * Adds a shape to the canvas
   * @param {Object} shapeData - The shape data to add
   */
  addShape(shapeData) {
      let shape;
      
      switch (shapeData.type) {
          case 'rect':
              shape = {
                  type: 'rect',
                  x: shapeData.x,
                  y: shapeData.y,
                  width: shapeData.width,
                  height: shapeData.height,
                  strokeColor: shapeData.strokeColor || '#000000',
                  fillColor: shapeData.fillColor || '#ffffff',
                  strokeWeight: shapeData.strokeWeight || 2,
                  opacity: shapeData.opacity !== undefined ? shapeData.opacity : 1
              };
              break;
              
          case 'ellipse':
              shape = {
                  type: 'ellipse',
                  x: shapeData.x,
                  y: shapeData.y,
                  width: shapeData.width,
                  height: shapeData.height,
                  strokeColor: shapeData.strokeColor || '#000000',
                  fillColor: shapeData.fillColor || '#ffffff',
                  strokeWeight: shapeData.strokeWeight || 2,
                  opacity: shapeData.opacity !== undefined ? shapeData.opacity : 1
              };
              break;
              
          case 'diamond':
              shape = {
                  type: 'diamond',
                  x: shapeData.x,
                  y: shapeData.y,
                  width: shapeData.width,
                  height: shapeData.height,
                  strokeColor: shapeData.strokeColor || '#000000',
                  fillColor: shapeData.fillColor || '#ffffff',
                  strokeWeight: shapeData.strokeWeight || 2,
                  opacity: shapeData.opacity !== undefined ? shapeData.opacity : 1
              };
              break;
              
          case 'arrow':
              shape = {
                  type: 'arrow',
                  x1: shapeData.x1,
                  y1: shapeData.y1,
                  x2: shapeData.x2,
                  y2: shapeData.y2,
                  strokeColor: shapeData.strokeColor || '#000000',
                  strokeWeight: shapeData.strokeWeight || 2,
                  opacity: shapeData.opacity !== undefined ? shapeData.opacity : 1
              };
              break;
              
          case 'line':
              shape = {
                  type: 'line',
                  x1: shapeData.x1,
                  y1: shapeData.y1,
                  x2: shapeData.x2,
                  y2: shapeData.y2,
                  strokeColor: shapeData.strokeColor || '#000000',
                  strokeWeight: shapeData.strokeWeight || 2,
                  opacity: shapeData.opacity !== undefined ? shapeData.opacity : 1
              };
              break;
              
          case 'text':
              shape = {
                  type: 'text',
                  text: shapeData.text || 'Text',
                  x: shapeData.x,
                  y: shapeData.y,
                  fontSize: shapeData.fontSize || 16,
                  fontFamily: shapeData.fontFamily || 'Arial',
                  strokeColor: shapeData.strokeColor || '#000000',
                  fillColor: shapeData.fillColor || '#000000',
                  opacity: shapeData.opacity !== undefined ? shapeData.opacity : 1
              };
              break;
              
          default:
              console.warn('Unknown shape type:', shapeData.type);
              return;
      }
      
      // Add the shape to your shapes array
      this.shapes.push(shape);
      
      // Update the display
      this.redraw();
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

    // Select tool
    document.getElementById('select-tool').addEventListener('click', () => {
      this.toolManager.setTool('select');
    });

    // Keyboard shortcut for select tool (V or 1)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'v' || e.key === 'V' || e.key === '1') {
        this.toolManager.setTool('select');
      }
    });

    // Delete Selected button
    document.getElementById('delete-selected').addEventListener('click', () => {
      this.deleteSelectedShape();
    });
    
    // Clear Canvas button
    document.getElementById('clear-canvas').addEventListener('click', () => {
      this.clearCanvas();
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
    // Skip if canvas or p5Instance isn't available yet
    if (!this.p5Instance || !this.canvas) {
      console.warn('Canvas or p5Instance not available for redraw');
      return;
    }
      
    // Use p5's background method instead of ctx.fillStyle and clearRect
    if (document.body.classList.contains('dark')) {
      this.p5Instance.background(30, 30, 30); // Dark gray background in RGB
    } else {
      this.p5Instance.background(255); // White background
    }
      
    // Draw all shapes using the p5 instance
    this.shapes.forEach(shape => {
      if (shape && typeof shape.render === 'function') {
        shape.render(this.p5Instance);
      } else if (shape && shape.type) {
        // Use the shape factory if the shape doesn't have its own render method
        this.shapeFactory.getRenderer(shape.type).render(this.p5Instance, shape);
      }
    });
      
    // Draw current shape being created
    if (this.currentShape) {
      if (typeof this.currentShape.render === 'function') {
        this.currentShape.render(this.p5Instance);
      } else if (this.currentShape.type) {
        this.shapeFactory.getRenderer(this.currentShape.type).render(this.p5Instance, this.currentShape);
      }
    }
      
    // Draw selection UI from the current tool if applicable
    const currentTool = this.toolManager.getCurrentTool();
    if (currentTool && typeof currentTool.render === 'function') {
      currentTool.render(this.p5Instance);
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
    const preventDeselect = (e) => {
      e.stopPropagation();
      this.ignoreNextDeselect = true;
      
      // Restore selection if it was lost
      if (!this.selectedShape && this.lastSelectedShape) {
        this.selectedShape = this.lastSelectedShape;
      }
    };
    
    // Apply preventDeselect to all property controls
    const propertyControls = [
      'stroke-color', 
      'fill-color', 
      'stroke-weight', 
      'opacity', 
      'font-family', 
      'font-size',
      'align-left',
      'align-center',
      'align-right'
    ];
    
    propertyControls.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('mousedown', preventDeselect);
        element.addEventListener('click', preventDeselect);
      }
    });
    
    // Also apply it to the property panel container
    const propertiesPanel = document.querySelector('.bg-white.rounded-lg.shadow-lg.p-4.flex.flex-col.gap-4');
    if (propertiesPanel) {
      propertiesPanel.addEventListener('mousedown', preventDeselect);
    }
  
    // Stroke color
    document.getElementById('stroke-color').addEventListener('input', (e) => {
      preventDeselect(e); // Ensure we don't lose selection
      this.strokeColor = e.target.value;
      
      // If a shape is selected, update its stroke color
      if (this.selectedShape) {
        this.selectedShape.strokeColor = e.target.value;
        this.lastSelectedShape = this.selectedShape; // Save the reference
        this.redraw();
      }
    });
    
    // Fill color
    document.getElementById('fill-color').addEventListener('input', (e) => {
      preventDeselect(e); // Ensure we don't lose selection
      this.fillColor = e.target.value;
      
      // If a shape is selected, update its fill color
      if (this.selectedShape) {
        this.selectedShape.fillColor = e.target.value;
        this.lastSelectedShape = this.selectedShape; // Save the reference
        this.redraw();
      }
    });
    
    // Stroke weight
    document.getElementById('stroke-weight').addEventListener('input', (e) => {
      preventDeselect(e); // Ensure we don't lose selection
      const weight = parseInt(e.target.value);
      this.strokeWeight = weight;
      document.getElementById('stroke-weight-value').textContent = `${weight}px`;
      
      // If a shape is selected, update its stroke weight
      if (this.selectedShape) {
        this.selectedShape.strokeWeight = weight;
        this.lastSelectedShape = this.selectedShape; // Save the reference
        this.redraw();
      }
    });
    
    // Opacity
    document.getElementById('opacity').addEventListener('input', (e) => {
      preventDeselect(e); // Ensure we don't lose selection
      const opacity = parseInt(e.target.value);
      this.opacity = opacity;
      document.getElementById('opacity-value').textContent = `${opacity}%`;
      
      // If a shape is selected, update its opacity
      if (this.selectedShape) {
        this.selectedShape.opacity = opacity / 100; // Convert to 0-1 range
        this.lastSelectedShape = this.selectedShape; // Save the reference
        this.redraw();
      }
    });
    
    // Font family
    document.getElementById('font-family').addEventListener('change', (e) => {
      preventDeselect(e); // Ensure we don't lose selection
      if (this.selectedShape && this.selectedShape.type === 'text') {
        this.selectedShape.fontFamily = e.target.value;
        this.lastSelectedShape = this.selectedShape; // Save the reference
        this.redraw();
      }
    });
    
    // Font size
    document.getElementById('font-size').addEventListener('input', (e) => {
      preventDeselect(e); // Ensure we don't lose selection
      if (this.selectedShape && this.selectedShape.type === 'text') {
        this.selectedShape.fontSize = parseInt(e.target.value);
        this.lastSelectedShape = this.selectedShape; // Save the reference
        this.redraw();
      }
    });
    
    // Text alignment buttons
    document.getElementById('align-left').addEventListener('click', (e) => {
      preventDeselect(e); // Ensure we don't lose selection
      if (this.selectedShape && this.selectedShape.type === 'text') {
        this.selectedShape.textAlign = 'left';
        this.lastSelectedShape = this.selectedShape; // Save the reference
        this.redraw();
      }
    });
    
    document.getElementById('align-center').addEventListener('click', (e) => {
      preventDeselect(e); // Ensure we don't lose selection
      if (this.selectedShape && this.selectedShape.type === 'text') {
        this.selectedShape.textAlign = 'center';
        this.lastSelectedShape = this.selectedShape; // Save the reference
        this.redraw();
      }
    });
    
    document.getElementById('align-right').addEventListener('click', (e) => {
      preventDeselect(e); // Ensure we don't lose selection
      if (this.selectedShape && this.selectedShape.type === 'text') {
        this.selectedShape.textAlign = 'right';
        this.lastSelectedShape = this.selectedShape; // Save the reference
        this.redraw();
      }
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

  /**
   * Deletes the currently selected shape
   */
  deleteSelectedShape() {
    if (this.selectedShape) {
      // Find the index of the selected shape in the shapes array
      const index = this.shapes.indexOf(this.selectedShape);
      if (index !== -1) {
        // Remove the shape from the array
        this.shapes.splice(index, 1);
        
        // Clear the selection references
        this.selectedShape = null;
        this.lastSelectedShape = null;
        
        // Save to history
        this.historyManager?.saveToHistory();
        
        // Redraw the canvas
        this.redraw();
      }
    }
  }

  /**
   * Clears all shapes from the canvas
   */
  clearCanvas() {
    // Show a confirmation dialog
    if (this.shapes.length > 0 && confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      // Clear the shapes array
      this.shapes = [];
      
      // Clear selection references
      this.selectedShape = null;
      this.lastSelectedShape = null;
      
      // Save to history
      this.historyManager?.saveToHistory();
      
      // Redraw the canvas
      this.redraw();
    }
  }
}