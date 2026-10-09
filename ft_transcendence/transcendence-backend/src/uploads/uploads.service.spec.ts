import {
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UploadsService } from "./uploads.service";
import {
  existsSync,
  unlinkSync,
} from "fs";

jest.mock("fs", () => ({
  createReadStream: jest.fn(),
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe("UploadsService", () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    post: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    communityMember: {
      findUnique: jest.fn(),
    },
  };

  let service: UploadsService;

  const mockedExistsSync =
    existsSync as jest.MockedFunction<typeof existsSync>;

  const mockedUnlinkSync =
    unlinkSync as jest.MockedFunction<typeof unlinkSync>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedExistsSync.mockReturnValue(false);

    service = new UploadsService(
      prisma as unknown as PrismaService,
    );
  });

  it("saves an avatar without exposing the local file path", async () => {
    prisma.user.findUnique.mockResolvedValue({
      avatarPath: null,
    });

    prisma.user.update.mockResolvedValue({
      id: "user-1",
      username: "worod",
    });

    const result = await service.saveAvatar(
      "user-1",
      "/private/avatar.png",
    );

    expect(result).toEqual({
      id: "user-1",
      username: "worod",
      avatarUrl: "/api/uploads/avatar/user-1",
    });

    expect(result).not.toHaveProperty(
      "avatarPath",
    );
  });

  it("rejects uploading an image to another user's post", async () => {
    prisma.post.findUnique.mockResolvedValue({
      authorId: "other-user",
      imagePath: null,
    });

    await expect(
      service.savePostImage(
        "user-1",
        "post-1",
        "/tmp/image.png",
      ),
    ).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    expect(
      prisma.post.update,
    ).not.toHaveBeenCalled();
  });

  it("allows the author to save a post image", async () => {
    prisma.post.findUnique.mockResolvedValue({
      authorId: "user-1",
      imagePath: null,
    });

    prisma.post.update.mockResolvedValue({
      id: "post-1",
    });

    const result =
      await service.savePostImage(
        "user-1",
        "post-1",
        "/tmp/image.png",
      );

    expect(
      prisma.post.update,
    ).toHaveBeenCalledWith({
      where: {
        id: "post-1",
      },
      data: {
        imagePath: "/tmp/image.png",
      },
    });

    expect(result).toEqual({
      postId: "post-1",
      imageUrl: "/api/uploads/post/post-1",
    });
  });

  it("rejects access to a community post image for a non-member", async () => {
    prisma.post.findUnique.mockResolvedValue({
      imagePath: "/tmp/image.png",
      communityId: "community-1",
    });

    prisma.communityMember.findUnique.mockResolvedValue(
      null,
    );

    await expect(
      service.getPostImage(
        "user-1",
        "post-1",
      ),
    ).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("deletes an author's post image and removes the file", async () => {
    prisma.post.findUnique.mockResolvedValue({
      authorId: "user-1",
      imagePath: "/tmp/image.png",
    });

    mockedExistsSync.mockReturnValue(true);

    prisma.post.update.mockResolvedValue({
      id: "post-1",
    });

    const result =
      await service.deletePostImage(
        "user-1",
        "post-1",
      );

    expect(
      mockedUnlinkSync,
    ).toHaveBeenCalled();

    expect(
      prisma.post.update,
    ).toHaveBeenCalledWith({
      where: {
        id: "post-1",
      },
      data: {
        imagePath: null,
      },
    });

    expect(result).toEqual({
      postId: "post-1",
      imagePath: null,
      deleted: true,
    });
  });

  it("returns 404 when an avatar does not exist", async () => {
    prisma.user.findUnique.mockResolvedValue({
      avatarPath: null,
    });

    await expect(
      service.getAvatar("user-1"),
    ).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
