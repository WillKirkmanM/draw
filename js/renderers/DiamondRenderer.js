import { DrawingApp } from '../DrawingApp.js';

// export class DiamondRenderer extends ShapeRenderer {
//   render(p, shape) {
//     this.applyStyles(p, shape);
    
//     const centerX = shape.x + shape.width / 2;
//     const centerY = shape.y + shape.height / 2;
//     const halfWidth = Math.abs(shape.width) / 2;
//     const halfHeight = Math.abs(shape.height) / 2;

//     p.beginShape();
//     p.vertex(centerX, shape.y); // Top
//     p.vertex(shape.x + shape.width, centerY); // Right
//     p.vertex(centerX, shape.y + shape.height); // Bottom
//     p.vertex(shape.x, centerY); // Left
//     p.endShape(p.CLOSE);
//   }
  
//   renderSelection(p, shape) {
//     p.noFill();
//     p.stroke('#4299e1'); // Blue highlight
//     p.strokeWeight(2 / DrawingApp.getInstance().zoomLevel);
    
//     const centerX = shape.x + shape.width / 2;
//     const centerY = shape.y + shape.height / 2;
//     const halfWidth = Math.abs(shape.width) / 2 + 5;
//     const halfHeight = Math.abs(shape.height) / 2 + 5;
    
//     p.beginShape();
//     p.vertex(centerX, shape.y - 5); // Top
//     p.vertex(shape.x + shape.width + 5, centerY); // Right
//     p.vertex(centerX, shape.y + shape.height + 5); // Bottom
//     p.vertex(shape.x - 5, centerY); // Left
//     p.endShape(p.CLOSE);
//   }
// }

export class DiamondRenderer {
  render(p, shape) {
    if (!shape) return;
    
    const opacity = shape.opacity !== undefined ? shape.opacity / 100 : 1;
    const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
    
    p.push();
    
    // Draw diamond shape
    p.stroke(shape.strokeColor + alphaHex);
    p.strokeWeight(shape.strokeWeight || 1);
    p.fill(shape.fillColor + alphaHex);
    
    // Calculate diamond vertices
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;
    const halfWidth = Math.abs(shape.width) / 2;
    const halfHeight = Math.abs(shape.height) / 2;
    
    // Draw the diamond
    p.beginShape();
    p.vertex(centerX, shape.y);  // top
    p.vertex(shape.x + shape.width, centerY);  // right
    p.vertex(centerX, shape.y + shape.height);  // bottom
    p.vertex(shape.x, centerY);  // left
    p.endShape(p.CLOSE);
    
    p.pop();
  }
  
  renderSelection(p, shape) {
    if (!shape) return;
    
    // Draw selection box around diamond
    p.push();
    p.stroke(0, 120, 255);
    p.strokeWeight(1);
    p.noFill();
    p.rect(shape.x, shape.y, shape.width, shape.height);
    
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