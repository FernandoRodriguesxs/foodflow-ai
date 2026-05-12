import { DashboardGateway } from "@dashboard/dashboard.gateway";
import { DASHBOARD_EVENTS } from "@dashboard/dashboard.constants";
import type { SocketAuthenticationService } from "@dashboard/socket-authentication.service";
import type { Server, Socket } from "socket.io";

const FAKE_STORE_ID = "store-001";

function createMockSocket(): jest.Mocked<Socket> {
  return {
    join: jest.fn().mockResolvedValue(undefined),
    emit: jest.fn(),
    disconnect: jest.fn(),
  } as unknown as jest.Mocked<Socket>;
}

function createMockServer(): { server: jest.Mocked<Server>; roomEmit: jest.Mock } {
  const roomEmit = jest.fn();
  const server = {
    to: jest.fn().mockReturnValue({ emit: roomEmit }),
  } as unknown as jest.Mocked<Server>;
  return { server, roomEmit };
}

describe("DashboardGateway", () => {
  const mockAuthentication = {
    authenticate: jest.fn(),
  } as unknown as jest.Mocked<SocketAuthenticationService>;

  const gateway = new DashboardGateway(mockAuthentication);

  afterEach(() => jest.clearAllMocks());

  it("should join store room and emit test event on valid connection", async () => {
    const authenticatedUser = { userId: "u1", storeId: FAKE_STORE_ID, role: "owner" };
    mockAuthentication.authenticate = jest.fn().mockResolvedValue(authenticatedUser);
    const socket = createMockSocket();

    await gateway.handleConnection(socket);

    expect(socket.join).toHaveBeenCalledWith(`store:${FAKE_STORE_ID}`);
    expect(socket.emit).toHaveBeenCalledWith(
      DASHBOARD_EVENTS.TEST,
      { connected: true, room: `store:${FAKE_STORE_ID}` },
    );
  });

  it("should disconnect client when authentication fails", async () => {
    mockAuthentication.authenticate = jest.fn().mockResolvedValue(null);
    const socket = createMockSocket();

    await gateway.handleConnection(socket);

    expect(socket.disconnect).toHaveBeenCalledWith(true);
    expect(socket.join).not.toHaveBeenCalled();
  });

  it("should broadcast event to store room via server", () => {
    const { server, roomEmit } = createMockServer();
    gateway.server = server;
    const payload = { hello: "world" };

    gateway.broadcastToStore(FAKE_STORE_ID, DASHBOARD_EVENTS.NEW_ORDER, payload);

    expect(server.to).toHaveBeenCalledWith(`store:${FAKE_STORE_ID}`);
    expect(roomEmit).toHaveBeenCalledWith(DASHBOARD_EVENTS.NEW_ORDER, payload);
  });
});
