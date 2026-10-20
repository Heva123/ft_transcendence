import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  createReadStream,
  existsSync,
  unlinkSync,
} from "fs";
import { resolve } from "path";

@Injectable()
export class UploadsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveAvatar(
    userId: string,
    filePath: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        avatarPath: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarPath: filePath,
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (
      user.avatarPath &&
      user.avatarPath !== filePath
    ) {
      const oldPath = resolve(user.avatarPath);

      if (existsSync(oldPath)) {
        unlinkSync(oldPath);
      }
    }

    return {
      id: updated.id,
      username: updated.username,
      avatarUrl: `/api/uploads/avatar/${userId}`,
    };
  }

  async getAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        avatarPath: true,
      },
    });

    if (
      !user?.avatarPath ||
      !existsSync(resolve(user.avatarPath))
    ) {
      throw new NotFoundException("Avatar not found");
    }

    return this.createImageStream(user.avatarPath);
  }

  async deleteAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        avatarPath: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.avatarPath) {
      const path = resolve(user.avatarPath);

      if (existsSync(path)) {
        unlinkSync(path);
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarPath: null,
      },
    });

    return {
      avatarPath: null,
      deleted: true,
    };
  }

  async saveChatAttachment(
    userId: string,
    channelId: string,
    file: {
      path: string;
      originalname: string;
      mimetype: string;
      size: number;
    },
  ) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      select: {
        communityId: true,
      },
    });

    if (!channel) {
      this.deleteFile(file.path);
      throw new NotFoundException("Channel not found");
    }

    const membership =
      await this.prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId: channel.communityId,
          },
        },
        select: {
          id: true,
        },
      });

    if (!membership) {
      this.deleteFile(file.path);
      throw new ForbiddenException(
        "You must be a community member to upload chat attachments",
      );
    }

    try {
      const attachment =
        await this.prisma.messageAttachment.create({
          data: {
            channelId,
            uploaderId: userId,
            name: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
          },
          select: {
            id: true,
            name: true,
            mimeType: true,
            size: true,
          },
        });

      return {
        id: attachment.id,
        name: attachment.name,
        url: `/api/uploads/chat/${attachment.id}`,
        type: attachment.mimeType,
        size: attachment.size,
      };
    } catch (error) {
      this.deleteFile(file.path);
      throw error;
    }
  }

  async getChatAttachment(
    userId: string,
    attachmentId: string,
  ) {
    const attachment =
      await this.prisma.messageAttachment.findUnique({
        where: {
          id: attachmentId,
        },
        select: {
          path: true,
          mimeType: true,
          channel: {
            select: {
              communityId: true,
            },
          },
        },
      });

    if (!attachment) {
      throw new NotFoundException(
        "Chat attachment not found",
      );
    }

    const membership =
      await this.prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId:
              attachment.channel.communityId,
          },
        },
        select: {
          id: true,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "You must be a community member to access this attachment",
      );
    }

    const path = resolve(attachment.path);

    if (!existsSync(path)) {
      throw new NotFoundException(
        "Chat attachment file not found",
      );
    }

    return new StreamableFile(
      createReadStream(path),
      {
        type: attachment.mimeType,
      },
    );
  }

  async savePostImage(
    userId: string,
    postId: string,
    filePath: string,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
        imagePath: true,
      },
    });

    if (!post) {
      const uploadedPath = resolve(filePath);

      if (existsSync(uploadedPath)) {
        unlinkSync(uploadedPath);
      }

      throw new NotFoundException("Post not found");
    }

    if (post.authorId !== userId) {
      const uploadedPath = resolve(filePath);

      if (existsSync(uploadedPath)) {
        unlinkSync(uploadedPath);
      }

      throw new ForbiddenException(
        "Only the author may upload a post image",
      );
    }

    try {
      await this.prisma.post.update({
        where: { id: postId },
        data: {
          imagePath: filePath,
        },
      });
    } catch (error) {
      const uploadedPath = resolve(filePath);

      if (existsSync(uploadedPath)) {
        unlinkSync(uploadedPath);
      }

      throw error;
    }

    if (
      post.imagePath &&
      post.imagePath !== filePath
    ) {
      const oldPath = resolve(post.imagePath);

      if (existsSync(oldPath)) {
        unlinkSync(oldPath);
      }
    }

    return {
      postId,
      imageUrl: `/api/uploads/post/${postId}`,
    };
  }

  async getPostImage(
    userId: string,
    postId: string,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        imagePath: true,
        communityId: true,
      },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (post.communityId) {
      const membership =
        await this.prisma.communityMember.findUnique({
          where: {
            userId_communityId: {
              userId,
              communityId: post.communityId,
            },
          },
          select: {
            id: true,
          },
        });

      if (!membership) {
        throw new ForbiddenException(
          "Community membership required",
        );
      }
    }

    if (
      !post.imagePath ||
      !existsSync(resolve(post.imagePath))
    ) {
      throw new NotFoundException(
        "Post image not found",
      );
    }

    return this.createImageStream(post.imagePath);
  }

  async deletePostImage(
    userId: string,
    postId: string,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
        imagePath: true,
      },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException(
        "Only the author may delete a post image",
      );
    }

    if (post.imagePath) {
      const path = resolve(post.imagePath);

      if (existsSync(path)) {
        unlinkSync(path);
      }
    }

    await this.prisma.post.update({
      where: { id: postId },
      data: {
        imagePath: null,
      },
    });

    return {
      postId,
      imagePath: null,
      deleted: true,
    };
  }

  private deleteFile(
    filePath: string,
  ) {
    const path = resolve(filePath);

    if (existsSync(path)) {
      unlinkSync(path);
    }
  }

  private createImageStream(
    filePath: string,
  ) {
    const path = resolve(filePath);

    const extension = path
      .split(".")
      .pop()
      ?.toLowerCase();

    const contentTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      pdf: "application/pdf",
    };

    return new StreamableFile(
      createReadStream(path),
      {
        type:
          contentTypes[extension ?? ""] ??
          "application/octet-stream",
      },
    );
  }
}
