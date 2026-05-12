export interface ParsedWhatsAppItem {
  readonly name: string;
  readonly quantity: number;
  readonly notes?: string;
}

export interface ParsedWhatsAppOrder {
  readonly isOrder: boolean;
  readonly items: readonly ParsedWhatsAppItem[];
  readonly customerName?: string;
  readonly notes?: string;
}
