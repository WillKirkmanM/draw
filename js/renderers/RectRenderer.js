import { ShapeRenderer } from './ShapeRenderer.js';
import { DrawingApp } from '../DrawingApp.js';

export class RectRenderer extends ShapeRenderer {
  render(p, shape) {
    this.applyStyles(p, shape);
    p.rect(shape.x, shape.y, shape.width, shape.height);
  }
  
  renderSelection(p, shape) {
    p.noFill();
    p.stroke('#4299e1'); // Blue highlight
    p.strokeWeight(2 / DrawingApp.getInstance().zoomLevel);
    p.rect(shape.x - 5, shape.y - 5, shape.width + 10, shape.height + 10);
  }
}
