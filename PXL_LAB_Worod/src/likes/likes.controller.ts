import { Controller, Headers, Param, Post } from '@nestjs/common';
import { DemoIdentityService } from '../demo-identity/demo-identity.service';
import { LikesService } from './likes.service';

@Controller('posts/:postId/likes')
export class LikesController {
  constructor(
    private readonly likes: LikesService,
    private readonly identity: DemoIdentityService,
  ) {}

  @Post()
  async toggle(
    @Headers('x-demo-user') header: string | undefined,
    @Param('postId') postId: string,
  ) {
    return this.likes.toggle(await this.identity.requireUser(header), postId);
  }
}
