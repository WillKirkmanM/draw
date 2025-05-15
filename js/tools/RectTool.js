import { Tool } from './Tool.js';

export class RectTool extends Tool {
  constructor(app) {
    super(app);
  }
  
  onMouseDown(x, y) {
    this.startX = x;
    this.startY = y;
    
    // Create a new rectangle shape
    this.app.currentShape = {
      type: 'rect',
      x: x,
      y: y,
      width: 0,
      height: 0
    };
    
    // Apply styles from property manager
    this.applyStyles(this.app.currentShape);
    
    this.app.isDrawing = true;
  }
  
  onMouseDrag(x, y) {
    if (!this.app.isDrawing) return;
    
    this.app.currentShape.width = x - this.startX;
    this.app.currentShape.height = y - this.startY;
  }
  
  onMouseUp(x, y) {
    if (!this.app.isDrawing) return;
    
    // Only add shapes that have some dimensions
    const shouldAdd = Math.abs(this.app.currentShape.width) > 2 && 
                     Math.abs(this.app.currentShape.height) > 2;
    
    this.finishDrawing(shouldAdd);
  }
}