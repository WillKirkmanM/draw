import { Shape } from './Shape.js';

export class Diamond extends Shape {
  constructor(props = {}) {
    super(props);
    this.type = 'diamond';
    this.x = props.x || 0;
    this.y = props.y || 0;
    this.width = props.width || 0;
    this.height = props.height || 0;
  }
  
  contains(x, y) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const halfWidth = Math.abs(this.width) / 2;
    const halfHeight = Math.abs(this.height) / 2;
    
    if (halfWidth === 0 || halfHeight === 0) return false;
    
    // Diamond shape is defined by |x/a| + |y/b| <= 1
    const dx = Math.abs(x - centerX) / halfWidth;
    const dy = Math.abs(y - centerY) / halfHeight;
    
    return dx + dy <= 1;
  }
}