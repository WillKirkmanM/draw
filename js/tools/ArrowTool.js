import { Tool } from './Tool.js';

export class ArrowTool extends Tool {
  constructor(app) {
    super(app);
    this.startX = 0;
    this.startY = 0;
  }
  
  onMouseDown(x, y) {
    this.startX = x;
    this.startY = y;
    
    const props = this.getProperties();
    
    this.app.currentShape = {
      type: 'arrow',
      x1: x,
      y1: y,
      x2: x,
      y2: y,
      strokeColor: props.strokeColor || '#000000',
      strokeWeight: props.strokeWeight || 1,
      opacity: props.opacity || 100
    };
    
    this.app.isDrawing = true;
  }
  
  onMouseDrag(x, y) {
    if (!this.app.isDrawing) return;
    
    this.app.currentShape.x2 = x;
    this.app.currentShape.y2 = y;
  }
  
  onMouseUp(x, y) {
    if (!this.app.isDrawing) return;
    
    const dx = this.app.currentShape.x2 - this.app.currentShape.x1;
    const dy = this.app.currentShape.y2 - this.app.currentShape.y1;
    const length = Math.sqrt(dx*dx + dy*dy);
    
    this.finishDrawing(length > 5);
  }
}