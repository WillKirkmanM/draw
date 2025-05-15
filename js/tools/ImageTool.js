import { Tool } from './Tool.js';

export class ImageTool extends Tool {
  constructor(app) {
    super(app);
  }
  
  onMouseDown(x, y) {
    this.startX = x;
    this.startY = y;
    
    const props = this.getProperties();
    
    // Create file input to select image
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const imageShape = {
            type: 'image',
            x: x,
            y: y,
            width: img.width,
            height: img.height,
            src: event.target.result,
            opacity: props.opacity
          };
          
          // Store the loaded image in the app's cache
          this.app.loadedImages[imageShape.src] = img;
          
          // Add the image shape to the canvas
          this.app.addShape(imageShape);
          
          // Switch back to select tool if lock is not enabled
          if (!this.app.toolManager.isToolLocked()) {
            this.app.toolManager.selectTool('select');
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    };
    
    // Trigger file selection
    input.click();
  }
  
  onMouseDrag(x, y) {
    // Nothing to do during drag for image tool
  }
  
  onMouseUp(x, y) {
    // Nothing to do on mouse up for image tool
  }
}