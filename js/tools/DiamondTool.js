import { Tool } from './Tool.js';

export class DiamondTool extends Tool {
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
      type: 'diamond',
      x: x,
      y: y,
      width: 0,
      height: 0,
      strokeColor: props.strokeColor || '#000000',
      fillColor: props.fillColor || '#ffffff',
      strokeWeight: props.strokeWeight || 1,
      opacity: props.opacity || 100
    };
    
    this.app.isDrawing = true;
  }
  
  onMouseDrag(x, y) {
    if (!this.app.isDrawing) return;
    
    this.app.currentShape.width = x - this.startX;
    this.app.currentShape.height = y - this.startY;
  }
  
  onMouseUp(x, y) {
    if (!this.app.isDrawing) return;
    
    // Complete the diamond shape
    this.finishDrawing(Math.abs(this.app.currentShape.width) > 2 && 
                       Math.abs(this.app.currentShape.height) > 2);
  }
}