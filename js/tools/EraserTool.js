import { Tool } from './Tool.js';

export class EraserTool extends Tool {
  constructor(app) {
    super(app);
  }
  
  onMouseDown(x, y) {
    this.startX = x;
    this.startY = y;
    
    const props = this.getProperties();
    
    this.app.currentShape = {
      type: 'eraser',
      points: [[x, y]],
      strokeWeight: props.strokeWeight * 2 // Make eraser larger
    };
    
    this.app.isDrawing = true;
    
    // Check if any shape is under the eraser
    this.eraseAtPoint(x, y);
  }
  
  onMouseDrag(x, y) {
    if (!this.app.isDrawing) return;
    
    // Add new point to the eraser path
    this.app.currentShape.points.push([x, y]);
    
    // Check if any shape is under the eraser
    this.eraseAtPoint(x, y);
  }
  
  onMouseUp(x, y) {
    this.app.isDrawing = false;
    this.app.currentShape = null;
  }
  
  eraseAtPoint(x, y) {
    const eraserSize = this.app.currentShape.strokeWeight;
    
    for (let i = this.app.shapes.length - 1; i >= 0; i--) {
      const shape = this.app.shapes[i];
      
      if (this.isShapeUnderEraser(shape, x, y, eraserSize)) {
        this.app.shapes.splice(i, 1);
      }
    }
    
    // Save history after erasing
    this.app.historyManager.saveToHistory();
  }
  
  isShapeUnderEraser(shape, x, y, eraserSize) {
    // Different logic for different shape types
    switch(shape.type) {
      case 'rect':
      case 'image':
        // Check if the eraser overlaps with the rectangle
        return x - eraserSize/2 < shape.x + shape.width && 
               x + eraserSize/2 > shape.x &&
               y - eraserSize/2 < shape.y + shape.height &&
               y + eraserSize/2 > shape.y;
        
      case 'ellipse': {
        // Distance from point to ellipse center
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const dx = Math.abs(x - centerX);
        const dy = Math.abs(y - centerY);
        
        // If the point is inside the ellipse or very close
        return (dx <= shape.width/2 + eraserSize/2) && 
               (dy <= shape.height/2 + eraserSize/2);
      }
      
      case 'line':
      case 'arrow': {
        // Distance from point to line segment
        const selectTool = this.app.toolManager.tools['select'];
        const dist = distToSegment(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
        return dist < eraserSize/2 + shape.strokeWeight/2;
      }
      
      case 'diamond': {
        // Use a simplified check for diamond
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const normX = Math.abs(x - centerX) / (shape.width/2 + eraserSize/2);
        const normY = Math.abs(y - centerY) / (shape.height/2 + eraserSize/2);
        return normX + normY <= 1;
      }
      
      case 'pencil':
        // Check each segment of the pencil path
        for (let i = 1; i < shape.points.length; i++) {
          const selectTool = this.app.toolManager.tools['select'];
          const dist = selectTool.distToSegment(
            x, y,
            shape.points[i-1][0], shape.points[i-1][1],
            shape.points[i][0], shape.points[i][1]
          );
          if (dist < eraserSize/2 + shape.strokeWeight/2) {
            return true;
          }
        }
        return false;
        
      case 'text': {
        // Approximate text bounds
        const width = this.app.p5Instance.textWidth(shape.text);
        const height = shape.fontSize;
        return x >= shape.x - eraserSize/2 && 
               x <= shape.x + width + eraserSize/2 &&
               y >= shape.y - eraserSize/2 && 
               y <= shape.y + height + eraserSize/2;
      }
        
      default:
        return false;
    }
  }
}