export class InvalidStatusTransitionError extends Error {
  constructor(
    readonly fromStatus: string,
    readonly toStatus: string,
  ) {
    super(`Cannot transition from ${fromStatus} to ${toStatus}`);
    this.name = "InvalidStatusTransitionError";
    Object.freeze(this);
  }
}
