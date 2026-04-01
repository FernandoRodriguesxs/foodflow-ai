import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SocketAuthenticationService } from "./socket-authentication.service";
import { buildStoreRoom, DASHBOARD_EVENTS } from "./dashboard.constants";

@WebSocketGateway({ cors: { origin: "*" } })
export class DashboardGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly socketAuthentication: SocketAuthenticationService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const user = await this.socketAuthentication.authenticate(client);
    if (!user) {
      client.disconnect(true);
      return;
    }
    const room = buildStoreRoom(user.storeId);
    await client.join(room);
    client.emit(DASHBOARD_EVENTS.TEST, { connected: true, room });
  }

  handleDisconnect(_client: Socket): void {}
}
