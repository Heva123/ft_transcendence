import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { CreatePostDto } from "./dto/create-post.dto";
import { FeedQueryDto } from "./dto/feed-query.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PostsService } from "./posts.service";

@UseGuards(JwtAuthGuard)
@Controller("posts")
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: FeedQueryDto,
  ) {
    return this.posts.list(user.id, query);
  }

  @Get(":postId")
  one(
    @CurrentUser() user: AuthUser,
    @Param("postId", ParseUUIDPipe) postId: string,
  ) {
    return this.posts.one(user.id, postId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePostDto,
  ) {
    return this.posts.create(user.id, dto);
  }

  @Patch(":postId")
  update(
    @CurrentUser() user: AuthUser,
    @Param("postId", ParseUUIDPipe) postId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.posts.update(user.id, postId, dto);
  }

  @Delete(":postId")
  remove(
    @CurrentUser() user: AuthUser,
    @Param("postId", ParseUUIDPipe) postId: string,
  ) {
    return this.posts.remove(user.id, postId);
  }
}
