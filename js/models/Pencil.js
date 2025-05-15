import { Shape } from './Shape.js';

export class Pencil extends Shape {
  constructor(props = {}) {
    super(props);
    this.type = 'pencil';
    this.points = props.points || [];
    
    // Pencil paths don't use fill
    delete this.fillColor;
  }
  
  contains(x, y, tolerance = 10) {
    if (this.points.length < 2) return false;
    
    // Check each segment of the pencil path
    for (let i = 1; i < this.points.length; i++) {
      const x1 = this.points[i - 1][0];
      const y1 = this.points[i - 1][1];
      const x2 = this.points[i][0];
      const y2 = this.points[i][1];
      
      const dist = this.distToSegment(x, y, x1, y1, x2, y2);
      if (dist <= tolerance) {
        return true;
      }
    }
    
    return false;
  }
  
  distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length2 = dx * dx + dy * dy;
    
    if (length2 === 0) {
      return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    }
    
    const t = ((px - x1) * dx + (py - y1) * dy) / length2;
    
    if (t < 0) {
      return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    }
    
    if (t > 1) {
      return Math.sqrt((px - x2) * (px - x2) + (py - y2) * (py - y2));
    }
    
    const projx = x1 + t * dx;
    const projy = y1 + t * dy;
    
    return Math.sqrt((px - projx) * (px - projx) + (py - projy) * (py - projy));
  }
}