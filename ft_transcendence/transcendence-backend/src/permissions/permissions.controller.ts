import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Permission } from "./permission.enum";

@UseGuards(JwtAuthGuard)
@Controller("permissions")
export class PermissionsController {
  @Get()
  findAll() {
    return Object.values(Permission);
  }
}
