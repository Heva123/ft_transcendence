import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import {
  extname,
  join,
} from "path";
import { mkdirSync } from "fs";
import { randomUUID } from "crypto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { UploadsService } from "./uploads.service";

interface UploadedImage {
  path: string;
}

function imageFileFilter(
  _request: unknown,
  file: Express.Multer.File,
  callback: (
    error: Error | null,
    acceptFile: boolean,
  ) => void,
) {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ];

  const extension = extname(
    file.originalname,
  ).toLowerCase();

  if (
    !allowedMimeTypes.includes(file.mimetype) ||
    !allowedExtensions.includes(extension)
  ) {
    callback(
      new BadRequestException(
        "Only JPG, PNG, and WEBP images are allowed",
      ),
      false,
    );
    return;
  }

  callback(null, true);
}

@UseGuards(JwtAuthGuard)
@Controller("uploads")
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
  ) {}

  @Post("avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (
          _request,
          _file,
          callback,
        ) => {
          const destination = join(
            process.cwd(),
            "uploads",
            "avatars",
          );

          mkdirSync(destination, {
            recursive: true,
          });

          callback(null, destination);
        },

        filename: (
          _request,
          file,
          callback,
        ) => {
          callback(
            null,
            `${randomUUID()}${extname(
              file.originalname,
            ).toLowerCase()}`,
          );
        },
      }),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },

      fileFilter: imageFileFilter,
    }),
  )
  uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file?: UploadedImage,
  ) {
    if (!file) {
      throw new BadRequestException(
        "Avatar file is required",
      );
    }

    return this.uploadsService.saveAvatar(
      user.id,
      file.path,
    );
  }

  @Get("avatar/:userId")
  getAvatar(
    @Param("userId", ParseUUIDPipe)
    userId: string,
  ) {
    return this.uploadsService.getAvatar(
      userId,
    );
  }

  @Delete("avatar")
  deleteAvatar(
    @CurrentUser() user: AuthUser,
  ) {
    return this.uploadsService.deleteAvatar(
      user.id,
    );
  }

  @Post("post/:postId")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (
          _request,
          _file,
          callback,
        ) => {
          const destination = join(
            process.cwd(),
            "uploads",
            "posts",
          );

          mkdirSync(destination, {
            recursive: true,
          });

          callback(null, destination);
        },

        filename: (
          _request,
          file,
          callback,
        ) => {
          callback(
            null,
            `${randomUUID()}${extname(
              file.originalname,
            ).toLowerCase()}`,
          );
        },
      }),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },

      fileFilter: imageFileFilter,
    }),
  )
  uploadPostImage(
    @CurrentUser() user: AuthUser,
    @Param("postId", ParseUUIDPipe)
    postId: string,
    @UploadedFile() file?: UploadedImage,
  ) {
    if (!file) {
      throw new BadRequestException(
        "Post image file is required",
      );
    }

    return this.uploadsService.savePostImage(
      user.id,
      postId,
      file.path,
    );
  }

  @Get("post/:postId")
  getPostImage(
    @CurrentUser() user: AuthUser,
    @Param("postId", ParseUUIDPipe)
    postId: string,
  ) {
    return this.uploadsService.getPostImage(
      user.id,
      postId,
    );
  }

  @Delete("post/:postId")
  deletePostImage(
    @CurrentUser() user: AuthUser,
    @Param("postId", ParseUUIDPipe)
    postId: string,
  ) {
    return this.uploadsService.deletePostImage(
      user.id,
      postId,
    );
  }
}
