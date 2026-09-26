import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { DemoIdentityService } from '../demo-identity/demo-identity.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly posts: PostsService,
    private readonly identity: DemoIdentityService,
  ) {}

  @Get()
  async list(
    @Headers('x-demo-user') header: string | undefined,
    @Query() query: FeedQueryDto,
  ) {
    return this.posts.list(await this.identity.requireUser(header), query);
  }

  @Get(':postId')
  async one(
    @Headers('x-demo-user') header: string | undefined,
    @Param('postId') postId: string,
  ) {
    return this.posts.one(await this.identity.requireUser(header), postId);
  }

  @Post()
  async create(
    @Headers('x-demo-user') header: string | undefined,
    @Body() dto: CreatePostDto,
  ) {
    return this.posts.create(await this.identity.requireUser(header), dto);
  }

  @Patch(':postId')
  async update(
    @Headers('x-demo-user') header: string | undefined,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.posts.update(await this.identity.requireUser(header), postId, dto);
  }

  @Delete(':postId')
  async remove(
    @Headers('x-demo-user') header: string | undefined,
    @Param('postId') postId: string,
  ) {
    return this.posts.remove(await this.identity.requireUser(header), postId);
  }
}
