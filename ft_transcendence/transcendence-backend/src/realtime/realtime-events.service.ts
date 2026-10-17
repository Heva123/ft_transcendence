import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class RealtimeEventsService {
  private server?: Server;

  attachServer(server: Server) {
    this.server = server;
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
