import { Module } from "@nestjs/common";
import { CommunityPermissionGuard } from "./guards/community-permission.guard";
import { PermissionsController } from "./permissions.controller";

@Module({
  controllers: [PermissionsController],
  providers: [CommunityPermissionGuard],
  exports: [CommunityPermissionGuard],
})
export class PermissionsModule {}
