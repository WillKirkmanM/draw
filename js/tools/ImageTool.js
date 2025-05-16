import { Tool } from './Tool.js';

export class ImageTool extends Tool {
  constructor(app) {
    super(app, 'image');
    this.isSelecting = false;
    this.selectedShape = null;
    this.dragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.lastClickTime = 0;
    this.fileInput = null;
    this.createFileInput();
  }

  createFileInput() {
    // Create a hidden file input for image uploads
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = 'image/*';
    this.fileInput.style.display = 'none';
    document.body.appendChild(this.fileInput);
    
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleImageUpload(e.target.files[0]);
      }
    });
  }

  handleImageUpload(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Create an image shape
        const imageShape = {
          type: 'image',
          x: this.app.p5Instance.width / 2 - img.width / 2,
          y: this.app.p5Instance.height / 2 - img.height / 2,
          width: img.width,
          height: img.height,
          src: e.target.result,
          opacity: this.app.opacity / 100
        };
        
        this.app.loadImage(e.target.result, () => {
          this.app.addShape(imageShape);
          // Select the newly added image
          this.app.selectedShape = imageShape;
          this.app.redraw();
        });
      };
      
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  }

  onMouseDown(x, y) {
    super.onMouseDown(x, y);
    
    const now = Date.now();
    if (now - this.lastClickTime < 300) {
      // Double click - open file dialog
      this.fileInput.click();
      return;
    }
    this.lastClickTime = now;
    
    // First, try to select a shape
    const shape = this.findShapeAt(x, y);
    
    // Deselect previous selection if clicking outside any shape
    if (this.app.selectedShape && !shape) {
      this.deselectShape();
      return;
    }
    
    if (shape) {
      // Select the shape
      this.selectShape(shape);
      
      // Set up for dragging
      this.dragging = true;
      this.dragOffsetX = x - shape.x;
      this.dragOffsetY = y - shape.y;
    }
  }

  onMouseDrag(x, y) {
    super.onMouseDrag(x, y);
    
    if (this.dragging && this.app.selectedShape) {
      // Move the shape
      this.app.selectedShape.x = x - this.dragOffsetX;
      this.app.selectedShape.y = y - this.dragOffsetY;
      this.app.redraw();
    }
  }

  onMouseUp(x, y) {
    super.onMouseUp(x, y);
    
    if (this.dragging) {
      this.dragging = false;
      this.app.historyManager.saveToHistory();
    }
  }

  findShapeAt(x, y) {
    // Check shapes in reverse order (top to bottom in z-index)
    for (let i = this.app.shapes.length - 1; i >= 0; i--) {
      const shape = this.app.shapes[i];
      
      // Simple rectangular hit testing
      if (shape.x <= x && x <= shape.x + shape.width &&
          shape.y <= y && y <= shape.y + shape.height) {
        return shape;
      }
    }
    
    return null;
  }

  selectShape(shape) {
    // Deselect previous selection first
    this.deselectShape();
    
    // Select the new shape
    this.app.selectedShape = shape;
    
    // Update UI controls with the shape's properties
    this.updatePropertiesUI(shape);
  }

  deselectShape() {
    this.app.selectedShape = null;
  }

  updatePropertiesUI(shape) {
    // Update color inputs if shape has these properties
    if (shape.strokeColor) {
      document.getElementById('stroke-color').value = shape.strokeColor;
    }
    
    if (shape.fillColor) {
      document.getElementById('fill-color').value = shape.fillColor;
    }
    
    if (shape.strokeWeight !== undefined) {
      document.getElementById('stroke-weight').value = shape.strokeWeight;
      document.getElementById('stroke-weight-value').textContent = `${shape.strokeWeight}px`;
    }
    
    if (shape.opacity !== undefined) {
      const opacityPercentage = Math.round(shape.opacity * 100);
      document.getElementById('opacity').value = opacityPercentage;
      document.getElementById('opacity-value').textContent = `${opacityPercentage}%`;
    }
    
    // Update text properties if it's a text shape
    if (shape.type === 'text') {
      document.getElementById('font-family').value = shape.fontFamily || 'Arial';
      document.getElementById('font-size').value = shape.fontSize || 16;
    }
  }
}