import { Shape } from './Shape.js';

export class Ellipse extends Shape {
  constructor(props = {}) {
    super(props);
    this.type = 'ellipse';
    this.x = props.x || 0;
    this.y = props.y || 0;
    this.width = props.width || 0;
    this.height = props.height || 0;
  }
  
  contains(x, y) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const rx = Math.abs(this.width) / 2;
    const ry = Math.abs(this.height) / 2;
    
    if (rx === 0 || ry === 0) return false;
    
    const dx = (x - centerX) / rx;
    const dy = (y - centerY) / ry;
    return dx * dx + dy * dy <= 1;
  }
}