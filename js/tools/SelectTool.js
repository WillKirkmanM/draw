import { Tool } from './Tool.js';

export class SelectTool extends Tool {
  constructor(app) {
    super(app);
    this.selectedShape = null;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.resisingHandle = null;
    
    // For selection box
    this.selectionBox = null;
    this.selectionStartX = 0;
    this.selectionStartY = 0;
  }
  
  onMouseDown(x, y) {
    super.onMouseDown(x, y);
    
    // Check if clicking on a resize handle of selected shape
    if (this.selectedShape) {
      const handle = this.getResizeHandleAt(x, y);
      if (handle) {
        this.resisingHandle = handle;
        this.isDragging = true;
        this.dragStartX = x;
        this.dragStartY = y;
        return;
      }
    }
    
    // Check if we clicked on the selected shape (for dragging)
    if (this.selectedShape && this.isPointInShape(x, y, this.selectedShape)) {
      this.isDragging = true;
      this.dragStartX = x;
      this.dragStartY = y;
      return;
    }
    
    // Otherwise, try to select a shape
    const clickedShape = this.findShapeAt(x, y);
    
    if (clickedShape) {
      this.selectShape(clickedShape);
      this.isDragging = true;
      this.dragStartX = x;
      this.dragStartY = y;
    } else {
      // If we didn't click on a shape, deselect
      this.deselectShape();
      
      // Start a selection box
      this.selectionBox = {
        x: x,
        y: y,
        width: 0,
        height: 0
      };
      this.selectionStartX = x;
      this.selectionStartY = y;
    }
  }
  
  onMouseDrag(x, y) {
    if (this.resisingHandle && this.selectedShape) {
      // Resize the selected shape based on which handle is being dragged
      this.resizeShape(x, y);
      this.app.redraw();
    }
    else if (this.isDragging && this.selectedShape) {
      // Move the selected shape
      const dx = x - this.dragStartX;
      const dy = y - this.dragStartY;
      
      this.moveShape(this.selectedShape, dx, dy);
      
      this.dragStartX = x;
      this.dragStartY = y;
      
      this.app.redraw();
    } else if (this.selectionBox) {
      // Update selection box
      this.selectionBox.width = x - this.selectionStartX;
      this.selectionBox.height = y - this.selectionStartY;
      
      this.app.redraw();
    }
  }
  
  onMouseUp(x, y) {
    if (this.selectionBox) {
      // Calculate normaised coordinates for selection box
      const x1 = Math.min(this.selectionStartX, this.selectionStartX + this.selectionBox.width);
      const y1 = Math.min(this.selectionStartY, this.selectionStartY + this.selectionBox.height);
      const x2 = Math.max(this.selectionStartX, this.selectionStartX + this.selectionBox.width);
      const y2 = Math.max(this.selectionStartY, this.selectionStartY + this.selectionBox.height);
      
      // Check if selection box is large enough
      if (Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5) {
        const shapesInBox = this.findShapesInBox(x1, y1, x2, y2);
        
        if (shapesInBox.length > 0) {
          // Select the first shape for now (could be expanded to multi-select)
          this.selectShape(shapesInBox[0]);
        }
      }
      
      this.selectionBox = null;
      this.app.redraw();
    }
    
    this.isDragging = false;
    this.resisingHandle = null;
  }
  
  moveShape(shape, dx, dy) {
    switch (shape.type) {
      case 'rectangle':
      case 'circle':
      case 'ellipse':
        shape.x += dx;
        shape.y += dy;
        break;
      case 'line':
        shape.x1 += dx;
        shape.y1 += dy;
        shape.x2 += dx;
        shape.y2 += dy;
        break;
      case 'text':
        shape.x += dx;
        shape.y += dy;
        break;
      case 'path':
        if (shape.points) {
          shape.points.forEach(point => {
            point.x += dx;
            point.y += dy;
          });
        }
        break;
    }
  }
  
  resizeShape(x, y) {
    const shape = this.selectedShape;
    const dx = x - this.dragStartX;
    const dy = y - this.dragStartY;
    
    switch (this.resisingHandle) {
      case 'top-left':
        if (shape.type === 'rectangle') {
          shape.x += dx;
          shape.y += dy;
          shape.width = Math.max(10, shape.width - dx);
          shape.height = Math.max(10, shape.height - dy);
        }
        break;
      case 'top-right':
        if (shape.type === 'rectangle') {
          shape.y += dy;
          shape.width = Math.max(10, shape.width + dx);
          shape.height = Math.max(10, shape.height - dy);
        }
        break;
      case 'bottom-left':
        if (shape.type === 'rectangle') {
          shape.x += dx;
          shape.width = Math.max(10, shape.width - dx);
          shape.height = Math.max(10, shape.height + dy);
        }
        break;
      case 'bottom-right':
        if (shape.type === 'rectangle') {
          shape.width = Math.max(10, shape.width + dx);
          shape.height = Math.max(10, shape.height + dy);
        }
        break;
      case 'start':
        if (shape.type === 'line') {
          shape.x1 += dx;
          shape.y1 += dy;
        }
        break;
      case 'end':
        if (shape.type === 'line') {
          shape.x2 += dx;
          shape.y2 += dy;
        }
        break;
    }
    
    this.dragStartX = x;
    this.dragStartY = y;
  }
  
