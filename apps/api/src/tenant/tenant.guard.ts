import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { AuthenticatedUser } from "@auth/auth.types";
import { MISSING_TENANT_CONTEXT } from "./tenant.constants";

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user?.storeId) {
      throw new ForbiddenException(MISSING_TENANT_CONTEXT);
    }

    return true;
  }
}
