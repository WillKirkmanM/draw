import { ShapeRenderer } from './ShapeRenderer.js';
import { DrawingApp } from '../DrawingApp.js';

export class TextRenderer {
  render(p, shape) {
    if (!shape || !shape.text) return;
    
    // Set text properties
    p.push();
    
    // Set opacity
    const opacity = shape.opacity !== undefined ? shape.opacity / 100 : 1;
    const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
    
    // Text color (stroke color for text)
    p.fill(shape.strokeColor + alphaHex);
    
    // Set font
    p.textFont(shape.fontFamily || 'Arial');
    p.textSize(shape.fontSize || 16);
    
    // Set text alignment
    switch (shape.textAlign) {
      case 'center':
        p.textAlign(p.CENTER, p.TOP);
        break;
      case 'right':
        p.textAlign(p.RIGHT, p.TOP);
        break;
      default:
        p.textAlign(p.LEFT, p.TOP);
    }
    
    // Draw the text
    p.text(shape.text, shape.x, shape.y, shape.width, shape.height);
    
    p.pop();
  }
  
  renderSelection(p, shape) {
    if (!shape) return;
    
    // Draw selection box around text
    p.push();
    p.stroke(0, 120, 255);
    p.strokeWeight(1);
    p.noFill();
    p.rect(shape.x - 2, shape.y - 2, shape.width + 4, shape.height + 4);
    
    const handleSize = 6;
    p.fill(255);
    p.stroke(0, 120, 255);
    
    // Corner handles
    p.rect(shape.x - handleSize/2, shape.y - handleSize/2, handleSize, handleSize);
    p.rect(shape.x + shape.width - handleSize/2, shape.y - handleSize/2, handleSize, handleSize);
    p.rect(shape.x - handleSize/2, shape.y + shape.height - handleSize/2, handleSize, handleSize);
    p.rect(shape.x + shape.width - handleSize/2, shape.y + shape.height - handleSize/2, handleSize, handleSize);
    
    p.pop();
  }
}