  selectShape(shape) {
    this.selectedShape = shape;
    this.app.selectedShape = shape; // Also set on app level if needed
    this.app.redraw();
  }
  
  deselectShape() {
    this.selectedShape = null;
    this.app.selectedShape = null; // Also clear on app level if needed
    this.app.redraw();
  }
  
  findShapeAt(x, y) {
    // Search in reverse order to get the topmost shape
    for (let i = this.app.shapes.length - 1; i >= 0; i--) {
      const shape = this.app.shapes[i];
      if (this.isPointInShape(x, y, shape)) {
        return shape;
      }
    }
    return null;
  }
  
  findShapesInBox(x1, y1, x2, y2) {
    return this.app.shapes.filter(shape => this.isShapeInBox(shape, x1, y1, x2, y2));
  }
  
  isPointInShape(x, y, shape) {
    switch (shape.type) {
      case 'rectangle':
        return x >= shape.x && x <= shape.x + shape.width &&
               y >= shape.y && y <= shape.y + shape.height;
      
      case 'circle':
        const dx = x - shape.x;
        const dy = y - shape.y;
        return dx * dx + dy * dy <= shape.radius * shape.radius;
      
      case 'ellipse':
        // Math for ellipse hit testing
        const rx = shape.width / 2;
        const ry = shape.height / 2;
        const centerX = shape.x + rx;
        const centerY = shape.y + ry;
        return Math.pow((x - centerX) / rx, 2) + Math.pow((y - centerY) / ry, 2) <= 1;
      
      case 'line':
        // Calculate distance to line segment
        return this.distToSegment(x, y, shape.x1, shape.y1, shape.x2, shape.y2) <= 5;
      
      case 'text':
        // Approximate text hit area
        const textWidth = shape.text.length * 8; // Estimate width
        const textHeight = 16; // Default text height
        return x >= shape.x && x <= shape.x + textWidth &&
               y >= shape.y - textHeight && y <= shape.y;
      
      case 'path':
        // Path hit testing - check distance to each line segment
        if (shape.points && shape.points.length > 1) {
          for (let i = 0; i < shape.points.length - 1; i++) {
            const p1 = shape.points[i];
            const p2 = shape.points[i + 1];
            if (this.distToSegment(x, y, p1.x, p1.y, p2.x, p2.y) <= 5) {
              return true;
            }
          }
        }
        return false;
        
      default:
        return false;
    }
  }
  
  isShapeInBox(shape, x1, y1, x2, y2) {
    switch (shape.type) {
      case 'rectangle':
        return shape.x >= x1 && shape.x + shape.width <= x2 &&
               shape.y >= y1 && shape.y + shape.height <= y2;
      
      case 'circle':
        return shape.x - shape.radius >= x1 && shape.x + shape.radius <= x2 &&
               shape.y - shape.radius >= y1 && shape.y + shape.radius <= y2;
      
      case 'ellipse':
        const rx = shape.width / 2;
        const ry = shape.height / 2;
        const centerX = shape.x + rx;
        const centerY = shape.y + ry;
        return centerX - rx >= x1 && centerX + rx <= x2 &&
               centerY - ry >= y1 && centerY + ry <= y2;
      
      case 'line':
        return shape.x1 >= x1 && shape.x1 <= x2 && shape.y1 >= y1 && shape.y1 <= y2 &&
               shape.x2 >= x1 && shape.x2 <= x2 && shape.y2 >= y1 && shape.y2 <= y2;
      
      case 'text':
        const textWidth = shape.text.length * 8;
        const textHeight = 16;
        return shape.x >= x1 && shape.x + textWidth <= x2 &&
               shape.y - textHeight >= y1 && shape.y <= y2;
               
      case 'path':
        if (shape.points) {
          return shape.points.every(p => p.x >= x1 && p.x <= x2 && p.y >= y1 && p.y <= y2);
        }
        return false;
        
      default:
        return false;
    }
  }
  
  getResizeHandleAt(x, y) {
    if (!this.selectedShape) return null;
    
    const HANDLE_SIZE = 8; // Size of the resize handles
    const hitZone = HANDLE_SIZE / 2;
    
    // Get shape bounds
    let handles = [];
    
    switch (this.selectedShape.type) {
      case 'rectangle':
      case 'ellipse':
        const shape = this.selectedShape;
        handles = [
          { name: 'top-left', x: shape.x, y: shape.y },
          { name: 'top-right', x: shape.x + shape.width, y: shape.y },
          { name: 'bottom-left', x: shape.x, y: shape.y + shape.height },
          { name: 'bottom-right', x: shape.x + shape.width, y: shape.y + shape.height }
        ];
        break;
        
      case 'line':
        handles = [
          { name: 'start', x: this.selectedShape.x1, y: this.selectedShape.y1 },
          { name: 'end', x: this.selectedShape.x2, y: this.selectedShape.y2 }
        ];
        break;
    }
    
    // Check if mouse is over any handle
    for (const handle of handles) {
      if (Math.abs(x - handle.x) <= hitZone && Math.abs(y - handle.y) <= hitZone) {
        return handle.name;
      }
    }
    
    return null;
  }
  
