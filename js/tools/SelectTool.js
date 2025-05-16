import { Tool } from './Tool.js';

export class SelectTool extends Tool {
  constructor(app) {
    super(app, 'select');
    this.selectedShape = null;
    this.dragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.resizing = false;
    this.resizeHandle = null;
    this.originalShape = null; // For storing shape properties before resizing
    
    // Selection UI properties
    this.handleSize = 8;
    this.selectionPadding = 10;
  }

  onMouseDown(x, y) {
    super.onMouseDown(x, y);
    
    // Check if clicking on a resize handle of the selected shape
    if (this.selectedShape) {
      const handle = this.getResizeHandleAt(x, y);
      if (handle) {
        this.resizing = true;
        this.resizeHandle = handle;
        this.originalShape = { ...this.selectedShape };
        return;
      }
    }
    
    // Try to select a shape
    const clickedShape = this.findShapeAt(x, y);
    
    // If clicking outside and there's a selected shape, deselect it
    if (!clickedShape && this.selectedShape) {
      this.deselectShape();
      return;
    }
    
    if (clickedShape) {
      // Select the shape
      this.selectShape(clickedShape);
      
      // Setup for dragging
      this.dragging = true;
      
      // Calculate drag offset based on shape type
      if (clickedShape.type === 'rect' || clickedShape.type === 'ellipse' || 
          clickedShape.type === 'diamond' || clickedShape.type === 'image' || 
          clickedShape.type === 'text') {
        this.dragOffsetX = x - clickedShape.x;
        this.dragOffsetY = y - clickedShape.y;
      } else if (clickedShape.type === 'line' || clickedShape.type === 'arrow') {
        // For lines and arrows, we'll move the whole line based on distance from start point
        // This is simplified - you might want more sophisticated dragging
        this.dragOffsetX = x - clickedShape.x1;
        this.dragOffsetY = y - clickedShape.y1;
      }
    }
  }

  onMouseDrag(x, y) {
    super.onMouseDrag(x, y);
    
    if (this.resizing && this.selectedShape && this.originalShape) {
      this.resizeShape(x, y);
      this.app.redraw();
      return;
    }
    
    if (this.dragging && this.selectedShape) {
      this.moveShape(this.selectedShape, x, y);
      this.app.redraw();
    }
  }

  onMouseUp(x, y) {
    super.onMouseUp(x, y);
    
    if (this.dragging || this.resizing) {
      // Save the state to history after modifying a shape
      this.app.historyManager?.saveToHistory();
    }
    
    this.dragging = false;
    this.resizing = false;
    this.resizeHandle = null;
    this.originalShape = null;
  }

  moveShape(shape, x, y) {
    // Move the shape based on its type
    if (shape.type === 'rect' || shape.type === 'ellipse' || 
        shape.type === 'diamond' || shape.type === 'image' || 
        shape.type === 'text') {
      shape.x = x - this.dragOffsetX;
      shape.y = y - this.dragOffsetY;
    } else if (shape.type === 'line' || shape.type === 'arrow') {
      // Move both endpoints of the line/arrow while preserving the shape
      const dx = x - this.dragOffsetX - shape.x1;
      const dy = y - this.dragOffsetY - shape.y1;
      
      shape.x1 += dx;
      shape.y1 += dy;
      shape.x2 += dx;
      shape.y2 += dy;
    }
  }

  resizeShape(x, y) {
    if (!this.selectedShape || !this.originalShape) return;
    
    const shape = this.selectedShape;
    const orig = this.originalShape;
    const handle = this.resizeHandle;
    
    // Handle resize based on shape type
    if (shape.type === 'rect' || shape.type === 'ellipse' || shape.type === 'diamond' || shape.type === 'image') {
      switch(handle) {
        case 'top-left':
          shape.width = orig.width + (orig.x - x);
          shape.height = orig.height + (orig.y - y);
          shape.x = x;
          shape.y = y;
          break;
        case 'top-right':
          shape.width = x - orig.x;
          shape.height = orig.height + (orig.y - y);
          shape.y = y;
          break;
        case 'bottom-left':
          shape.width = orig.width + (orig.x - x);
          shape.height = y - orig.y;
          shape.x = x;
          break;
        case 'bottom-right':
          shape.width = x - orig.x;
          shape.height = y - orig.y;
          break;
      }
      
      // Ensure minimum size
      if (shape.width < 10) {
        shape.width = 10;
        if (handle.includes('left')) shape.x = orig.x + orig.width - 10;
      }
      if (shape.height < 10) {
        shape.height = 10;
        if (handle.includes('top')) shape.y = orig.y + orig.height - 10;
      }
    } else if (shape.type === 'line' || shape.type === 'arrow') {
      // For lines and arrows, move the endpoints
      if (handle === 'start') {
        shape.x1 = x;
        shape.y1 = y;
      } else if (handle === 'end') {
        shape.x2 = x;
        shape.y2 = y;
      }
    }
  }

