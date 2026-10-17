import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { LikesService } from "./likes.service";

@UseGuards(JwtAuthGuard)
@Controller("posts/:postId/likes")
export class LikesController {
  constructor(private readonly likes: LikesService) {}

  @Post()
  toggle(
    @CurrentUser() user: AuthUser,
    @Param("postId", ParseUUIDPipe) postId: string,
  ) {
    return this.likes.toggle(user.id, postId);
  }
}
