/**
 * @file Defines {@link UserId}.
 */
/** User ID. */
export default class UserId {
  private static _regex: RegExp = RegExp('^[1-9][0-9]*$');

  private readonly _userId: number;

  public constructor(userId: number) {
    this._userId = userId;
  }

  /**
   * Parses a string {@link rawUserId} as a user ID.
   * @param rawUserId - Value to parse.
   * @returns The parsed {@link UserId}.
   * @throws Error if parsing fails.
   */
  public static parseString(rawUserId: unknown): UserId {
    if (!UserId._isString(rawUserId)) {
      throw new Error('User ID must be a string.');
    }

    if (!UserId._isStringSpecified(rawUserId as string | undefined)) {
      throw new Error('User ID cannot be empty.');
    }

    if (!UserId._isPositiveIntegerString(rawUserId as string)) {
      throw new Error('User ID must be a positive integer string.');
    }

    return new UserId(parseInt(rawUserId as string, 10));
  }

  /**
   * Parses a number {@link rawUserId} as a user ID.
   * @param rawUserId - Value to parse.
   * @returns The parsed {@link UserId}.
   * @throws Error if parsing fails.
   */
  public static parseNumber(rawUserId: unknown): UserId {
    if (!UserId._isInteger(rawUserId)) {
      throw new Error('User ID must be an integer.');
    }

    if (!UserId._isPositiveNumber(rawUserId as number)) {
      throw new Error('User ID must be a positive integer.');
    }

    return new UserId(rawUserId as number);
  }

  public static parseMultipleNumbers(rawUserIds: unknown): UserId[] {
    return (Array.isArray(rawUserIds) ? rawUserIds : [rawUserIds]).map(
      UserId.parseNumber,
    );
  }

  private static _isString(rawUserId: unknown): boolean {
    return typeof rawUserId === 'string' || rawUserId === undefined;
  }

  private static _isStringSpecified(rawUserId: string | undefined): boolean {
    return rawUserId !== undefined && rawUserId.length > 0;
  }

  private static _isPositiveIntegerString(rawUserId: string): boolean {
    return UserId._regex.test(rawUserId);
  }

  private static _isInteger(rawUserId: unknown): boolean {
    return typeof rawUserId === 'number' && rawUserId === Math.trunc(rawUserId);
  }

  private static _isPositiveNumber(rawUserId: number): boolean {
    return rawUserId > 0;
  }

  public toString(): string {
    return this._userId.toString();
  }

  public toNumber(): number {
    return this._userId;
  }
}
