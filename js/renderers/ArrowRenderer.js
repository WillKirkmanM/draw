// import { ShapeRenderer } from "./ShapeRenderer";

export class ArrowRenderer {
  render(p, shape) {
    this.applyStyles(p, shape);
    
    // Draw the line part
    p.line(shape.x1, shape.y1, shape.x2, shape.y2);
    
    // Calculate angle and head size
    const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
    const headSize = shape.headSize || Math.max(shape.strokeWeight * 3, 10);
    
    // Draw arrowhead
    p.push();
    p.translate(shape.x2, shape.y2);
    p.rotate(angle);
    
    // Use the stroke color to fill the arrowhead
    p.fill(shape.strokeColor);
    p.noStroke();
    p.triangle(0, 0, -headSize, -headSize/2, -headSize, headSize/2);
    
    p.pop();
  }
  
  renderSelection(p, shape) {
    p.noFill();
    p.stroke('#4299e1'); // Blue highlight
    p.strokeWeight(2 / DrawingApp.getInstance().zoomLevel);
    
    // Draw selection with dashed line around the arrow
    const lineRenderer = new LineRenderer();
    lineRenderer.renderSelection(p, shape);
    
    // Draw a circle at the arrowhead
    p.fill('#4299e1');
    p.ellipse(shape.x2 - 4, shape.y2 - 4, 8, 8);
  }
  applyStyles(p, shape) {
    const alpha = shape.opacity !== undefined ? shape.opacity / 100 : 1;
    const strokeColorWithAlpha = p.color(shape.strokeColor);
    strokeColorWithAlpha.setAlpha(alpha * 255);
    
    p.stroke(strokeColorWithAlpha);
    p.strokeWeight(shape.strokeWeight);
    
    if (shape.fillColor) {
      const fillColorWithAlpha = p.color(shape.fillColor);
      fillColorWithAlpha.setAlpha(alpha * 255);
      p.fill(fillColorWithAlpha);
    } else {
      p.noFill();
    }
  }
}

