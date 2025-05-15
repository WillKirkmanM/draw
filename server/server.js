const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const express = require('express');
const path = require('path');

// Create an Express app for serving static files
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store rooms and connections
const rooms = new Map();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Store client data
  ws.isAlive = true;
  ws.clientId = null;
  ws.roomId = null;
  
  // Ping to keep connections alive
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Handle incoming messages
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    
    // Echo the message back
    ws.send(JSON.stringify({
      type: 'echo',
      message: 'Server received: ' + message.toString()
    }));

    try {
      const data = JSON.parse(message);
      console.log(`Received message type: ${data.type}`);
      
      switch(data.type) {
        case 'create_room':
          handleCreateRoom(ws, data);
          break;
          
        case 'join_room':
          handleJoinRoom(ws, data);
          break;
          
        case 'cursor_update':
          forwardToRoom(ws, data);
          break;
          
        case 'sync_state':
          forwardToRoom(ws, data);
          break;
          
        case 'batch_changes':
          forwardToRoom(ws, data);
          break;
          
        case 'shape_added':
        case 'shape_updated':
        case 'shape_deleted':
          forwardToRoom(ws, data);
          break;
          
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
    handleDisconnect(ws);
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to test server'
  }));
});

// Create a new room
function handleCreateRoom(ws, data) {
  // Generate a room ID
  const roomId = uuidv4().substring(0, 8);
  
  // Store client info
  ws.clientId = data.clientId;
  ws.roomId = roomId;
  
  // Create room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  
  // Add client to room
  rooms.get(roomId).add(ws);
  
  // Notify client that room was created
  ws.send(JSON.stringify({
    type: 'room_created',
    roomId: roomId
  }));
  
  console.log(`Room created: ${roomId} by client ${ws.clientId}`);
}

// Join an existing room
function handleJoinRoom(ws, data) {
  // Store client info
  ws.clientId = data.clientId;
  ws.roomId = data.roomId;
  
  // Create room if it doesn't exist
  if (!rooms.has(data.roomId)) {
    rooms.set(data.roomId, new Set());
  }
  
  const room = rooms.get(data.roomId);
  
  // Add client to room
  room.add(ws);
  
  // Notify other clients that a new user has joined
  broadcastToRoom(ws.roomId, {
    type: 'user_joined',
    clientId: ws.clientId
  }, ws);
  
  // Request sync from an existing client if there are others in the room
  for (const client of room) {
    if (client !== ws) {
      client.send(JSON.stringify({
        type: 'sync_request',
        requesterId: ws.clientId
      }));
      break;
    }
  }
  
  console.log(`Client ${ws.clientId} joined room ${ws.roomId}`);
}

// Forward message to all clients in the room except the sender
function forwardToRoom(ws, data) {
  if (!ws.roomId) return;
  
  broadcastToRoom(ws.roomId, data, ws);
}

// Broadcast a message to all clients in a room
function broadcastToRoom(roomId, data, excludeClient = null) {
  if (!rooms.has(roomId)) return;
  
  const room = rooms.get(roomId);
  
  room.forEach(client => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Handle client disconnect
function handleDisconnect(ws) {
  if (ws.roomId && ws.clientId) {
    // Get the room
    const room = rooms.get(ws.roomId);
    
    if (room) {
      // Remove client from room
      room.delete(ws);
      
      // Notify other clients
      broadcastToRoom(ws.roomId, {
        type: 'user_left',
        clientId: ws.clientId
      });
      
      console.log(`Client ${ws.clientId} left room ${ws.roomId}`);
      
      // Clean up empty rooms
      if (room.size === 0) {
        rooms.delete(ws.roomId);
        console.log(`Room ${ws.roomId} deleted (empty)`);
      }
    }
  }
}

// Ping all clients periodically to detect disconnected clients
setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) {
      handleDisconnect(ws);
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});