import { Injectable } from "@nestjs/common";
import { IFoodAuthService } from "./ifood-auth.service";
import { getIFoodApiBaseUrl } from "./ifood.constants";

const REQUEST_FAILED = "iFood request failed";

@Injectable()
export class IFoodHttpClient {
  constructor(private readonly authService: IFoodAuthService) {}

  async authenticatedGet(path: string): Promise<Response> {
    return this.sendRequest(path, { method: "GET" });
  }

  async authenticatedPost(path: string, body: unknown): Promise<Response> {
    return this.sendRequest(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  private async sendRequest(path: string, init: RequestInit): Promise<Response> {
    const token = await this.authService.getAccessToken();
    const url = `${getIFoodApiBaseUrl()}${path}`;
    const response = await fetch(url, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`${REQUEST_FAILED}: ${path} ${response.status}`);
    return response;
  }
}
