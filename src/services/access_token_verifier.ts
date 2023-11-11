/**
 * @file Defines {@link AccessTokenVerifier}.
 */
import jwt, { JwtPayload } from 'jsonwebtoken';

/** Verifies access tokens. */
export default class AccessTokenVerifier {
  private static _userIdKey: string = 'user-id';
  private static _userRoleKey: string = 'user-role';
  private static _usernameKey: string = 'username';
  private static _emailAddressKey: string = 'email-address';

  private readonly _publicKey: string;

  /**
   * @param publicKey - Public key for verifying access tokens.
   */
  public constructor(publicKey: string) {
    this._publicKey = publicKey;
  }

  /**
   * Verifies the access token {@link accessToken}.
   * @param accessToken - Access token to verify.
   * @returns User profile created from the payload of the verified access
   * token.
   * @throws Error if the access token is invalid.
   */
  public verify(accessToken: string): UserProfile {
    let payload: JwtPayload;

    try {
      payload = jwt.verify(accessToken, this._publicKey) as JwtPayload;
    } catch (e) {
      throw new Error('Invalid access token.');
    }

    return {
      userId: payload[AccessTokenVerifier._userIdKey],
      userRole: payload[AccessTokenVerifier._userRoleKey],
      username: payload[AccessTokenVerifier._usernameKey],
      emailAddress: payload[AccessTokenVerifier._emailAddressKey],
    };
  }
}

/**
 * User profile.
 */
export interface UserProfile {
  /** User ID. */
  userId: number;
  /** User role. */
  userRole: string;
  /** Username. */
  username: string;
  /** Email address. */
  emailAddress: string;
}
