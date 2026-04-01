import { Injectable, Inject } from "@nestjs/common";
import type { Redis } from "ioredis";
import {
  IFOOD_REDIS_TOKEN,
  IFOOD_TOKEN_CACHE_KEY,
  IFOOD_TOKEN_SAFETY_MARGIN_SECONDS,
  getIFoodApiBaseUrl,
  getIFoodClientId,
  getIFoodClientSecret,
} from "./ifood.constants";
import type { IFoodOAuthTokenResponse } from "./ifood.types";

const OAUTH_PATH = "/authentication/v1.0/oauth/token";
const OAUTH_CONTENT_TYPE = "application/x-www-form-urlencoded";
const OAUTH_REQUEST_FAILED = "iFood OAuth request failed";

@Injectable()
export class IFoodAuthService {
  constructor(@Inject(IFOOD_REDIS_TOKEN) private readonly redis: Redis) {}

  async getAccessToken(): Promise<string> {
    const cached = await this.redis.get(IFOOD_TOKEN_CACHE_KEY);
    if (cached) return cached;
    return this.requestAndCacheToken();
  }

  private async requestAndCacheToken(): Promise<string> {
    const tokenResponse = await this.requestToken();
    const timeToLive = tokenResponse.expiresIn - IFOOD_TOKEN_SAFETY_MARGIN_SECONDS;
    await this.redis.set(IFOOD_TOKEN_CACHE_KEY, tokenResponse.accessToken, "EX", timeToLive);
    return tokenResponse.accessToken;
  }

  private async requestToken(): Promise<IFoodOAuthTokenResponse> {
    const url = `${getIFoodApiBaseUrl()}${OAUTH_PATH}`;
    const body = this.buildRequestBody();
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": OAUTH_CONTENT_TYPE },
      body,
    });
    if (!response.ok) throw new Error(`${OAUTH_REQUEST_FAILED}: ${response.status}`);
    const data = await response.json();
    return { accessToken: data.access_token, expiresIn: data.expires_in };
  }

  private buildRequestBody(): string {
    return new URLSearchParams({
      grant_type: "client_credentials",
      client_id: getIFoodClientId(),
      client_secret: getIFoodClientSecret(),
    }).toString();
  }
}
