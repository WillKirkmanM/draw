import { EventBus } from './EventBus.js';
import { SelectTool } from './tools/SelectTool.js';
import { RectTool } from './tools/RectTool.js';
import { EllipseTool } from './tools/EllipseTool.js';
import { LineTool } from './tools/LineTool.js';
import { PencilTool } from './tools/PencilTool.js';
import { TextTool } from './tools/TextTool.js';
import { HandTool } from './tools/HandTool.js';
import { EraserTool } from './tools/EraserTool.js';
import { DiamondTool } from './tools/DiamondTool.js';
import { ArrowTool } from './tools/ArrowTool.js';

export class ToolManager {
  constructor(app) {
    this.app = app;
    this.eventBus = EventBus.getInstance();
    this.tools = {};
    this.currentTool = null;
    this.lockTool = false;
    this.defaultTool = 'select';
    
    // Initiaise default tools
    this.setupTools();
    
    // Set default tool
    this.selectTool(this.defaultTool);
  }
  
  setupTools() {
    // Initiaise all available tools
    this.tools = {
      'rect': new RectTool(this.app),
      'ellipse': new EllipseTool(this.app),
      'line': new LineTool(this.app),
      'pencil': new PencilTool(this.app),
      'hand': new HandTool(this.app),
      'eraser': new EraserTool(this.app),
      'diamond': new DiamondTool(this.app),
      'arrow': new ArrowTool(this.app)
    };

    this.registerTool('select', new SelectTool(this.app));
    this.registerTool('text', new TextTool(this.app));
    
    // Ensure all tools implement the required interface
    for (const toolName in this.tools) {
      const tool = this.tools[toolName];
      if (!tool.onMouseDown || !tool.onMouseDrag || !tool.onMouseUp) {
        console.error(`Tool "${toolName}" does not implement the full Tool interface`);
      }
    }
  }

  registerTool(toolName, toolInstance) {
    this.tools[toolName] = toolInstance;
  }
  
  selectTool(toolName) {
    // Special handling for lock/unlock tool
    if (toolName === 'lock') {
      this.lockTool = true;
      this.eventBus.emit('toolLocked', true);
      return;
    } else if (toolName === 'unlock') {
      this.lockTool = false;
      this.eventBus.emit('toolLocked', false);
      return;
    }
    
    // Save the current selected shape before switching tools
    const savedSelectedShape = this.app.selectedShape;
    
    if (this.tools[toolName]) {
      this.currentTool = this.tools[toolName];
      this.eventBus.emit('toolSelected', toolName);
    } else {
      console.warn(`Tool "${toolName}" not found. Available tools: ${Object.keys(this.tools).join(', ')}`);
      // Fall back to default tool if the requested tool doesn't exist
      if (toolName !== this.defaultTool && this.tools[this.defaultTool]) {
        this.currentTool = this.tools[this.defaultTool];
        this.eventBus.emit('toolSelected', this.defaultTool);
      }
    }
    
    // Restore the selected shape after switching tools
    // but only if the new tool is the default tool
    if (toolName === this.defaultTool && savedSelectedShape) {
      this.app.selectedShape = savedSelectedShape;
    }
  }
  
  getCurrentTool() {
    return this.currentTool;
  }
  
  isToolLocked() {
    return this.lockTool;
  }
}