/**
 * @file Defines {@link KeepRoomAliveHandler}.
 */
import express from 'express';

import HttpErrorInfo from '../data_structs/http_error_info';
import UserId from '../data_structs/user_id';
import AccessTokenVerifier, {
  UserProfile,
} from '../services/access_token_verifier';
import DatabaseClient from '../services/database_client';
import { accessTokenKey, roomExpiryKey } from '../utils/parameter_keys';
import Handler, { HttpMethod } from './handler';

/**
 * Handles REST API requests for extending the lifespan of the room the user who
 * made the request is in.
 */
export default class KeepRoomAliveHandler extends Handler {
  private _accessTokenVerifier: AccessTokenVerifier;
  private _roomExpireMillis: number;

  /**
   * @param accessTokenVerifier - Access token verifier for verifying access
   * tokens.
   * @param roomExpireMillis - Number of milliseconds a room can live for.
   */
  public constructor(
    accessTokenVerifier: AccessTokenVerifier,
    roomExpireMillis: number,
  ) {
    super();
    this._accessTokenVerifier = accessTokenVerifier;
    this._roomExpireMillis = roomExpireMillis;
  }

  /** @inheritdoc */
  public override get method(): HttpMethod {
    return HttpMethod.patch;
  }

  /** @inheritdoc */
  public override get subPath(): string {
    return 'room/keep-alive';
  }

  private static _parseCookies(
    accessTokenVerifier: AccessTokenVerifier,
    cookies: {
      [x: string]: string | undefined;
    },
  ): UserId {
    let userProfile: UserProfile;
    try {
      userProfile = accessTokenVerifier.verify(cookies[accessTokenKey] ?? '');
    } catch (e) {
      throw new HttpErrorInfo(401);
    }

    return UserId.parseNumber(userProfile.userId);
  }

  private static async _delayRoomExpiry(
    databaseClient: DatabaseClient,
    userId: UserId,
    roomExpireMillis: number,
  ): Promise<Date> {
    const newExpiry = new Date(Date.now() + roomExpireMillis);

    if (!(await databaseClient.updateRoomExpiry(userId, newExpiry))) {
      throw new HttpErrorInfo(404);
    }

    return newExpiry;
  }

  /**
   * Extends the lifespan of the room which contains the user whose access token
   * was specified in a request cookie. Sends a HTTP 200 response containing
   * the updated expiry of the room in a JSON string.
   * @param req - Information about the request.
   * @param res - For creating and sending the response.
   * @param next - Called to let the next handler (if any) handle the request.
   * @param databaseClient - Client for communicating with the database.
   * @throws {HttpErrorInfo} Error 401 if no access token was provided or the
   * access token is invalid.
   * @throws {HttpErrorInfo} Error 404 if the user is not in any room.
   * @throws {HttpErrorInfo} Error 500 if an unexpected error occurs.
   */
  public override async handleLogic(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    databaseClient: DatabaseClient,
  ): Promise<void> {
    const userId: UserId = KeepRoomAliveHandler._parseCookies(
      this._accessTokenVerifier,
      req.cookies,
    );
    const expiry: Date = await KeepRoomAliveHandler._delayRoomExpiry(
      databaseClient,
      userId,
      this._roomExpireMillis,
    );

    res.status(200).send({ [roomExpiryKey]: expiry });
  }
}
