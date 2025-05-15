import { Tool } from './Tool.js';
import { ShapeFactory } from '../ShapeFactory.js';

export class PencilTool extends Tool {
  constructor(app) {
    super(app);
    this.points = [];
    this.minDistance = 2; // Minimum distance between points
  }
  
  onMouseDown(x, y) {
    // Start a new path
    this.points = [];
    
    // Add the first point
    this.points.push({ x, y });
    
    // Get current properties from the app
    const props = this.getProperties();
    
    // Create a new pencil shape
    this.app.currentShape = {
      type: 'pencil',
      points: [...this.points],
      strokeColor: props.strokeColor || '#000000',
      strokeWeight: props.strokeWeight || 2,
      opacity: props.opacity || 100
    };
    
    this.app.isDrawing = true;
  }
  
  onMouseDrag(x, y) {
    if (!this.app.isDrawing) return;
    
    // Only add points that are at least minDistance away from the last point
    const lastPoint = this.points[this.points.length - 1];
    const distance = Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2));
    
    if (distance >= this.minDistance) {
      // Add the new point
      this.points.push({ x, y });
      
      // Update the current shape with the new points
      if (this.app.currentShape) {
        this.app.currentShape.points = [...this.points];
      }
    }
  }
  
  onMouseUp(x, y) {
    if (!this.app.isDrawing) return;
    
    // Add the final point if it's different from the last one
    const lastPoint = this.points[this.points.length - 1];
    if (x !== lastPoint.x || y !== lastPoint.y) {
      this.points.push({ x, y });
    }
    
    // Only create a shape if we have at least 2 points
    if (this.points.length > 1) {
      // Update the current shape with the final points
      this.app.currentShape.points = [...this.points];
      
      // Use the finishDrawing method from the base Tool class
      this.finishDrawing(true);
    } else {
      // If there aren't enough points, don't add the shape
      this.finishDrawing(false);
    }
    
    // Reset our local points array
    this.points = [];
  }
}