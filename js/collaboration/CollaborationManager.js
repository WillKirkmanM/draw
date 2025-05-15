export class CollaborationManager {
  constructor(app) {
    this.app = app;
    this.socket = null;
    this.roomId = null;
    this.clientId = this.generateClientId();
    this.collaborators = new Map();
    this.connected = false;
    this.pendingChanges = [];
    this.lastSyncTime = Date.now();
    this.syncInterval = 50; // ms
  }

  generateClientId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  connect(serverUrl = 'ws://localhost:8080') {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = new WebSocket(serverUrl);
    
    this.socket.onopen = () => {
      console.log('Connected to collaboration server');
      this.connected = true;
      
      // Join existing room if we have a roomId in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const roomId = urlParams.get('room');
      
      if (roomId) {
        this.joinRoom(roomId);
      }
    };
    
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.socket.onclose = () => {
      console.log('Disconnected from collaboration server');
      this.connected = false;
      
      // Try to reconnect after a delay
      setTimeout(() => this.connect(serverUrl), 3000);
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    // Start the sync loop
    this.startSyncLoop();
  }
  
  startSyncLoop() {
    setInterval(() => {
      if (this.connected && this.pendingChanges.length > 0) {
        this.syncChanges();
      }
    }, this.syncInterval);
  }
  
  createRoom() {
    if (!this.connected) return;
    
    this.socket.send(JSON.stringify({
      type: 'create_room',
      clientId: this.clientId
    }));
  }
  
  joinRoom(roomId) {
    if (!this.connected) return;
    
    this.roomId = roomId;
    this.socket.send(JSON.stringify({
      type: 'join_room',
      roomId: roomId,
      clientId: this.clientId
    }));
    
    // Update URL with room ID
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    window.history.pushState({}, '', url);
  }
  
  handleMessage(message) {
    switch (message.type) {
      case 'room_created':
        this.roomId = message.roomId;
        console.log(`Room created: ${this.roomId}`);
        
        // Update URL with room ID
        const url = new URL(window.location.href);
        url.searchParams.set('room', this.roomId);
        window.history.pushState({}, '', url);
        break;
        
      case 'user_joined':
        console.log(`User joined: ${message.clientId}`);
        this.collaborators.set(message.clientId, {
          id: message.clientId,
          cursor: { x: 0, y: 0 }
        });
        
        // Send current canvas state to the new user
        this.sendCurrentState();
        break;
        
      case 'user_left':
        console.log(`User left: ${message.clientId}`);
        this.collaborators.delete(message.clientId);
        break;
        
      case 'cursor_update':
        if (message.clientId !== this.clientId) {
          this.updateCollaboratorCursor(message.clientId, message.x, message.y);
        }
        break;
        
      case 'shape_added':
      case 'shape_updated':
      case 'shape_deleted':
        if (message.clientId !== this.clientId) {
          this.handleShapeChange(message);
        }
        break;
        
      case 'sync_request':
        this.sendCurrentState();
        break;
        
      case 'sync_state':
        if (message.clientId !== this.clientId) {
          this.app.loadShapesFromJSON(message.shapes);
        }
        break;
    }
  }
  
  sendCurrentState() {
    if (!this.connected || !this.roomId) return;
    
    this.socket.send(JSON.stringify({
      type: 'sync_state',
      clientId: this.clientId,
      roomId: this.roomId,
      shapes: this.app.getShapesAsJSON()
    }));
  }
  
  updateCursorPosition(x, y) {
    if (!this.connected || !this.roomId) return;
    
    this.socket.send(JSON.stringify({
      type: 'cursor_update',
      clientId: this.clientId,
      roomId: this.roomId,
      x: x,
      y: y
    }));
  }
  
  updateCollaboratorCursor(clientId, x, y) {
    const collaborator = this.collaborators.get(clientId);
    if (collaborator) {
      collaborator.cursor = { x, y };
      this.renderCollaboratorCursors();
    }
  }
  
  renderCollaboratorCursors() {
    // Remove existing cursors
    document.querySelectorAll('.collaborator-cursor').forEach(el => el.remove());
    
    this.collaborators.forEach(collaborator => {
      if (collaborator.id !== this.clientId) {
        const cursor = document.createElement('div');
        cursor.className = 'collaborator-cursor';
        cursor.style.position = 'absolute';
        cursor.style.left = `${collaborator.cursor.x}px`;
        cursor.style.top = `${collaborator.cursor.y}px`;
        cursor.style.width = '10px';
        cursor.style.height = '10px';
        cursor.style.borderRadius = '50%';
        cursor.style.backgroundColor = this.getClientColor(collaborator.id);
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = 1000;
        
        document.body.appendChild(cursor);
      }
    });
  }
  
  getClientColor(clientId) {
    // Generate a deterministic color based on clientId
    let hash = 0;
    for (let i = 0; i < clientId.length; i++) {
      hash = clientId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 80%, 60%)`;
  }
  
  queueChange(changeType, shapeData) {
    this.pendingChanges.push({
      type: changeType,
      data: shapeData,
      timestamp: Date.now()
    });
  }
  
  syncChanges() {
    if (!this.connected || !this.roomId) return;
    
    // Batch send all pending changes
    const changes = [...this.pendingChanges];
    this.pendingChanges = [];
    
    this.socket.send(JSON.stringify({
      type: 'batch_changes',
      clientId: this.clientId,
      roomId: this.roomId,
      changes: changes
    }));
  }
  
  handleShapeChange(message) {
    switch (message.type) {
      case 'shape_added':
        this.app.addShapeFromJSON(message.shape);
        break;
        
      case 'shape_updated':
        this.app.updateShapeFromJSON(message.shape);
        break;
        
      case 'shape_deleted':
        this.app.deleteShape(message.shapeId);
        break;
    }
  }
  
  getShareableLink() {
    if (!this.roomId) return null;
    
    const url = new URL(window.location.href);
    url.searchParams.set('room', this.roomId);
    return url.toString();
  }
  
  copyShareableLinkToClipboard() {
    const link = this.getShareableLink();
    if (link) {
      navigator.clipboard.writeText(link)
        .then(() => {
          alert('Shareable link copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy link:', err);
          // Fallback
          prompt('Copy this link to share your drawing:', link);
        });
    }
  }
}