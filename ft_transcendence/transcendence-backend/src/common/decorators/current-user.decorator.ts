import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthUser } from "../types/auth-user.type";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
