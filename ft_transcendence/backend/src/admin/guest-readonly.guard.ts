import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { SiteRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { JwtPayload } from "../auth/types/jwt-payload.type";

const ALLOW_GUEST_WRITE = "allowGuestWrite";
export const AllowGuestWrite = () => SetMetadata(ALLOW_GUEST_WRITE, true);

@Injectable()
export class GuestReadonlyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    if (context.getType() !== "http") return true;
    const request = context
      .switchToHttp()
      .getRequest<{ method: string; headers: { authorization?: string } }>();
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
    if (
      this.reflector.getAllAndOverride<boolean>(ALLOW_GUEST_WRITE, [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;
    const token =
      request.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
    // Protected endpoints still run their existing JwtAuthGuard.
    if (!token) return true;
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { siteRole: true },
    });
    if (!user) throw new UnauthorizedException("User no longer exists");
    if (user.siteRole === SiteRole.GUEST)
      throw new ForbiddenException("Guest accounts have read-only access");
    return true;
  }
}
