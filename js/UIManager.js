import { EventBus } from './EventBus.js';

export class UIManager {
  constructor(app) {
    this.app = app;
    
    // Set up event bus
    this.eventBus = app.eventBus;
    
    // Check for stored theme preference
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
      // Apply dark mode on startup
      document.body.classList.add('dark');
      this.app.isDarkTheme = true;
    }
  }
  
  initiaiseToolUI(toolNames) {
    // Get the tool container
    const toolContainer = document.querySelector('.tools');
    if (!toolContainer) {
      console.error('Tool container not found');
      return;
    }
  
    // Clear existing tools (if any)
    while (toolContainer.firstChild) {
      toolContainer.removeChild(toolContainer.firstChild);
    }
  
    // Define tool configurations with proper icons and tooltips
    const toolConfigs = {
      'select': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clip-rule="evenodd" />
              </svg>`,
        tooltip: 'Select (V)'
      },
      'hand': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v5a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z" />
              </svg>`,
        tooltip: 'Hand (H)'
      },
      'pencil': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>`,
        tooltip: 'Pencil (P)'
      },
      'eraser': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>`,
        tooltip: 'Eraser (E)'
      },
      'rect': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
              </svg>`,
        tooltip: 'Rectangle (R)'
      },
      'ellipse': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
              </svg>`,
        tooltip: 'Ellipse (O)'
      },
      'line': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="5" x2="19" y2="19" />
              </svg>`,
        tooltip: 'Line (L)'
      },
      'arrow': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>`,
        tooltip: 'Arrow (A)'
      },
      'diamond': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 22 12 12 22 2 12" />
              </svg>`,
        tooltip: 'Diamond (D)'
      },
      'text': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd" />
              </svg>`,
        tooltip: 'Text (T)'
      }
    };
  
    // Keyboard shortcuts mapping
    const keyboardShortcuts = {
      'select': 'v',
      'hand': 'h',
      'pencil': 'p',
      'eraser': 'e', 
      'rect': 'r',
      'ellipse': 'o',
      'line': 'l',
      'arrow': 'a',
      'diamond': 'd',
      'text': 't'
    };
  
    this.setupToolKeyboardShortcuts(keyboardShortcuts);
  
    // Create buttons for each available tool
    toolNames.forEach(toolName => {
      // Skip tools that don't have a configuration
      if (!toolConfigs[toolName]) return;
      
      const config = toolConfigs[toolName];
      
      // Create button element
      const button = document.createElement('button');
      button.id = `${toolName}-tool`;
      button.className = 'tool p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700';
      button.setAttribute('data-tool', toolName);
      button.setAttribute('title', config.tooltip);
      button.innerHTML = config.icon;
      
      button.addEventListener('click', () => {
        // Deselect all tools
        document.querySelectorAll('.tool').forEach(tool => {
          tool.classList.remove('bg-blue-100', 'dark:bg-blue-900');
          tool.classList.add('hover:bg-gray-100', 'dark:hover:bg-gray-700');
        });
        
        // Select this tool
        button.classList.add('bg-blue-100', 'dark:bg-blue-900');
        button.classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-700');
        
        // Activate the tool
        this.app.toolManager.selectTool(toolName);
        
        // Set appropriate cursor
        this.setCursorForTool(toolName);
      });
      
      toolContainer.appendChild(button);
    });
  
    // Select the default tool (select)
    const defaultTool = document.querySelector('#select-tool');
    if (defaultTool) {
      defaultTool.classList.add('bg-blue-100', 'dark:bg-blue-900');
      defaultTool.classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-700');
    }
  }

  initiaiseEventListeners() {
    // Tool buttons
    document.querySelectorAll('.tool').forEach(tool => {
      tool.addEventListener('click', () => {
        const toolId = tool.id.replace('-tool', '');
        this.app.toolManager.selectTool(toolId);
        
        // Set appropriate cursor style based on tool
        this.setCursorForTool(toolId);
        
        // Highlight the selected tool
        document.querySelectorAll('.tool').forEach(t => {
          t.classList.remove('bg-blue-100');
        });
        tool.classList.add('bg-blue-100');
      });
    });

    // Menu button
    const menuButton = document.getElementById('menu-button');
    const menuDropdown = document.getElementById('menu-dropdown');
    if (menuButton && menuDropdown) {
      menuButton.addEventListener('click', () => {
        menuDropdown.classList.toggle('hidden');
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.app.toggleTheme());
    }

    // Property controls
    this.initiaisePropertyControls();

    this.initiaiseTextProperties()

    // Help modal
    this.initiaiseHelpModal();

    // Zoom controls
    this.initiaiseZoomControls();

    // Undo/Redo buttons
    this.initiaiseUndoRedoControls();

    // File operations
    this.initiaiseFileOperations();
    
    // Text properties
    this.initiaiseTextProperties();
    
    // Listen for changes from EventBus
    this.setupEventListeners();

    // Ensure all color inputs have valid values
    // const colorInputs = document.querySelectorAll('input[type="color"]');
    // colorInputs.forEach(input => {
    //   input.addEventListener('input', (e) => {
    //     this.handlePropertyChange(input.id.replace('-picker', ''), e.target.value);
    //   });

  // Update existing color pickers for correct initial state
  const colorInputs = document.querySelectorAll('input[type="color"]');
  colorInputs.forEach(input => {
    if (!input.value || input.value === 'undefined') {
      input.value = input.id.includes('stroke') ? '#000000' : '#ffffff';
    }
  });
      
  const themeToggleButton = document.getElementById('theme-toggle');
  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
      this.app.toggleTheme();
    });
    
    // Update button icon based on current theme
    if (this.app.isDarkTheme) {
      themeToggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
        </svg>
      `;
    }
  }


  }
  
  setCursorForTool(toolName) {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;
    
    switch (toolName) {
      case 'pencil':
      case 'rect':
      case 'ellipse':
      case 'line':
      case 'arrow':
      case 'diamond':
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

  initiaisePropertyControls() {
    const propertyManager = this.app.propertyManager;
    
    const strokeColorInput = document.getElementById('stroke-color');
    const fillColorInput = document.getElementById('fill-color');
    const strokeWeightInput = document.getElementById('stroke-weight');
    const opacityInput = document.getElementById('opacity');
    
    if (strokeColorInput) {
      strokeColorInput.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Update property manager
        propertyManager.setProperty('strokeColor', value);
        
        // Also update currently selected shape if any
        if (this.app.selectedShape) {
          this.app.selectedShape.strokeColor = value;
          this.app.historyManager.saveToHistory();
        }
      });
      
      // Set initial value
      strokeColorInput.value = propertyManager.getProperty('strokeColor');
    }
    
    if (fillColorInput) {
      fillColorInput.addEventListener('input', (e) => {
        const value = e.target.value;
        
        propertyManager.setProperty('fillColor', value);
        
        // Also update currently selected shape if any
        if (this.app.selectedShape) {
          this.app.selectedShape.fillColor = value;
          this.app.historyManager.saveToHistory();
        }
      });
      
      // Set initial value
      fillColorInput.value = propertyManager.getProperty('fillColor');
    }
    
    if (strokeWeightInput) {
      strokeWeightInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        
        propertyManager.setProperty('strokeWeight', value);
        
        // Update UI
        const valueDisplay = document.getElementById('stroke-weight-value');
        if (valueDisplay) {
          valueDisplay.textContent = `${value}px`;
        }
        
        // Also update currently selected shape if any
        if (this.app.selectedShape) {
          this.app.selectedShape.strokeWeight = value;
          this.app.historyManager.saveToHistory();
        }
      });
      
      // Set initial value
      strokeWeightInput.value = propertyManager.getProperty('strokeWeight');
      const valueDisplay = document.getElementById('stroke-weight-value');
      if (valueDisplay) {
        valueDisplay.textContent = `${propertyManager.getProperty('strokeWeight')}px`;
      }
    }
    
    if (opacityInput) {
      opacityInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        
        propertyManager.setProperty('opacity', value);
        
        // Update UI
        const valueDisplay = document.getElementById('opacity-value');
        if (valueDisplay) {
          valueDisplay.textContent = `${value}%`;
        }
        
        // Also update currently selected shape if any
        if (this.app.selectedShape) {
          this.app.selectedShape.opacity = value;
          this.app.historyManager.saveToHistory();
        }
      });
      
      // Set initial value
      opacityInput.value = propertyManager.getProperty('opacity');
      const valueDisplay = document.getElementById('opacity-value');
      if (valueDisplay) {
        valueDisplay.textContent = `${propertyManager.getProperty('opacity')}%`;
      }
    }
    
    // Listen for shape selection to update controls
    this.app.eventBus.on('shapeSelected', (shape) => {
      if (shape) {
        // Update property controls based on the selected shape
        if (strokeColorInput && shape.strokeColor) {
          strokeColorInput.value = shape.strokeColor;
        }
        
        if (fillColorInput && shape.fillColor) {
          fillColorInput.value = shape.fillColor;
        }
        
        if (strokeWeightInput && shape.strokeWeight) {
          strokeWeightInput.value = shape.strokeWeight;
          const valueDisplay = document.getElementById('stroke-weight-value');
          if (valueDisplay) {
            valueDisplay.textContent = `${shape.strokeWeight}px`;
          }
        }
        
        if (opacityInput && shape.opacity) {
          opacityInput.value = shape.opacity;
          const valueDisplay = document.getElementById('opacity-value');
          if (valueDisplay) {
            valueDisplay.textContent = `${shape.opacity}%`;
          }
        }
      }
    });
  }
  
  initiaiseHelpModal() {
    const helpButton = document.getElementById('help-button');
    const shortcutsModal = document.getElementById('shortcuts-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModal = document.getElementById('close-modal');

    if (helpButton && shortcutsModal) {
      helpButton.addEventListener('click', () => {
        shortcutsModal.classList.remove('hidden');
      });
    }

    if (closeModal) {
      closeModal.addEventListener('click', () => {
        shortcutsModal.classList.add('hidden');
      });
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => {
        shortcutsModal.classList.add('hidden');
      });
    }
  }
  
  initiaiseZoomControls() {
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');

    if (zoomIn) {
      zoomIn.addEventListener('click', () => {
        const newZoom = Math.min(this.app.zoomLevel * 1.2, 5);
        this.app.setZoomLevel(newZoom);
      });
    }

    if (zoomOut) {
      zoomOut.addEventListener('click', () => {
        const newZoom = Math.max(this.app.zoomLevel / 1.2, 0.1);
        this.app.setZoomLevel(newZoom);
      });
    }
  }
  
  initiaiseUndoRedoControls() {
    const undoButton = document.getElementById('undo-button');
    const redoButton = document.getElementById('redo-button');

    if (undoButton) {
      undoButton.addEventListener('click', () => {
        this.app.historyManager.undo();
      });
    }

    if (redoButton) {
      redoButton.addEventListener('click', () => {
        this.app.historyManager.redo();
      });
    }
  }

  initiaiseFileOperations() {
    // Get references to buttons
    const buttons = document.querySelectorAll('button');
    let saveToButton = null;
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].textContent.includes("Save to...")) {
        saveToButton = buttons[i];
        break;
      }
    }
    // const exportImageButton = document.querySelector('button');
    let exportImageButton = null;
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].textContent.includes("Export image...")) {
        exportImageButton = buttons[i];
        break;
      }
    }
    const shareButton = document.getElementById('share-button');
    
    if (saveToButton) {
      saveToButton.addEventListener('click', () => {
        this.handleSaveTo();
      });
    }
    
    if (exportImageButton) {
      exportImageButton.addEventListener('click', () => {
        this.handleExportImage();
      });
    }
    
    if (shareButton) {
      shareButton.addEventListener('click', () => {
        this.handleShare();
      });
    }
  }

  initiaiseTextProperties() {
    const textProperties = document.getElementById('text-properties');
    if (!textProperties) return;
    
    // Initially hide text properties
    textProperties.style.display = 'none';
    
    // Show text properties when text tool is selected
    this.eventBus.on('toolSelected', (toolName) => {
      if (toolName === 'text') {
        textProperties.style.display = 'block';
      } else {
        textProperties.style.display = 'none';
      }
    });
    
    // Show text properties when a text shape is selected
    this.eventBus.on('shapeSelected', (shape) => {
      if (shape && shape.type === 'text') {
        textProperties.style.display = 'block';
        
        // Update controls to match selected text
        document.getElementById('font-family').value = shape.fontFamily || 'Arial';
        document.getElementById('font-size').value = shape.fontSize || 16;
        
        // Update alignment buttons
        document.querySelectorAll('#text-properties button').forEach(btn => {
          btn.classList.remove('bg-blue-500', 'text-white');
          btn.classList.add('bg-white', 'hover:bg-gray-50');
        });
        
        const alignButton = document.getElementById(`align-${shape.textAlign || 'left'}`);
        if (alignButton) {
          alignButton.classList.remove('bg-white', 'hover:bg-gray-50');
          alignButton.classList.add('bg-blue-500', 'text-white');
        }
      } else if (!this.app.toolManager.getCurrentTool() || 
                 this.app.toolManager.getCurrentTool().constructor.name !== 'TextTool') {
        textProperties.style.display = 'none';
      }
    });
    
    document.getElementById('font-family').addEventListener('change', (e) => {
      if (this.app.selectedShape && this.app.selectedShape.type === 'text') {
        this.app.selectedShape.fontFamily = e.target.value;
        this.app.historyManager.saveToHistory();
      }
    });
    
    document.getElementById('font-size').addEventListener('change', (e) => {
      if (this.app.selectedShape && this.app.selectedShape.type === 'text') {
        this.app.selectedShape.fontSize = parseInt(e.target.value);
        this.app.historyManager.saveToHistory();
      }
    });
    
    // Text alignment buttons
    document.getElementById('align-left').addEventListener('click', () => {
      this.setTextAlignment('left');
    });
    
    document.getElementById('align-center').addEventListener('click', () => {
      this.setTextAlignment('center');
    });
    
    document.getElementById('align-right').addEventListener('click', () => {
      this.setTextAlignment('right');
    });
  }

  setTextAlignment(alignment) {
    // Update selected shape
    if (this.app.selectedShape && this.app.selectedShape.type === 'text') {
      this.app.selectedShape.textAlign = alignment;
      this.app.historyManager.saveToHistory();
    }
    
    // Update UI
    document.querySelectorAll('#text-properties button').forEach(btn => {
      btn.classList.remove('bg-blue-500', 'text-white');
      btn.classList.add('bg-white', 'hover:bg-gray-50');
    });
    
    const button = document.getElementById(`align-${alignment}`);
    if (button) {
      button.classList.remove('bg-white', 'hover:bg-gray-50');
      button.classList.add('bg-blue-500', 'text-white');
    }
  }

  handleSaveTo() {
    // Create a JSON representation of the canvas data
    const saveData = {
      shapes: this.app.shapes,
      version: '1.0'
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(saveData);
    
    // Create a blob
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'drawing.json';
    link.href = URL.createObjectURL(blob);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success toast
    this.showToast('Drawing saved successfully');
  }

  handleExportImage() {
    // Create a clean copy of the canvas for export
    const p5 = this.app.p5Instance;
    if (!p5) {
      this.showToast('Cannot export: Canvas not initiaised', 'error');
      return;
    }
    
    try {
      // Store original canvas dimensions and zoom
      const originalZoom = this.app.zoomLevel;
      
      // Create a new off-screen canvas for exporting
      const exportCanvas = document.createElement('canvas');
      const ctx = exportCanvas.getContext('2d');
      
      // Set the export size to match the current canvas
      exportCanvas.width = p5.width;
      exportCanvas.height = p5.height;
      
      // Set background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      // Draw all shapes without UI elements (no selection boxes, etc.)
      this.app.zoomLevel = 1; // Temporarily reset zoom for proper rendering
      
      // Temporarily switch to the export canvas
      const exportP5 = new p5.Graphics(exportCanvas.width, exportCanvas.height);
      exportP5.background(255);
      
      // Draw all shapes
      for (const shape of this.app.shapes) {
        try {
          this.app.shapeFactory.getRenderer(shape.type).render(exportP5, shape);
        } catch (err) {
          console.error(`Error rendering shape for export:`, err);
        }
      }
      
      // Create image from canvas
      const imgData = exportCanvas.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = imgData;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Restore original zoom
      this.app.zoomLevel = originalZoom;
      
      this.showToast('Image exported successfully');
    } catch (error) {
      console.error('Error exporting image:', error);
      this.showToast('Error exporting image', 'error');
    }
  }

  async handleShare() {
    try {
      // Check if Web Share API is supported
      if (!navigator.share) {
        this.showShareFallback();
        return;
      }
      
      // Export the canvas as a PNG blob
      const canvas = this.app.p5Instance.canvas;
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/png', 0.8);
      });
      
      // Create file for sharing
      const file = new File([blob], 'drawing.png', { type: 'image/png' });
      
      // Share the drawing
      await navigator.share({
        title: 'My Drawing',
        text: 'Check out my drawing created with Draw App',
        files: [file]
      });
      
      this.showToast('Drawing shared successfully');
    } catch (error) {
      console.error('Error sharing:', error);
      
      // If sharing failed (e.g., user canceled), show fallback
      if (error.name !== 'AbortError') {
        this.showShareFallback();
      }
    }
  }

  showShareFallback() {
    // Create modal for manual sharing options
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Share Your Drawing</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Direct sharing not available. Choose an option below:</p>
        
        <div class="space-y-3">
          <button id="share-download" class="w-full py-2 px-4 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            Download Image
          </button>
          
          <button id="share-copy" class="w-full py-2 px-4 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
            Copy to Clipboard
          </button>
        </div>
        
        <div class="mt-5 flex justify-end">
          <button id="share-close" class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle modal events
    document.getElementById('share-download').addEventListener('click', () => {
      this.handleExportImage();
      document.body.removeChild(modal);
    });
    
    document.getElementById('share-copy').addEventListener('click', async () => {
      try {
        const canvas = this.app.p5Instance.canvas;
        const blob = await new Promise(resolve => {
          canvas.toBlob(blob => resolve(blob), 'image/png', 0.8);
        });
        
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        
        this.showToast('Image copied to clipboard');
      } catch (err) {
        console.error('Failed to copy image:', err);
        this.showToast('Failed to copy image', 'error');
      }
      document.body.removeChild(modal);
    });
    
    document.getElementById('share-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }

  showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    } transition-opacity duration-300`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
  
  setupEventListeners() {
    this.eventBus.on('zoomChanged', (zoomLevel) => {
      const zoomLevelElement = document.getElementById('zoom-level');
      if (zoomLevelElement) {
        zoomLevelElement.textContent = `${Math.round(zoomLevel * 100)}%`;
      }
    });
    
    this.eventBus.on('historyChanged', ({ canUndo, canRedo }) => {
      const undoButton = document.getElementById('undo-button');
      const redoButton = document.getElementById('redo-button');
      
      if (undoButton) undoButton.disabled = !canUndo;
      if (redoButton) redoButton.disabled = !canRedo;
    });
    
    this.eventBus.on('shapeSelected', (shape) => {
      this.updatePropertiesPanel(shape);
    });
  }
  
  updatePropertiesPanel(shape) {
    if (!shape) return;
    
    const strokeColor = document.getElementById('stroke-color');
    const fillColor = document.getElementById('fill-color');
    const strokeWeight = document.getElementById('stroke-weight');
    const strokeWeightValue = document.getElementById('stroke-weight-value');
    const opacity = document.getElementById('opacity');
    const opacityValue = document.getElementById('opacity-value');
    
    // Update property controls to reflect the selected shape - with safe checks
    if (strokeColor && shape.strokeColor) {
      strokeColor.value = shape.strokeColor;
    }
    
    if (fillColor && shape.fillColor) {
      fillColor.value = shape.fillColor;
    }
    
    if (strokeWeight) {
      const weight = shape.strokeWeight !== undefined ? shape.strokeWeight : 1;
      strokeWeight.value = weight;
      if (strokeWeightValue) {
        strokeWeightValue.textContent = `${weight}px`;
      }
    }
    
    if (opacity) {
      const opacityVal = shape.opacity !== undefined ? shape.opacity : 100;
      opacity.value = opacityVal;
      if (opacityValue) {
        opacityValue.textContent = `${opacityVal}%`;
      }
    }
    
    // Update text properties if text is selected
    const textProperties = document.getElementById('text-properties');
    if (textProperties) {
      if (shape.type === 'text') {
        const fontFamily = document.getElementById('font-family');
        const fontSize = document.getElementById('font-size');
        
        if (fontFamily) {
          fontFamily.value = shape.fontFamily || this.app.propertyManager.getProperties().fontFamily || 'Arial';
        }
        
        if (fontSize) {
          fontSize.value = shape.fontSize || this.app.propertyManager.getProperties().fontSize || 16;
        }
        
        textProperties.style.display = 'block';
      } else {
        textProperties.style.display = 'none';
      }
    }
  }

  handlePropertyChange(property, value) {
    const props = {};
    
    // Special handling for different property types
    switch (property) {
      case 'strokeColor':
      case 'fillColor':
        // Ensure color values are valid hex
        if (!value || value === 'undefined') {
          value = property === 'strokeColor' ? '#000000' : '#ffffff';
        }
        props[property] = value;
        
        // Update color picker UI if exists
        const colorPicker = document.getElementById(`${property}-picker`);
        if (colorPicker) colorPicker.value = value;
        break;
        
      case 'strokeWeight':
        // Ensure stroke weight is a positive number
        value = parseFloat(value);
        if (isNaN(value) || value < 0) value = 1;
        props[property] = value;
        
        // Update stroke weight UI if exists
        const strokeInput = document.getElementById('stroke-weight-input');
        if (strokeInput) strokeInput.value = value;
        break;
        
      case 'opacity':
        // Ensure opacity is 0-100
        value = parseInt(value);
        if (isNaN(value)) value = 100;
        if (value < 0) value = 0;
        if (value > 100) value = 100;
        props[property] = value;
        
        // Update opacity UI if exists
        const opacityInput = document.getElementById('opacity-input');
        if (opacityInput) opacityInput.value = value;
        break;
        
      default:
        props[property] = value;
    }
    
    // Update property manager with validated values
    this.app.propertyManager.setProperties(props);
    
    // If a shape is selected, update its properties too
    if (this.app.selectedShape) {
      for (const prop in props) {
        this.app.selectedShape[prop] = props[prop];
      }
      // Save to history after changing properties
      this.app.historyManager.saveToHistory();
    }
  }
}