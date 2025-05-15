import { ShapeRenderer } from './ShapeRenderer.js';
import { DrawingApp } from '../DrawingApp.js';

export class PencilRenderer extends ShapeRenderer {
  render(p, shape) {
    if (!shape || !shape.points || shape.points.length < 2) return;
    
    // Calculate opacity
    const opacity = shape.opacity !== undefined ? shape.opacity / 100 : 1;
    const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
    
    p.push();
    p.stroke(shape.strokeColor + alphaHex);
    p.strokeWeight(shape.strokeWeight || 2);
    p.noFill();
    
    // Draw the line connecting all points
    p.beginShape();
    for (const point of shape.points) {
      p.vertex(point.x, point.y);
    }
    p.endShape();
    p.pop();
  }
  
  renderSelection(p, shape) {
    if (!shape || !shape.points || shape.points.length < 2) return;
    
    // Calculate bounding box of the freehand drawing
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    for (const point of shape.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    
    // Draw selection rectangle
    p.push();
    p.stroke(0, 120, 255);
    p.strokeWeight(1);
    p.noFill();
    p.rect(minX, minY, maxX - minX, maxY - minY);
    
    // Draw resize handles
    const handleSize = 6 / p._renderer._pInst.zoomLevel; // Adjust handle size based on zoom
    p.fill(255);
    p.stroke(0, 120, 255);
    
    // Corner handles
    p.rect(minX - handleSize/2, minY - handleSize/2, handleSize, handleSize);
    p.rect(maxX - handleSize/2, minY - handleSize/2, handleSize, handleSize);
    p.rect(minX - handleSize/2, maxY - handleSize/2, handleSize, handleSize);
    p.rect(maxX - handleSize/2, maxY - handleSize/2, handleSize, handleSize);
    
    p.pop();
  }
}