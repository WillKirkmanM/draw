// Abstract base class for all tools
export class Tool {
  constructor(app) {
    this.app = app;
    this.properties = {};
  }
  
  onMouseDown(x, y) {
    console.log(`${this.constructor.name}: Mouse down at (${x}, ${y})`);
  }
  
  onMouseDrag(x, y) {
    console.log(`${this.constructor.name}: Mouse drag at (${x}, ${y})`);
  }
  
  onMouseUp(x, y) {
    console.log(`${this.constructor.name}: Mouse up at (${x}, ${y})`);
  }
  
  getProperties() {
    return this.app.propertyManager.getProperties();
  }
  
  finishDrawing(shouldAddShape = true) {
    this.app.isDrawing = false;
    
    if (shouldAddShape && this.app.currentShape) {
      // Only add shapes that have some dimensions
      this.app.addShape(this.app.currentShape);
    }
    
    this.app.currentShape = null;
    
    // Only switch back to select if we're not in a locked tool mode
    // if (!this.app.toolManager.isToolLocked()) {
    //   this.app.toolManager.selectTool('select');
    // }
    
    // Keep the current tool selected
  }

  applyStyles(shape) {
    if (!shape) return shape;
    
    // Get current properties
    const props = this.getProperties();
    
    // Apply standard properties to any shape
    shape.strokeColor = props.strokeColor || '#000000';
    shape.fillColor = props.fillColor || '#ffffff';
    shape.strokeWeight = props.strokeWeight || 1;
    shape.opacity = props.opacity || 100;
    
    return shape;
  }
}