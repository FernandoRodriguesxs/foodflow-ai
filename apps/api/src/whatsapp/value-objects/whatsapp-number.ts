const INVALID_NUMBER = "WhatsApp number must be a non-empty string";
const NUMBER_TOO_LONG = "WhatsApp number exceeds maximum length of 20 characters";
const MAX_LENGTH = 20;

export class WhatsAppNumber {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): WhatsAppNumber {
    const trimmed = (value ?? "").trim();
    if (trimmed.length === 0) {
      throw new Error(INVALID_NUMBER);
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new Error(NUMBER_TOO_LONG);
    }
    return new WhatsAppNumber(trimmed);
  }

  static fromRemoteJid(jid: string): WhatsAppNumber {
    const [rawNumber] = (jid ?? "").split("@");
    return WhatsAppNumber.create(rawNumber ?? "");
  }
}
