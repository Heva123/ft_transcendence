import { Module } from "@nestjs/common";
import { CommentsController } from "../comments/comments.controller";
import { CommentsService } from "../comments/comments.service";
import { LikesController } from "../likes/likes.controller";
import { LikesService } from "../likes/likes.service";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";

@Module({
  controllers: [
    PostsController,
    CommentsController,
    LikesController,
  ],
  providers: [
    PostsService,
    CommentsService,
    LikesService,
  ],
  exports: [PostsService],
})
export class PostsModule {}
