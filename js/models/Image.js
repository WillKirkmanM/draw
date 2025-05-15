import { Shape } from './Shape.js';

export class ImageShape extends Shape {
  constructor(props = {}) {
    super(props);
    this.type = 'image';
    this.x = props.x || 0;
    this.y = props.y || 0;
    this.width = props.width || 0;
    this.height = props.height || 0;
    this.src = props.src || '';
    
    // Images don't use stroke or fill
    delete this.strokeColor;
    delete this.strokeWeight;
    delete this.fillColor;
  }
  
  contains(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }
}