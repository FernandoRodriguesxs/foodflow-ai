export const ANTHROPIC_CLIENT_TOKEN = Symbol("ANTHROPIC_CLIENT_TOKEN");
export const CLAUDE_HAIKU_MODEL = "claude-haiku-4-5-20251001";
export const NLP_MAX_TOKENS = 1024;
export const NLP_TEMPERATURE = 0;

export function getAnthropicApiKey(): string {
  const value = process.env.ANTHROPIC_API_KEY;
  if (!value) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  return value;
}
