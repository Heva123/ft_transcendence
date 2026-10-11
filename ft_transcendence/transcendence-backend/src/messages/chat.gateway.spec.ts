jest.mock("@nestjs/jwt", () => ({
  JwtService: class JwtService {},
}));

import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeEventsService } from "../realtime/realtime-events.service";
import { ChatGateway } from "./chat.gateway";
import { MessagesService } from "./messages.service";

describe("ChatGateway", () => {
  const jwtService = {
    verifyAsync: jest.fn(),
  };

  const messagesService = {
    requireChannelMember: jest.fn(),
    create: jest.fn(),
    markRead: jest.fn(),
    getBlockedUserIds: jest.fn(),
  };

  const prisma = {
    user: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const realtimeEvents = {
    attachServer: jest.fn(),
  };

  const server = {
    emit: jest.fn(),
    in: jest.fn(),
    to: jest.fn(),
  };

  let gateway: ChatGateway;

  function createSocket(
    userId?: string,
    username?: string,
  ) {
    return {
      id: `socket-${userId ?? "anonymous"}`,
      handshake: {
        auth: {},
        headers: {},
      },
      data: {
        userId,
        username,
      },
      rooms: new Set<string>(),
      emit: jest.fn(),
      join: jest.fn(async function (
        this: { rooms: Set<string> },
        room: string,
      ) {
        this.rooms.add(room);
      }),
      leave: jest.fn(async function (
        this: { rooms: Set<string> },
        room: string,
      ) {
        this.rooms.delete(room);
      }),
      disconnect: jest.fn(),
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();

    messagesService.requireChannelMember.mockResolvedValue(
      undefined,
    );

    messagesService.getBlockedUserIds.mockResolvedValue(
      [],
    );

    gateway = new ChatGateway(
      jwtService as unknown as JwtService,
      messagesService as unknown as MessagesService,
      prisma as unknown as PrismaService,
      realtimeEvents as unknown as RealtimeEventsService,
    );

    gateway.server = server as never;
  });

  it("rejects a socket without authentication", async () => {
    const client = createSocket();

    await gateway.handleConnection(client as never);

    expect(client.emit).toHaveBeenCalledWith(
      "auth:error",
      {
        message: "Authentication required",
      },
    );

    expect(client.disconnect).toHaveBeenCalled();
  });

  it("authenticates a socket and announces online presence", async () => {
    const client = createSocket();

    client.handshake.auth = {
      token: "valid-token",
    };

    jwtService.verifyAsync.mockResolvedValue({
      sub: "user-1",
      username: "worod",
    });

    await gateway.handleConnection(client as never);

    expect(client.data.userId).toBe("user-1");
    expect(client.data.username).toBe("worod");

    expect(client.join).toHaveBeenCalledWith(
      "user:user-1",
    );

    expect(server.emit).toHaveBeenCalledWith(
      "presence:online",
      {
        userId: "user-1",
        username: "worod",
      },
    );

    expect(client.emit).toHaveBeenCalledWith(
      "auth:success",
      {
        userId: "user-1",
        username: "worod",
      },
    );
  });

  it("returns a snapshot of currently online users", async () => {
    const firstClient = createSocket();
    const secondClient = createSocket();

    firstClient.handshake.auth = {
      token: "token-1",
    };

    secondClient.handshake.auth = {
      token: "token-2",
    };

    jwtService.verifyAsync
      .mockResolvedValueOnce({
        sub: "user-1",
        username: "worod",
      })
      .mockResolvedValueOnce({
        sub: "user-2",
        username: "afnan",
      });

    await gateway.handleConnection(firstClient as never);
    await gateway.handleConnection(secondClient as never);

    prisma.user.findMany.mockResolvedValue([
      {
        id: "user-1",
        username: "worod",
      },
      {
        id: "user-2",
        username: "afnan",
      },
    ]);

    await gateway.handlePresenceGet(
      secondClient as never,
    );

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: ["user-1", "user-2"],
        },
      },
      select: {
        id: true,
        username: true,
      },
    });

    expect(secondClient.emit).toHaveBeenCalledWith(
      "presence:snapshot",
      [
        {
          userId: "user-1",
          username: "worod",
        },
        {
          userId: "user-2",
          username: "afnan",
        },
      ],
    );
  });

  it("leaves a previously joined channel room", async () => {
    const client = createSocket(
      "user-1",
      "worod",
    );

    client.rooms.add("channel:channel-1");

    await gateway.handleLeaveChannel(
      client as never,
      {
        channelId: "channel-1",
      },
    );

    expect(client.leave).toHaveBeenCalledWith(
      "channel:channel-1",
    );

    expect(
      client.rooms.has("channel:channel-1"),
    ).toBe(false);

    expect(client.emit).toHaveBeenCalledWith(
      "channel:left",
      {
        channelId: "channel-1",
      },
    );
  });

  it("rejects sending a message before joining the channel", async () => {
    const client = createSocket(
      "user-1",
      "worod",
    );

    await gateway.handleSendMessage(
      client as never,
      {
        channelId: "channel-1",
        content: "hello",
      },
    );

    expect(client.emit).toHaveBeenCalledWith(
      "message:error",
      {
        message:
          "Join the channel before sending messages",
      },
    );

    expect(
      messagesService.create,
    ).not.toHaveBeenCalled();
  });

  it("sends messages only to allowed users", async () => {
    const client = createSocket(
      "user-1",
      "worod",
    );

    client.rooms.add("channel:channel-1");

    const actorSocket = createSocket(
      "user-1",
      "worod",
    );

    const allowedSocket = createSocket(
      "user-2",
      "allowed",
    );

    const blockedSocket = createSocket(
      "user-3",
      "blocked",
    );

    server.in.mockReturnValue({
      fetchSockets: jest.fn().mockResolvedValue([
        actorSocket,
        allowedSocket,
        blockedSocket,
      ]),
    });

    messagesService.getBlockedUserIds.mockResolvedValue([
      "user-3",
    ]);

    const message = {
      id: "message-1",
      channelId: "channel-1",
      content: "hello",
    };

    messagesService.create.mockResolvedValue(
      message,
    );

    await gateway.handleSendMessage(
      client as never,
      {
        channelId: "channel-1",
        content: "hello",
      },
    );

    expect(actorSocket.emit).toHaveBeenCalledWith(
      "message:new",
      message,
    );

    expect(allowedSocket.emit).toHaveBeenCalledWith(
      "message:new",
      message,
    );

    expect(
      blockedSocket.emit,
    ).not.toHaveBeenCalledWith(
      "message:new",
      message,
    );
  });

  it("filters blocked users from typing events", async () => {
    const client = createSocket(
      "user-1",
      "worod",
    );

    client.rooms.add("channel:channel-1");

    const actorSocket = createSocket(
      "user-1",
      "worod",
    );

    const allowedSocket = createSocket(
      "user-2",
      "allowed",
    );

    const blockedSocket = createSocket(
      "user-3",
      "blocked",
    );

    server.in.mockReturnValue({
      fetchSockets: jest.fn().mockResolvedValue([
        actorSocket,
        allowedSocket,
        blockedSocket,
      ]),
    });

    messagesService.getBlockedUserIds.mockResolvedValue([
      "user-3",
    ]);

    await gateway.handleTypingStart(
      client as never,
      {
        channelId: "channel-1",
      },
    );

    const payload = {
      channelId: "channel-1",
      userId: "user-1",
      username: "worod",
    };

    expect(
      allowedSocket.emit,
    ).toHaveBeenCalledWith(
      "typing:start",
      payload,
    );

    expect(
      actorSocket.emit,
    ).not.toHaveBeenCalledWith(
      "typing:start",
      payload,
    );

    expect(
      blockedSocket.emit,
    ).not.toHaveBeenCalledWith(
      "typing:start",
      payload,
    );
  });

  it("sets last seen and emits offline presence on final disconnect", async () => {
    const client = createSocket();

    client.handshake.auth = {
      token: "valid-token",
    };

    jwtService.verifyAsync.mockResolvedValue({
      sub: "user-1",
      username: "worod",
    });

    await gateway.handleConnection(client as never);

    jest.clearAllMocks();

    prisma.user.update.mockResolvedValue({
      id: "user-1",
    });

    await gateway.handleDisconnect(
      client as never,
    );

    expect(
      prisma.user.update,
    ).toHaveBeenCalledWith({
      where: {
        id: "user-1",
      },
      data: {
        lastSeenAt: expect.any(Date),
      },
    });

    expect(server.emit).toHaveBeenCalledWith(
      "presence:offline",
      {
        userId: "user-1",
        username: "worod",
        lastSeenAt: expect.any(Date),
      },
    );
  });
});
