import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { RequirePermissions } from "../permissions/decorators/require-permissions.decorator";
import { CommunityPermissionGuard } from "../permissions/guards/community-permission.guard";
import { Permission } from "../permissions/permission.enum";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { InvitationsService } from "./invitations.service";

/** Managing invitations inside a community (needs MEMBER_ADD). */
@UseGuards(JwtAuthGuard, CommunityPermissionGuard)
@Controller("communities/:communityId/invitations")
export class CommunityInvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Post()
  @RequirePermissions(Permission.MEMBER_ADD)
  create(
    @CurrentUser() user: AuthUser,
    @Param("communityId", ParseUUIDPipe) communityId: string,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitations.create(user.id, communityId, dto);
  }

  @Get()
  @RequirePermissions(Permission.MEMBER_ADD)
  findAll(@Param("communityId", ParseUUIDPipe) communityId: string) {
    return this.invitations.findForCommunity(communityId);
  }

  @Delete(":invitationId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.MEMBER_ADD)
  async revoke(
    @Param("communityId", ParseUUIDPipe) communityId: string,
    @Param("invitationId", ParseUUIDPipe) invitationId: string,
  ) {
    await this.invitations.revoke(communityId, invitationId);
  }
}

/** The invited person's side. */
@UseGuards(JwtAuthGuard)
@Controller("invitations")
export class MyInvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Get()
  findMine(@CurrentUser() user: AuthUser) {
    return this.invitations.findMine(user.id);
  }

  @Post(":invitationId/accept")
  accept(
    @CurrentUser() user: AuthUser,
    @Param("invitationId", ParseUUIDPipe) invitationId: string,
  ) {
    return this.invitations.accept(user.id, invitationId);
  }

  @Post(":invitationId/decline")
  @HttpCode(HttpStatus.NO_CONTENT)
  async decline(
    @CurrentUser() user: AuthUser,
    @Param("invitationId", ParseUUIDPipe) invitationId: string,
  ) {
    await this.invitations.decline(user.id, invitationId);
  }
}
