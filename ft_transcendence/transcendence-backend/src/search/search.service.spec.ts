import { BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SearchService } from "./search.service";

describe("SearchService", () => {
  const prisma = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    community: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  let service: SearchService;

  beforeEach(() => {
    jest.clearAllMocks();

    prisma.user.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValue(0);

    prisma.community.findMany.mockResolvedValue([]);
    prisma.community.count.mockResolvedValue(0);

    prisma.post.findMany.mockResolvedValue([]);
    prisma.post.count.mockResolvedValue(0);

    service = new SearchService(
      prisma as unknown as PrismaService,
    );
  });

  it("rejects an empty search query", async () => {
    await expect(
      service.search("   "),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects an invalid search type", async () => {
    await expect(
      service.search("test", "invalid"),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects an invalid sort order", async () => {
    await expect(
      service.search(
        "test",
        "posts",
        1,
        10,
        "wrong",
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("returns post search results with pagination and community filter", async () => {
    const posts = [
      {
        id: "post-1",
        content: "hello world",
        createdAt: new Date(),
        author: {
          id: "user-1",
          username: "worod",
        },
        community: {
          id: "community-1",
          name: "Test Community",
        },
      },
    ];

    prisma.post.findMany.mockResolvedValue(posts);
    prisma.post.count.mockResolvedValue(2);

    const result = await service.search(
      "hello",
      "posts",
      1,
      1,
      "desc",
      "community-1",
    );

    expect(result.results.posts).toEqual(posts);

    expect(result.pagination.posts).toEqual({
      total: 2,
      page: 1,
      limit: 1,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false,
    });

    expect(prisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          content: {
            contains: "hello",
            mode: "insensitive",
          },
          communityId: "community-1",
        },
        skip: 0,
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      }),
    );
  });
});
