import { ShapeRenderer } from './ShapeRenderer.js';
import { DrawingApp } from '../DrawingApp.js';

export class LineRenderer extends ShapeRenderer {
  render(p, shape) {
    this.applyStyles(p, shape);
    p.noFill();
    p.line(shape.x1, shape.y1, shape.x2, shape.y2);
  }
  
  renderSelection(p, shape) {
    p.noFill();
    p.stroke('#4299e1'); // Blue highlight
    p.strokeWeight(2 / DrawingApp.getInstance().zoomLevel);
    
    // Draw a dashed selection box around the line
    this.drawDashedLine(p, 
      shape.x1 - 5, shape.y1 - 5,
      shape.x2 + 5, shape.y2 + 5);
    
    // Draw endpoints
    p.fill('#4299e1');
    p.ellipse(shape.x1 - 4, shape.y1 - 4, 8, 8);
    p.ellipse(shape.x2 - 4, shape.y2 - 4, 8, 8);
  }
  
  drawDashedLine(p, x1, y1, x2, y2) {
    const dashLength = 5;
    const gapLength = 3;

    let dx = x2 - x1;
    let dy = y2 - y1;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let dashCount = Math.floor(distance / (dashLength + gapLength));
    let dashX = dx / distance * dashLength;
    let dashY = dy / distance * dashLength;
    let gapX = dx / distance * gapLength;
    let gapY = dy / distance * gapLength;

    let currentX = x1;
    let currentY = y1;

    for (let i = 0; i < dashCount; i++) {
      p.line(currentX, currentY, currentX + dashX, currentY + dashY);
      currentX += dashX + gapX;
      currentY += dashY + gapY;
    }

    if (currentX < x2) {
      p.line(currentX, currentY, x2, y2);
    }
  }
}