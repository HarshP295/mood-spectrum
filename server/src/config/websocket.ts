import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

type AuthenticatedWebSocket = WebSocket & {
  userId?: string;
  roomId?: string;
  readyState: WebSocket['readyState'];
  send: WebSocket['send'];
  on: WebSocket['on'];
}

interface WebSocketMessage {
  type: string;
  roomId?: string;
  content?: string;
  payload?: any;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private rooms: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private userSockets: Map<string, Set<AuthenticatedWebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
      console.log('🔌 New WebSocket connection attempt');
      
      // Extract token from query parameters or headers (optional)
      let userId: string | undefined;
      try {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const token = url.searchParams.get('token') || req.headers.authorization?.toString().replace('Bearer ', '');
        if (token && process.env.JWT_SECRET) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
          userId = decoded.userId as string;
        }
      } catch (err) {
        // Ignore token errors and continue as guest
      }

      ws.userId = userId || `guest_${Date.now()}_${Math.floor(Math.random()*1000)}`;

      // Track user sockets
      if (!this.userSockets.has(ws.userId)) {
        this.userSockets.set(ws.userId, new Set());
      }
      this.userSockets.get(ws.userId)!.add(ws);

      console.log(`✅ WebSocket connected for user: ${ws.userId}${userId ? ' (authenticated)' : ' (guest)'}`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        roomId: 'general',
        message: 'Connected to Mood Spectrum Studio'
      }));

      ws.on('message', (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('❌ Invalid WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.handleDisconnection(ws);
      });
    });
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'room.join':
        this.joinRoom(ws, message.roomId || 'general');
        break;
        
      case 'chat.message':
        this.broadcastToRoom(ws.roomId || 'general', {
          type: 'chat.message',
          roomId: ws.roomId,
          message: {
            id: `msg_${Date.now()}`,
            content: message.content,
            sender: 'peer',
            timestamp: Date.now(),
            userId: ws.userId
          }
        }, ws /* exclude sender */);
        break;
        
      case 'room.leave':
        this.leaveRoom(ws);
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private joinRoom(ws: AuthenticatedWebSocket, roomId: string) {
    // Leave current room if any
    if (ws.roomId) {
      this.leaveRoom(ws);
    }

    // Join new room
    ws.roomId = roomId;
    
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(ws);

    // Send confirmation
    ws.send(JSON.stringify({
      type: 'room.joined',
      roomId: roomId
    }));

    // Broadcast room count
    this.broadcastRoomCount(roomId);
    
    console.log(`👤 User ${ws.userId} joined room: ${roomId}`);
  }

  private leaveRoom(ws: AuthenticatedWebSocket) {
    if (ws.roomId && this.rooms.has(ws.roomId)) {
      this.rooms.get(ws.roomId)!.delete(ws);
      this.broadcastRoomCount(ws.roomId);
      console.log(`👤 User ${ws.userId} left room: ${ws.roomId}`);
    }
    ws.roomId = undefined;
  }

  private broadcastToRoom(roomId: string, message: any, exclude?: AuthenticatedWebSocket) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.forEach(ws => {
        if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  private broadcastRoomCount(roomId: string) {
    const room = this.rooms.get(roomId);
    const count = room ? room.size : 0;
    
    this.broadcastToRoom(roomId, {
      type: 'room.count',
      roomId: roomId,
      count: count
    });
  }

  private handleDisconnection(ws: AuthenticatedWebSocket) {
    if (ws.userId) {
      // Remove from user sockets
      const userSockets = this.userSockets.get(ws.userId);
      if (userSockets) {
        userSockets.delete(ws);
        if (userSockets.size === 0) {
          this.userSockets.delete(ws.userId);
        }
      }
      
      // Leave room
      this.leaveRoom(ws);
      
      console.log(`👋 User ${ws.userId} disconnected`);
    }
  }

  // Public methods for broadcasting admin notifications
  public broadcastTipCreated(tip: any) {
    this.broadcastToAll({
      type: 'tip.created',
      payload: tip
    });
  }

  public broadcastTipUpdated(tip: any) {
    this.broadcastToAll({
      type: 'tip.updated',
      payload: tip
    });
  }

  public broadcastTipDeleted(tipId: string) {
    this.broadcastToAll({
      type: 'tip.deleted',
      payload: { id: tipId }
    });
  }

  private broadcastToAll(message: any) {
    this.wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

let wsManager: WebSocketManager;

export const setupWebSocket = (server: Server): WebSocketManager => {
  wsManager = new WebSocketManager(server);
  return wsManager;
};

export const getWebSocketManager = (): WebSocketManager => {
  if (!wsManager) {
    throw new Error('WebSocket manager not initialized');
  }
  return wsManager;
};
