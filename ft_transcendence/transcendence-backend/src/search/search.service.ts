import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    userId: string,
    query: string,
    type = "all",
    page = 1,
    limit = 10,
    sort = "desc",
    communityId?: string,
  ) {
    const q = query.trim();

    if (!q) {
      throw new BadRequestException("Search query is required");
    }

    const allowedTypes = [
      "all",
      "users",
      "communities",
      "posts",
    ];

    if (!allowedTypes.includes(type)) {
      throw new BadRequestException("Invalid search type");
    }

    if (!["asc", "desc"].includes(sort)) {
      throw new BadRequestException("Invalid sort order");
    }

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const skip = (safePage - 1) * safeLimit;

    const sortOrder = sort as "asc" | "desc";

    let users: unknown[] = [];
    let communities: unknown[] = [];
    let posts: unknown[] = [];

    let usersTotal = 0;
    let communitiesTotal = 0;
    let postsTotal = 0;

    if (type === "all" || type === "users") {
      const userWhere = {
        username: {
          contains: q,
          mode: "insensitive" as const,
        },
      };

      [users, usersTotal] = await Promise.all([
        this.prisma.user.findMany({
          where: userWhere,
          select: {
            id: true,
            username: true,
          },
          orderBy: {
            username: sortOrder,
          },
          skip,
          take: safeLimit,
        }),
        this.prisma.user.count({
          where: userWhere,
        }),
      ]);
    }

    if (type === "all" || type === "communities") {
      const communityWhere: Prisma.CommunityWhereInput = {
        AND: [
          {
            OR: [
              {
                name: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            ],
          },
          {
            OR: [
              {
                isPublic: true,
              },
              {
                members: {
                  some: {
                    userId,
                  },
                },
              },
            ],
          },
        ],
      };

      [communities, communitiesTotal] = await Promise.all([
        this.prisma.community.findMany({
          where: communityWhere,
          select: {
            id: true,
            name: true,
            description: true,
            isPublic: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: sortOrder,
          },
          skip,
          take: safeLimit,
        }),
        this.prisma.community.count({
          where: communityWhere,
        }),
      ]);
    }

    if (type === "all" || type === "posts") {
      const postWhere: Prisma.PostWhereInput = {
        content: {
          contains: q,
          mode: "insensitive",
        },
        ...(communityId ? { communityId } : {}),
        OR: [
          {
            communityId: null,
          },
          {
            community: {
              is: {
                members: {
                  some: {
                    userId,
                  },
                },
              },
            },
          },
        ],
      };

      [posts, postsTotal] = await Promise.all([
        this.prisma.post.findMany({
          where: postWhere,
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true,
              },
            },
            community: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: sortOrder,
          },
          skip,
          take: safeLimit,
        }),
        this.prisma.post.count({
          where: postWhere,
        }),
      ]);
    }

    const pagination = (
      total: number,
    ) => ({
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
      hasNextPage:
        safePage * safeLimit < total,
      hasPreviousPage: safePage > 1,
    });

    return {
      query: q,
      type,
      sort: sortOrder,
      filters: {
        communityId: communityId ?? null,
      },
      results: {
        users,
        communities,
        posts,
      },
      pagination: {
        users: pagination(usersTotal),
        communities: pagination(communitiesTotal),
        posts: pagination(postsTotal),
      },
    };
  }
}
