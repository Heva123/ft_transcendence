import { Controller, Get, UseGuards } from "@nestjs/common";
import { CommunityRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ROLE_PERMISSIONS } from "./role-permissions";

@UseGuards(JwtAuthGuard)
@Controller("roles")
export class RolesController {
  @Get()
  findAll() {
    return Object.values(CommunityRole).map((role) => ({
      role,
      permissions: ROLE_PERMISSIONS[role],
    }));
  }
}
