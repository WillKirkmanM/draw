import { Tool } from './Tool.js';

export class TextTool extends Tool {
  constructor(app) {
    super(app);
    this.isEditing = false;
    this.textInput = null;
    this.currentTextObj = null;
    this.fontSize = 16;
    this.fontFamily = 'Arial';
  }
  
  applyStyles(shape) {
    // Get properties from property manager
    const props = this.getProperties();
    
    // Apply standard properties
    shape.strokeColor = props.strokeColor || '#000000';
    shape.fillColor = props.fillColor || '#ffffff';
    shape.opacity = props.opacity || 100;
    
    // Apply text-specific properties
    shape.fontSize = props.fontSize || 16;
    shape.fontFamily = props.fontFamily || 'Arial';
    shape.textAlign = props.textAlign || 'left';
    
    return shape;
  }

  onMouseDown(x, y) {
    super.onMouseDown(x, y);
    
    // If already editing, finish the current edit
    if (this.isEditing) {
      this.finishTextEditing();
      return;
    }
    
    // Create a text input at click position
    this.createTextInput(x, y);
  }
  
  createTextInput(x, y) {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;
    
    // Get the canvas position
    const canvasRect = canvasContainer.getBoundingClientRect();
    
    // Create temporary DOM element for text input
    this.textInput = document.createElement('input');
    this.textInput.type = 'text';
    this.textInput.className = 'text-tool-input';
    this.textInput.style.position = 'absolute';
    this.textInput.style.left = `${x}px`;
    this.textInput.style.top = `${y}px`;
    this.textInput.style.zIndex = '1000';
    this.textInput.style.background = 'transparent';
    this.textInput.style.border = '1px dashed #000';
    this.textInput.style.padding = '2px';
    this.textInput.style.font = `${this.fontSize}px ${this.fontFamily}`;
    this.textInput.style.color = this.getProperties().strokeColor || '#000000';
    this.textInput.style.minWidth = '50px';
    
    canvasContainer.appendChild(this.textInput);
    this.textInput.focus();
    
    // Store current position
    this.currentTextPosition = { x, y };
    this.isEditing = true;
    
    // Handle submission
    this.textInput.addEventListener('blur', () => this.completeTextInput());
    this.textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.completeTextInput();
      }
    });
  }
  
  completeTextInput() {
    if (!this.textInput || !this.isEditing) return;
    
    const text = this.textInput.value;
    const x = this.currentTextPosition.x;
    const y = this.currentTextPosition.y;
    
    if (text.trim()) {
      const textShape = {
        type: 'text',
        id: Date.now().toString(),
        x: x,
        y: y + this.fontSize, // Adjust y to account for text baseline
        text: text,
        fontSize: this.fontSize,
        fontFamily: this.fontFamily,
        render(ctx) {
          ctx.font = `${this.fontSize}px ${this.fontFamily}`;
          ctx.fillStyle = this.fillColor || '#000000';
          ctx.fillText(this.text, this.x, this.y);
          
          if (this.strokeColor && this.strokeColor !== 'transparent') {
            ctx.strokeStyle = this.strokeColor;
            ctx.strokeText(this.text, this.x, this.y);
          }
        }
      };
      
      this.app.currentShape = this.applyStyles(textShape);
      this.finishDrawing();
    }
    
    this.finishTextEditing();
  }
  
  finishTextEditing() {
    if (this.textInput && this.textInput.parentNode) {
      this.textInput.parentNode.removeChild(this.textInput);
    }
    
    this.textInput = null;
    this.isEditing = false;
    this.currentTextPosition = null;
  }
  
  // Override from parent
  onMouseDrag() {
    // Do nothing - text tool doesn't use drag
  }
  
  onMouseUp() {
    // Do nothing - handled by completeTextInput
  }
}