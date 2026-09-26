import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class DemoGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server!: Server;

  handleConnection(client: Socket): void {
    console.log(`[connect] ${client.id}`);
    client.emit('connection:ready', { socketId: client.id });
  }

  handleDisconnect(client: Socket): void {
    console.log(`[disconnect] ${client.id}`);
  }

  @SubscribeMessage('demo:ping')
  handlePing(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): void {
    client.emit('demo:pong', { received: payload });
  }

  @SubscribeMessage('demo:message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): void {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('text' in payload) ||
      typeof payload.text !== 'string' ||
      payload.text.trim().length === 0 ||
      payload.text.length > 200
    ) {
      client.emit('demo:error', {
        message: 'Message must contain 1–200 characters.',
      });
      return;
    }

    const text = payload.text.trim();
    this.server.emit('demo:message', {
      fromSocketId: client.id,
      text,
    });
  }
}
