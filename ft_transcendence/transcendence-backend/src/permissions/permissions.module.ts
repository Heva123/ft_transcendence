import { Module } from "@nestjs/common";
import { GroupPermissionGuard } from "./guards/group-permission.guard";
import { PermissionsController } from "./permissions.controller";

@Module({
  controllers: [PermissionsController],
  providers: [GroupPermissionGuard],
  exports: [GroupPermissionGuard],
})
export class PermissionsModule {}
