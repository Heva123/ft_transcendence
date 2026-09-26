import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { DemoIdentityService } from '../demo-identity/demo-identity.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsService } from './comments.service';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(
    private readonly comments: CommentsService,
    private readonly identity: DemoIdentityService,
  ) {}

  @Get()
  async list(@Headers('x-demo-user') header: string | undefined, @Param('postId') postId: string) {
    return this.comments.list(await this.identity.requireUser(header), postId);
  }

  @Post()
  async create(
    @Headers('x-demo-user') header: string | undefined,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.comments.create(await this.identity.requireUser(header), postId, dto);
  }

  @Patch(':commentId')
  async update(
    @Headers('x-demo-user') header: string | undefined,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.comments.update(await this.identity.requireUser(header), postId, commentId, dto);
  }

  @Delete(':commentId')
  async remove(
    @Headers('x-demo-user') header: string | undefined,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.comments.remove(await this.identity.requireUser(header), postId, commentId);
  }
}
