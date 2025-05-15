// Base class for all renderers
export class ShapeRenderer {
  render(p, shape) {
    throw new Error("Method 'render' must be implemented");
  }
  
  renderSelection(p, shape) {
    throw new Error("Method 'renderSelection' must be implemented");
  }
  
  // Helper functions for all renderers
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
