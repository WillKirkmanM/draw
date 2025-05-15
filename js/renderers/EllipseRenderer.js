import { ShapeRenderer } from './ShapeRenderer.js';
import { DrawingApp } from '../DrawingApp.js';

export class EllipseRenderer extends ShapeRenderer {
  render(p, shape) {
    this.applyStyles(p, shape);
    p.ellipseMode(p.CORNER);
    p.ellipse(shape.x, shape.y, shape.width, shape.height);
  }
  
  renderSelection(p, shape) {
    p.noFill();
    p.stroke('#4299e1'); // Blue highlight
    p.strokeWeight(2 / DrawingApp.getInstance().zoomLevel);
    p.ellipseMode(p.CORNER);
    p.ellipse(shape.x - 5, shape.y - 5, shape.width + 10, shape.height + 10);
  }
}