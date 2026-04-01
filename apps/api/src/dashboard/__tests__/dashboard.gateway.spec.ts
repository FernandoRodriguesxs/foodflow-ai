import { DashboardGateway } from "@dashboard/dashboard.gateway";
import { DASHBOARD_EVENTS } from "@dashboard/dashboard.constants";
import type { SocketAuthenticationService } from "@dashboard/socket-authentication.service";
import type { Socket } from "socket.io";

const FAKE_STORE_ID = "store-001";

function createMockSocket(): jest.Mocked<Socket> {
  return {
    join: jest.fn().mockResolvedValue(undefined),
    emit: jest.fn(),
    disconnect: jest.fn(),
  } as unknown as jest.Mocked<Socket>;
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
});
