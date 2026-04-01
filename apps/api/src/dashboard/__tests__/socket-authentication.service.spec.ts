import { SocketAuthenticationService } from "@dashboard/socket-authentication.service";
import type { AuthInstance } from "@auth/auth.instance";
import type { Socket } from "socket.io";

const FAKE_USER_ID = "user-001";
const FAKE_STORE_ID = "store-001";
const FAKE_ROLE = "owner";

function createFakeSession() {
  return {
    user: { id: FAKE_USER_ID, storeId: FAKE_STORE_ID, role: FAKE_ROLE },
  };
}

function createFakeSocket(overrides: {
  authToken?: string;
  authorizationHeader?: string;
}): Socket {
  return {
    handshake: {
      auth: { token: overrides.authToken },
      headers: { authorization: overrides.authorizationHeader },
    },
  } as unknown as Socket;
}

describe("SocketAuthenticationService", () => {
  const mockGetSession = jest.fn();
  const mockAuth = { api: { getSession: mockGetSession } } as unknown as AuthInstance;

  const service = new SocketAuthenticationService(mockAuth);

  afterEach(() => jest.clearAllMocks());

  it("should authenticate via handshake auth token", async () => {
    mockGetSession.mockResolvedValue(createFakeSession());
    const socket = createFakeSocket({ authToken: "valid-jwt" });

    const result = await service.authenticate(socket);

    expect(result).toEqual({ userId: FAKE_USER_ID, storeId: FAKE_STORE_ID, role: FAKE_ROLE });
    expect(mockGetSession).toHaveBeenCalledWith({
      headers: new Headers({ authorization: "Bearer valid-jwt" }),
    });
  });

  it("should authenticate via authorization header", async () => {
    mockGetSession.mockResolvedValue(createFakeSession());
    const socket = createFakeSocket({ authorizationHeader: "Bearer header-jwt" });

    const result = await service.authenticate(socket);

    expect(result).toEqual({ userId: FAKE_USER_ID, storeId: FAKE_STORE_ID, role: FAKE_ROLE });
  });

  it("should return null when no token is provided", async () => {
    const socket = createFakeSocket({});

    const result = await service.authenticate(socket);

    expect(result).toBeNull();
    expect(mockGetSession).not.toHaveBeenCalled();
  });

  it("should return null when session is invalid", async () => {
    mockGetSession.mockResolvedValue(null);
    const socket = createFakeSocket({ authToken: "invalid-jwt" });

    const result = await service.authenticate(socket);

    expect(result).toBeNull();
  });
});
