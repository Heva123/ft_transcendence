import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { SiteRole } from "@prisma/client";
import { AuthUser } from "../common/types/auth-user.type";

@Injectable()
export class SiteAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (user?.siteRole !== SiteRole.ADMIN) {
      throw new ForbiddenException("Site administrator access is required");
    }
    return true;
  }
}
