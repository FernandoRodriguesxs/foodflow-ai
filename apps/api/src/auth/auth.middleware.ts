import {
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import type { FastifyRequest, FastifyReply } from "fastify";
import { AUTH_INSTANCE_TOKEN, ERROR_INVALID_TOKEN } from "./auth.constants";
import type { AuthInstance } from "./auth.instance";
import { createAuthenticatedUser, type AuthenticatedUser } from "./auth.types";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(AUTH_INSTANCE_TOKEN) private readonly auth: AuthInstance,
  ) {}

  async use(request: FastifyRequest, _response: FastifyReply, next: () => void) {
    const session = await this.resolveSession(request);
    if (!session) {
      throw new UnauthorizedException(ERROR_INVALID_TOKEN);
    }
    (request as FastifyRequest & { user: AuthenticatedUser }).user =
      createAuthenticatedUser(session);
    next();
  }

  private async resolveSession(request: FastifyRequest) {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return null;
    }
    const headers = new Headers({ authorization: authorizationHeader });
    return this.auth.api.getSession({ headers });
  }
}
