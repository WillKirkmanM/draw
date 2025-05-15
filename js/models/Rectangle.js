import { Shape } from './Shape.js';

export class Rectangle extends Shape {
  constructor(props = {}) {
    super(props);
    this.type = 'rect'; // Override the type name
    this.x = props.x || 0;
    this.y = props.y || 0;
    this.width = props.width || 0;
    this.height = props.height || 0;
  }
  
  contains(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }
}