  distToSegment(px, py, x1, y1, x2, y2) {
    const lineLength = this.distBetween(x1, y1, x2, y2);
    
    if (lineLength === 0) {
      return this.distBetween(px, py, x1, y1);
    }
    
    // Project point onto line
    const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (lineLength * lineLength);
    
    if (t < 0) {
      return this.distBetween(px, py, x1, y1);
    }
    if (t > 1) {
      return this.distBetween(px, py, x2, y2);
    }
    
    // Projection falls on the segment
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    
    return this.distBetween(px, py, projX, projY);
  }
  
  distBetween(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }
  
  render(ctx) {
    // Draw selection indicators if a shape is selected
    if (this.selectedShape) {
      ctx.save();
      ctx.strokeStyle = '#0066ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      
      // Draw selection outline based on shape type
      switch (this.selectedShape.type) {
        case 'rectangle':
          ctx.strokeRect(
            this.selectedShape.x - 2,
            this.selectedShape.y - 2,
            this.selectedShape.width + 4,
            this.selectedShape.height + 4
          );
          
          // Draw resize handles
          this.drawResizeHandles(ctx, [
            { x: this.selectedShape.x, y: this.selectedShape.y },
            { x: this.selectedShape.x + this.selectedShape.width, y: this.selectedShape.y },
            { x: this.selectedShape.x, y: this.selectedShape.y + this.selectedShape.height },
            { x: this.selectedShape.x + this.selectedShape.width, y: this.selectedShape.y + this.selectedShape.height }
          ]);
          break;
          
        case 'circle':
          ctx.beginPath();
          ctx.arc(
            this.selectedShape.x,
            this.selectedShape.y,
            this.selectedShape.radius + 2,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          
          // Draw resize handle at the edge of the circle
          this.drawResizeHandles(ctx, [
            { x: this.selectedShape.x + this.selectedShape.radius, y: this.selectedShape.y }
          ]);
          break;
          
        case 'ellipse':
          // Draw selection outline for ellipse
          const rx = this.selectedShape.width / 2;
          const ry = this.selectedShape.height / 2;
          const centerX = this.selectedShape.x + rx;
          const centerY = this.selectedShape.y + ry;
          
          ctx.beginPath();
          ctx.ellipse(
            centerX,
            centerY,
            rx + 2,
            ry + 2,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          
          // Draw resize handles
          this.drawResizeHandles(ctx, [
            { x: this.selectedShape.x, y: this.selectedShape.y },
            { x: this.selectedShape.x + this.selectedShape.width, y: this.selectedShape.y },
            { x: this.selectedShape.x, y: this.selectedShape.y + this.selectedShape.height },
            { x: this.selectedShape.x + this.selectedShape.width, y: this.selectedShape.y + this.selectedShape.height }
          ]);
          break;
          
        case 'line':
          // Draw a highlight around the line
          ctx.beginPath();
          ctx.moveTo(this.selectedShape.x1, this.selectedShape.y1);
          ctx.lineTo(this.selectedShape.x2, this.selectedShape.y2);
          ctx.stroke();
          
          // Draw handles at both ends
          this.drawResizeHandles(ctx, [
            { x: this.selectedShape.x1, y: this.selectedShape.y1 },
            { x: this.selectedShape.x2, y: this.selectedShape.y2 }
          ]);
          break;
          
        case 'text':
          const textWidth = this.selectedShape.text.length * 8;
          const textHeight = 16;
          
          ctx.strokeRect(
            this.selectedShape.x - 2,
            this.selectedShape.y - textHeight - 2,
            textWidth + 4,
            textHeight + 4
          );
          break;
          
        case 'path':
          if (this.selectedShape.points && this.selectedShape.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(this.selectedShape.points[0].x, this.selectedShape.points[0].y);
            
            for (let i = 1; i < this.selectedShape.points.length; i++) {
              ctx.lineTo(this.selectedShape.points[i].x, this.selectedShape.points[i].y);
            }
            
            ctx.stroke();
            
            // Draw handles at each point
            this.drawResizeHandles(ctx, this.selectedShape.points);
          }
          break;
      }
      
      ctx.restore();
    }
    
    // Draw selection box if active
    if (this.selectionBox) {
      ctx.save();
      ctx.strokeStyle = '#0066ff';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(
        this.selectionBox.x,
        this.selectionBox.y,
        this.selectionBox.width,
        this.selectionBox.height
      );
      ctx.restore();
    }
  }
  
  drawResizeHandles(ctx, points) {
    const HANDLE_SIZE = 8;
    
    ctx.fillStyle = '#0066ff';
    ctx.setLineDash([]);
    
    points.forEach(point => {
      ctx.fillRect(
        point.x - HANDLE_SIZE / 2,
        point.y - HANDLE_SIZE / 2,
        HANDLE_SIZE,
        HANDLE_SIZE
      );
    });
  }
}