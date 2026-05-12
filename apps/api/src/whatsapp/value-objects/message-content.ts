const INVALID_CONTENT = "Message content must be a non-empty string";

export class MessageContent {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): MessageContent {
    const trimmed = (value ?? "").trim();
    if (trimmed.length === 0) {
      throw new Error(INVALID_CONTENT);
    }
    return new MessageContent(trimmed);
  }
}
