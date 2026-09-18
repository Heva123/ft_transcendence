import { Module } from "@nestjs/common";
import { PermissionsModule } from "../permissions/permissions.module";
import { MembersController } from "./members.controller";
import { MembersService } from "./members.service";

@Module({
  imports: [PermissionsModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
