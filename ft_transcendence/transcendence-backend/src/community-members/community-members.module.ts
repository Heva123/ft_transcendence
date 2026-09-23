import { Module } from "@nestjs/common";
import { PermissionsModule } from "../permissions/permissions.module";
import { CommunityMembersController } from "./community-members.controller";
import { CommunityMembersService } from "./community-members.service";

@Module({
  imports: [PermissionsModule],
  controllers: [CommunityMembersController],
  providers: [CommunityMembersService],
})
export class CommunityMembersModule {}
