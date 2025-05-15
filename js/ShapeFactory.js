import { Rectangle } from './models/Rectangle.js';
import { Ellipse } from './models/Ellipse.js';
import { Line } from './models/Line.js';
import { Diamond } from './models/Diamond.js';
import { Pencil } from './models/Pencil.js';
import { Text } from './models/Text.js';
import { Arrow } from './models/Arrow.js';
import { ImageShape } from './models/Image.js';

import { RectRenderer } from './renderers/RectRenderer.js';
import { EllipseRenderer } from './renderers/EllipseRenderer.js';
import { LineRenderer } from './renderers/LineRenderer.js';
import { DiamondRenderer } from './renderers/DiamondRenderer.js';
import { PencilRenderer } from './renderers/PencilRenderer.js';
import { TextRenderer } from './renderers/TextRenderer.js';
import { ArrowRenderer } from './renderers/ArrowRenderer.js';
import { ImageRenderer } from './renderers/ImageRenderer.js';

// Helper function to convert hex color with opacity
function hexToRgba(opacity) {
  if (opacity === 1) return '';
  return opacity.toString(16).padStart(2, '0');
}

// Factory pattern for creating shapes and renderers
export class ShapeFactory {
  static instance = null;
  
  constructor() {
    // Initiaise renderers for each shape type
    this.renderers = {
      rect: new RectRenderer(),
      ellipse: new EllipseRenderer(),
      line: new LineRenderer(),
      text: new TextRenderer(),
      pencil: new PencilRenderer(),
      diamond: new DiamondRenderer(),
      arrow: new ArrowRenderer()
    };
  }
  
  static getInstance() {
    if (!ShapeFactory.instance) {
      ShapeFactory.instance = new ShapeFactory();
    }
    return ShapeFactory.instance;
  }
  
  createShape(type, props) {
    switch(type) {
      case 'rect': return new Rectangle(props);
      case 'ellipse': return new Ellipse(props);
      case 'line': return new Line(props);
      case 'diamond': return new Diamond(props);
      case 'pencil': return new Pencil(props);
      case 'text': return new Text(props);
      case 'arrow': return new Arrow(props);
      case 'image': return new ImageShape(props);
      default: throw new Error(`Shape type "${type}" not supported`);
    }
  }
  
  // Modify your getRenderer method to fix duplicate initializations
  getRenderer(type) {
    // First check if we already have the renderer in our renderers object
    if (this.renderers[type]) {
      return this.renderers[type];
    }
    
    // Special case for eraser which doesn't need a renderer
    if (type === 'eraser') {
      return {
        render: () => {}, // No-op render function for eraser
        renderSelection: () => {} // No selection rendering for eraser
      };
    }
    
    // Fallback to default renderer for unknown types
    console.warn(`No renderer found for shape type: ${type}. Using default renderer.`);
    return {
      render: (p, shape) => {
        // Simple fallback renderer
        p.stroke('#ff0000');
        p.fill('#ffcccc');
        p.rect(shape.x || 0, shape.y || 0, shape.width || 20, shape.height || 20);
      },
      renderSelection: (p, shape) => {
        p.noFill();
        p.stroke('#4299e1');
        p.strokeWeight(2 / DrawingApp.getInstance().zoomLevel);
        p.rect((shape.x || 0) - 5, (shape.y || 0) - 5, (shape.width || 20) + 10, (shape.height || 20) + 10);
      }
    };
  }
}




