import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "../auth/auth.module";
import { AdminUsersController } from "./admin-users.controller";
import { AdminUsersService } from "./admin-users.service";
import { SiteAdminGuard } from "./site-admin.guard";
import { GuestReadonlyGuard } from "./guest-readonly.guard";

@Module({
  imports: [AuthModule],
  controllers: [AdminUsersController],
  providers: [
    AdminUsersService,
    SiteAdminGuard,
    { provide: APP_GUARD, useClass: GuestReadonlyGuard },
  ],
})
export class AdminModule {}
