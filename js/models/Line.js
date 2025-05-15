import { Shape } from './Shape.js';

export class Line extends Shape {
  constructor(props = {}) {
    super(props);
    this.type = 'line';
    this.x1 = props.x1 || 0;
    this.y1 = props.y1 || 0;
    this.x2 = props.x2 || 0;
    this.y2 = props.y2 || 0;
    
    // Lines don't use fill
    delete this.fillColor;
  }
  
  contains(x, y, tolerance = 10) {
    // Distance from point to line segment
    return this.distToSegment(x, y) <= tolerance;
  }
  
  distToSegment(px, py) {
    const x1 = this.x1;
    const y1 = this.y1;
    const x2 = this.x2;
    const y2 = this.y2;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length2 = dx * dx + dy * dy;
    
    if (length2 === 0) {
      // Point is coincident with a segment endpoint
      return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    }
    
    // Calculate projection of point onto line
    const t = ((px - x1) * dx + (py - y1) * dy) / length2;
    
    if (t < 0) {
      // Beyond the 'x1,y1' end of the segment
      return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    }
    
    if (t > 1) {
      // Beyond the 'x2,y2' end of the segment
      return Math.sqrt((px - x2) * (px - x2) + (py - y2) * (py - y2));
    }
    
    // Projection falls on the segment
    const projx = x1 + t * dx;
    const projy = y1 + t * dy;
    
    return Math.sqrt((px - projx) * (px - projx) + (py - projy) * (py - projy));
  }
}