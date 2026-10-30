import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class RealtimeEventsService {
  private server?: Server;

  attachServer(server: Server) {
    this.server = server;
  }

  disconnectUser(userId: string) {
    this.server?.in(`user:${userId}`).disconnectSockets(true);
  }

  emitUserUnblocked(
    userId: string,
    blockerId: string,
  ) {
    this.server
      ?.to(`user:${userId}`)
      .emit("user:unblocked", {
        blockerId,
      });
  }
}
