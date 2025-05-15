import { ShapeRenderer } from './ShapeRenderer.js';
import { DrawingApp } from '../DrawingApp.js';

export class ImageRenderer extends ShapeRenderer {
  render(p, shape) {
    if (!shape.src) {
      console.warn('Image shape has no source');
      return;
    }

    const app = DrawingApp.getInstance();
    const imgObj = app.loadedImages[shape.src];
    
    if (!imgObj) {
      console.warn(`Image not found in loadedImages cache: ${shape.src}`);
      // Draw a placeholder instead
      p.stroke('#ccc');
      p.fill('#f0f0f0');
      p.rect(shape.x, shape.y, shape.width || 100, shape.height || 100);
      return;
    }

    // Apply opacity
    const alpha = shape.opacity !== undefined ? shape.opacity / 100 : 1;
    
    // Create p5.Image from HTML Image if needed
    if (!(imgObj instanceof p5.Image)) {
      try {
        const p5Img = p.createImage(imgObj.width, imgObj.height);
        p5Img.drawingContext.drawImage(imgObj, 0, 0);
        
        // Store the p5.Image for future use
        app.loadedImages[shape.src] = p5Img;
        
        // Draw with tint for opacity
        p.push();
        p.tint(255, alpha * 255);
        p.image(p5Img, shape.x, shape.y, shape.width, shape.height);
        p.pop();
      } catch (err) {
        console.error('Error converting image:', err);
        // Draw placeholder on error
        p.stroke('#ccc');
        p.fill('#f0f0f0');
        p.rect(shape.x, shape.y, shape.width || 100, shape.height || 100);
      }
    } else {
      // If already p5.Image
      p.push();
      p.tint(255, alpha * 255);
      p.image(imgObj, shape.x, shape.y, shape.width, shape.height);
      p.pop();
    }
  }
  
  renderSelection(p, shape) {
    p.noFill();
    p.stroke('#4299e1'); // Blue highlight
    p.strokeWeight(2 / DrawingApp.getInstance().zoomLevel);
    
    // Draw selection rectangle
    p.rect(shape.x - 5, shape.y - 5, (shape.width || 100) + 10, (shape.height || 100) + 10);
  }
}