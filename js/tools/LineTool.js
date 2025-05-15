import { Tool } from './Tool.js';

export class LineTool extends Tool {
  constructor(app) {
    super(app);
  }
  
  onMouseDown(x, y) {
    this.startX = x;
    this.startY = y;
    
    const props = this.getProperties();
    
    this.app.currentShape = {
      type: 'line',
      x1: x,
      y1: y,
      x2: x,
      y2: y,
      strokeColor: props.strokeColor,
      strokeWeight: props.strokeWeight,
      opacity: props.opacity
    };
    
    this.app.isDrawing = true;
  }
  
  onMouseDrag(x, y) {
    if (!this.app.isDrawing) return;
    
    // Update the end point of the line
    this.app.currentShape.x2 = x;
    this.app.currentShape.y2 = y;
  }
  
  onMouseUp(x, y) {
    if (!this.app.isDrawing) return;
    
    // Only add if the line has some length
    const dx = this.app.currentShape.x2 - this.app.currentShape.x1;
    const dy = this.app.currentShape.y2 - this.app.currentShape.y1;
    const shouldAdd = Math.sqrt(dx * dx + dy * dy) > 2;
    
    this.finishDrawing(shouldAdd);
  }
}