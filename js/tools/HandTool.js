import { Tool } from './Tool.js';

export class HandTool extends Tool {
  constructor(app) {
    super(app);
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    
    // Set the cursor
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
      canvasContainer.style.cursor = 'grab';
    }
  }
  
  onMouseDown(x, y) {
    this.isDragging = true;
    this.lastX = x;
    this.lastY = y;
    
    // Change cursor to grabbing when active
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
      canvasContainer.style.cursor = 'grabbing';
    }
  }
  
  onMouseDrag(x, y) {
    if (!this.isDragging) return;
    
    // Calculate how much the mouse has moved
    const dx = x - this.lastX;
    const dy = y - this.lastY;
    
    // Check for erratic movements - ignore if too large
    if (Math.abs(dx) > 100 || Math.abs(dy) > 100) {
      // Just update the last position without moving
      this.lastX = x;
      this.lastY = y;
      return;
    }
    
    // Initiaise canvas offset if not already done
    if (this.app.canvasOffsetX === undefined) this.app.canvasOffsetX = 0;
    if (this.app.canvasOffsetY === undefined) this.app.canvasOffsetY = 0;
    
    // Get any zoom scale that might be applied
    const scale = this.app.scale || 1;
    
    // Add dampening factor to make movement smoother
    const dampening = 1.0;
    
    // Update the canvas offset with smoothing
    this.app.canvasOffsetX += (dx / scale) * dampening;
    this.app.canvasOffsetY += (dy / scale) * dampening;
    
    // Apply the transform ONLY TO THE CANVAS, not the container
    const canvas = this.app.canvas; // Get the actual canvas element
    if (canvas) {
      // Use CSS transform to move only the canvas
      canvas.style.transform = `translate(${this.app.canvasOffsetX}px, ${this.app.canvasOffsetY}px)`;
    }
    
    // Update last position
    this.lastX = x;
    this.lastY = y;
  }
  
  onMouseUp(x, y) {
    this.isDragging = false;
    
    // Reset cursor
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
      canvasContainer.style.cursor = 'grab';
    }
  }
}