  findShapeAt(x, y) {
    // Go through shapes in reverse order (top to bottom in z-index)
    for (let i = this.app.shapes.length - 1; i >= 0; i--) {
      const shape = this.app.shapes[i];
      
      // Implement hit testing based on shape type
      if (shape.type === 'rect' || shape.type === 'image') {
        if (x >= shape.x && x <= shape.x + shape.width &&
            y >= shape.y && y <= shape.y + shape.height) {
          return shape;
        }
      } else if (shape.type === 'ellipse') {
        // Ellipse hit testing
        const rx = shape.width / 2;
        const ry = shape.height / 2;
        const cx = shape.x + rx;
        const cy = shape.y + ry;
        
        // Check if point is inside the ellipse using the ellipse equation
        const normalizedX = (x - cx) / rx;
        const normalizedY = (y - cy) / ry;
        if (normalizedX * normalizedX + normalizedY * normalizedY <= 1) {
          return shape;
        }
      } else if (shape.type === 'diamond') {
        // Diamond hit testing - simplified as a rectangular test plus some constraints
        // Center of diamond
        const cx = shape.x + shape.width / 2;
        const cy = shape.y + shape.height / 2;
        
        // Calculate normalized distance from center (0-1 for each dimension)
        const nx = Math.abs(x - cx) / (shape.width / 2);
        const ny = Math.abs(y - cy) / (shape.height / 2);
        
        // In a diamond, the sum of normalized distances should be <= 1
        if (nx + ny <= 1) {
          return shape;
        }
      } else if (shape.type === 'line' || shape.type === 'arrow') {
        // Line hit testing - check if point is close to the line
        // Using a simplified approach here - calculate distance from point to line
        const distToLine = this.distanceToLine(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
        if (distToLine < 5 + (shape.strokeWeight || 1)) { // 5px + stroke width tolerance
          return shape;
        }
      } else if (shape.type === 'text') {
        // For text, use bounding box hit testing
        // This is simplified - ideally you'd use the actual text dimensions
        const textWidth = (shape.text?.length || 0) * (shape.fontSize || 16) * 0.6; // Approximation
        const textHeight = (shape.fontSize || 16) * 1.2;
        
        if (x >= shape.x && x <= shape.x + textWidth &&
            y >= shape.y - textHeight && y <= shape.y) {
          return shape;
        }
      }
    }
    
    return null;
  }

  distanceToLine(px, py, x1, y1, x2, y2) {
    // Calculate distance from point (px,py) to line segment (x1,y1)-(x2,y2)
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  }

  selectShape(shape) {
    this.selectedShape = shape;
    this.app.selectedShape = shape; // Update app's selected shape reference
    this.updatePropertiesUI(shape);
  }

  deselectShape() {
    this.selectedShape = null;
    this.app.selectedShape = null;
  }

  updatePropertiesUI(shape) {
    // Update color inputs
    if (shape.strokeColor) {
      document.getElementById('stroke-color').value = shape.strokeColor;
    }
    
    if (shape.fillColor) {
      document.getElementById('fill-color').value = shape.fillColor;
    }
    
    // Update stroke weight
    if (shape.strokeWeight !== undefined) {
      const strokeWeightInput = document.getElementById('stroke-weight');
      strokeWeightInput.value = shape.strokeWeight;
      document.getElementById('stroke-weight-value').textContent = `${shape.strokeWeight}px`;
    }
    
    // Update opacity
    if (shape.opacity !== undefined) {
      const opacityValue = Math.round(shape.opacity * 100);
      document.getElementById('opacity').value = opacityValue;
      document.getElementById('opacity-value').textContent = `${opacityValue}%`;
    }
    
    // Update text properties if it's a text shape
    const textProperties = document.getElementById('text-properties');
    if (shape.type === 'text') {
      textProperties.classList.remove('hidden');
      
      // Update font family
      if (shape.fontFamily) {
        document.getElementById('font-family').value = shape.fontFamily;
      }
      
      // Update font size
      if (shape.fontSize) {
        document.getElementById('font-size').value = shape.fontSize;
      }
      
      // In the future, you might want to add text alignment here
    } else {
      // Hide text properties if not a text element
      textProperties.classList.add('hidden');
    }
  }

  getResizeHandleAt(x, y) {
    if (!this.selectedShape) return null;
    
    const shape = this.selectedShape;
    const handleSize = this.handleSize;
    
    // Handle logic based on shape type
    if (shape.type === 'rect' || shape.type === 'ellipse' || shape.type === 'diamond' || shape.type === 'image') {
      // Check corner handles for rectangle-like shapes
      const handles = {
        'top-left': { x: shape.x, y: shape.y },
        'top-right': { x: shape.x + shape.width, y: shape.y },
        'bottom-left': { x: shape.x, y: shape.y + shape.height },
        'bottom-right': { x: shape.x + shape.width, y: shape.y + shape.height }
      };
      
      for (const [handleName, handlePos] of Object.entries(handles)) {
        if (x >= handlePos.x - handleSize/2 && x <= handlePos.x + handleSize/2 &&
            y >= handlePos.y - handleSize/2 && y <= handlePos.y + handleSize/2) {
          return handleName;
        }
      }
    } else if (shape.type === 'line' || shape.type === 'arrow') {
      // Check endpoints for line-like shapes
      if (Math.abs(x - shape.x1) <= handleSize/2 && Math.abs(y - shape.y1) <= handleSize/2) {
        return 'start';
      }
      if (Math.abs(x - shape.x2) <= handleSize/2 && Math.abs(y - shape.y2) <= handleSize/2) {
        return 'end';
      }
    }
    
    return null;
  }

  render(p5) {
    if (!this.selectedShape) return;
    
    const shape = this.selectedShape;
    const handleSize = this.handleSize;
    
    // Draw selection outline based on shape type
    p5.push();
    p5.noFill();
    p5.stroke(0, 120, 255);
    p5.strokeWeight(1);
    
    if (shape.type === 'rect' || shape.type === 'ellipse' || shape.type === 'diamond' || shape.type === 'image' || shape.type === 'text') {
      // For rectangle-like shapes, draw a rectangle around them
      let width = shape.width;
      let height = shape.height;
      
      // Special handling for text since it doesn't have explicit width/height
      if (shape.type === 'text') {
        width = (shape.text?.length || 0) * (shape.fontSize || 16) * 0.6; // Approximation
        height = (shape.fontSize || 16) * 1.2;
        p5.rect(shape.x - 2, shape.y - height - 2, width + 4, height + 4);
      } else {
        // For other rectangle-like shapes
        p5.rect(shape.x - 2, shape.y - 2, width + 4, height + 4);
      }
      
      // Draw resize handles
      p5.fill(255);
      p5.stroke(0, 120, 255);
      
      // Corner handles
      p5.rect(shape.x - handleSize/2, shape.y - handleSize/2, handleSize, handleSize); // Top-left
      p5.rect(shape.x + width - handleSize/2, shape.y - handleSize/2, handleSize, handleSize); // Top-right
      p5.rect(shape.x - handleSize/2, shape.y + height - handleSize/2, handleSize, handleSize); // Bottom-left
      p5.rect(shape.x + width - handleSize/2, shape.y + height - handleSize/2, handleSize, handleSize); // Bottom-right
      
    } else if (shape.type === 'line' || shape.type === 'arrow') {
      // For lines and arrows, draw handles at the endpoints
      p5.fill(255);
      p5.stroke(0, 120, 255);
      p5.rect(shape.x1 - handleSize/2, shape.y1 - handleSize/2, handleSize, handleSize); // Start point
      p5.rect(shape.x2 - handleSize/2, shape.y2 - handleSize/2, handleSize, handleSize); // End point
    }
    
    p5.pop();
  }
}