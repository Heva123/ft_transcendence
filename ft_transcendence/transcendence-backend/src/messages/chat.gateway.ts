import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { PrismaService } from "../prisma/prisma.service";
import { MessagesService } from "./messages.service";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly userSockets = new Map<string, Set<string>>();

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authToken = client.handshake.auth?.token;
      const authorization = client.handshake.headers.authorization;

      const token =
        typeof authToken === "string"
          ? authToken
          : typeof authorization === "string"
            ? authorization.replace(/^Bearer\s+/i, "")
            : undefined;

      if (!token) {
        client.emit("auth:error", {
          message: "Authentication required",
        });
        client.disconnect();
        return;
      }

      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(token);

      client.data.userId = payload.sub;
      client.data.username = payload.username;

      await client.join(`user:${payload.sub}`);

      const sockets = this.userSockets.get(payload.sub) ?? new Set<string>();
      const wasOffline = sockets.size === 0;
      sockets.add(client.id);
      this.userSockets.set(payload.sub, sockets);

      if (wasOffline) {
        this.server.emit("presence:online", {
          userId: payload.sub,
          username: payload.username,
        });
      }

      client.emit("auth:success", {
        userId: payload.sub,
        username: payload.username,
      });
    } catch {
      client.emit("auth:error", {
        message: "Invalid or expired token",
      });
      client.disconnect();
    }
  }

  @SubscribeMessage("channel:join")
  async handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId?: string },
  ) {
    const userId = client.data.userId as string | undefined;
    const channelId = data?.channelId;

    if (!userId) {
      client.emit("auth:error", {
        message: "Authentication required",
      });
      return;
    }

    if (!channelId) {
      client.emit("channel:error", {
        message: "channelId is required",
      });
      return;
    }

    try {
      await this.messagesService.requireChannelMember(
        channelId,
        userId,
      );

      await client.join(`channel:${channelId}`);

      client.emit("channel:joined", {
        channelId,
      });
    } catch (error) {
      client.emit("channel:error", {
        message:
          error instanceof Error
            ? error.message
            : "Unable to join channel",
      });
    }
  }

  @SubscribeMessage("message:send")
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      channelId?: string;
      content?: string;
    },
  ) {
    const userId = client.data.userId as string | undefined;
    const channelId = data?.channelId;
    const content =
      typeof data?.content === "string"
        ? data.content.trim()
        : "";

    if (!userId) {
      client.emit("auth:error", {
        message: "Authentication required",
      });
      return;
    }

    if (!channelId) {
      client.emit("message:error", {
        message: "channelId is required",
      });
      return;
    }

    if (!content) {
      client.emit("message:error", {
        message: "Message cannot be empty",
      });
      return;
    }

    if (content.length > 2000) {
      client.emit("message:error", {
        message: "Message cannot exceed 2000 characters",
      });
      return;
    }

    const room = `channel:${channelId}`;

    if (!client.rooms.has(room)) {
      client.emit("message:error", {
        message: "Join the channel before sending messages",
      });
      return;
    }

    try {
      const message = await this.messagesService.create(
        channelId,
        userId,
        { content },
      );

      await this.emitToAllowedUsers(
        room,
        userId,
        "message:new",
        message,
        true,
      );
    } catch (error) {
      client.emit("message:error", {
        message:
          error instanceof Error
            ? error.message
            : "Unable to send message",
      });
    }
  }

  @SubscribeMessage("message:read")
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      channelId?: string;
      messageId?: string;
    },
  ) {
    const userId = client.data.userId as string | undefined;
    const channelId = data?.channelId;
    const messageId = data?.messageId;

    if (!userId) {
      client.emit("auth:error", {
        message: "Authentication required",
      });
      return;
    }

    if (!channelId || !messageId) {
      client.emit("message:error", {
        message: "channelId and messageId are required",
      });
      return;
    }

    const room = `channel:${channelId}`;

    if (!client.rooms.has(room)) {
      client.emit("message:error", {
        message: "Join the channel before reading messages",
      });
      return;
    }

    try {
      const receipt = await this.messagesService.markRead(
        channelId,
        messageId,
        userId,
      );

      await this.emitToAllowedUsers(
        room,
        userId,
        "message:read",
        receipt,
      );
    } catch (error) {
      client.emit("message:error", {
        message:
          error instanceof Error
            ? error.message
            : "Unable to mark message as read",
      });
    }
  }

  @SubscribeMessage("typing:start")
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId?: string },
  ) {
    const userId = client.data.userId as string | undefined;
    const username = client.data.username as string | undefined;
    const channelId = data?.channelId;

    if (!userId) {
      client.emit("auth:error", {
        message: "Authentication required",
      });
      return;
    }

    if (!channelId) {
      client.emit("typing:error", {
        message: "channelId is required",
      });
      return;
    }

    const room = `channel:${channelId}`;

    if (!client.rooms.has(room)) {
      client.emit("typing:error", {
        message: "Join the channel before sending typing events",
      });
      return;
    }

    await this.emitToAllowedUsers(
      room,
      userId,
      "typing:start",
      {
        channelId,
        userId,
        username,
      },
    );
  }

  @SubscribeMessage("typing:stop")
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId?: string },
  ) {
    const userId = client.data.userId as string | undefined;
    const username = client.data.username as string | undefined;
    const channelId = data?.channelId;

    if (!userId) {
      client.emit("auth:error", {
        message: "Authentication required",
      });
      return;
    }

    if (!channelId) {
      client.emit("typing:error", {
        message: "channelId is required",
      });
      return;
    }

    const room = `channel:${channelId}`;

    if (!client.rooms.has(room)) {
      client.emit("typing:error", {
        message: "Join the channel before sending typing events",
      });
      return;
    }

    await this.emitToAllowedUsers(
      room,
      userId,
      "typing:stop",
      {
        channelId,
        userId,
        username,
      },
    );
  }

  private async emitToAllowedUsers(
    room: string,
    actorId: string,
    event: string,
    payload: unknown,
    includeActor = false,
  ) {
    const blockedUserIds = new Set(
      await this.messagesService.getBlockedUserIds(actorId),
    );

    const sockets = await this.server.in(room).fetchSockets();

    for (const socket of sockets) {
      const recipientId = socket.data.userId as string | undefined;

      if (!recipientId) {
        continue;
      }

      if (recipientId === actorId) {
        if (includeActor) {
          socket.emit(event, payload);
        }

        continue;
      }

      if (!blockedUserIds.has(recipientId)) {
        socket.emit(event, payload);
      }
    }
  }

  emitNotification(userId: string, notification: unknown) {
    this.server
      .to(`user:${userId}`)
      .emit("notification:new", notification);
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId as string | undefined;
    const username = client.data.username as string | undefined;

    if (!userId) {
      return;
    }

    const sockets = this.userSockets.get(userId);

    if (!sockets) {
      return;
    }

    sockets.delete(client.id);

    if (sockets.size > 0) {
      return;
    }

    this.userSockets.delete(userId);

    const lastSeenAt = new Date();

    await this.prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt },
    });

    this.server.emit("presence:offline", {
      userId,
      username,
      lastSeenAt,
    });
  }
}
