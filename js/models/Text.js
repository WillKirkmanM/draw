import { Shape } from './Shape.js';

export class Text extends Shape {
  constructor(props = {}) {
    super(props);
    this.type = 'text';
    this.x = props.x || 0;
    this.y = props.y || 0;
    this.text = props.text || '';
    this.fontFamily = props.fontFamily || 'Arial';
    this.fontSize = props.fontSize || 16;
    this.textAlign = props.textAlign || 'left';
    
    // Text uses fillColor as the text color
    this.fillColor = props.fillColor || '#000000';
    // Text typically doesn't have a stroke
    delete this.strokeColor;
    delete this.strokeWeight;
  }
  
  contains(x, y, p5) {
    // We need the p5 instance to calculate text width
    if (!p5) return false;
    
    const textWidth = p5.textWidth(this.text);
    const textHeight = this.fontSize;
    
    return x >= this.x && x <= this.x + textWidth &&
           y >= this.y && y <= this.y + textHeight;
  }
}