import { Inject, Injectable } from "@nestjs/common";
import type { Socket } from "socket.io";
import { AUTH_INSTANCE_TOKEN } from "@auth/auth.constants";
import type { AuthInstance } from "@auth/auth.instance";
import { createAuthenticatedUser, type AuthenticatedUser } from "@auth/auth.types";

@Injectable()
export class SocketAuthenticationService {
  constructor(
    @Inject(AUTH_INSTANCE_TOKEN) private readonly auth: AuthInstance,
  ) {}

  async authenticate(socket: Socket): Promise<AuthenticatedUser | null> {
    const token = this.extractToken(socket);
    if (!token) {
      return null;
    }
    return this.resolveUser(token);
  }

  private extractToken(socket: Socket): string | null {
    const authHeader = socket.handshake.auth?.token as string | undefined;
    if (authHeader) {
      return authHeader;
    }
    const headerValue = socket.handshake.headers?.authorization;
    if (!headerValue) {
      return null;
    }
    return headerValue.replace("Bearer ", "");
  }

  private async resolveUser(token: string): Promise<AuthenticatedUser | null> {
    const headers = new Headers({ authorization: `Bearer ${token}` });
    const session = await this.auth.api.getSession({ headers });
    if (!session) {
      return null;
    }
    return createAuthenticatedUser(session);
  }
}
