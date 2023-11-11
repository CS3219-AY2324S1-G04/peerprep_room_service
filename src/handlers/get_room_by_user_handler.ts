/**
 * @file Defines {@link GetRoomByUserHandler}.
 */
import express from 'express';

import HttpErrorInfo from '../data_structs/http_error_info';
import Room, { createJsonCompatibleRoom } from '../data_structs/room';
import UserId from '../data_structs/user_id';
import AccessTokenVerifier, {
  UserProfile,
} from '../services/access_token_verifier';
import DatabaseClient from '../services/database_client';
import { accessTokenKey } from '../utils/parameter_keys';
import Handler, { HttpMethod } from './handler';

/**
 * Handles REST API requests for getting the room which contains the user who
 * sent the request.
 */
export default class GetRoomByUserHandler extends Handler {
  private _accessTokenVerifier: AccessTokenVerifier;

  /**
   * @param accessTokenVerifier - Access token verifier for verifying access
   * tokens.
   */
  public constructor(accessTokenVerifier: AccessTokenVerifier) {
    super();
    this._accessTokenVerifier = accessTokenVerifier;
  }

  /** @inheritdoc */
  public override get method(): HttpMethod {
    return HttpMethod.get;
  }

  /** @inheritdoc */
  public override get subPath(): string {
    return 'room';
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

  private static async _fetchRoom(
    databaseClient: DatabaseClient,
    userId: UserId,
  ) {
    const room: Room | undefined =
      await databaseClient.fetchRoomFromUserId(userId);

    if (room === undefined) {
      throw new HttpErrorInfo(404);
    }

    return room;
  }

  /**
   * Gets the room which contains the user whose access token was specified in
   * a request cookie. Sends a HTTP 200 response containing information about
   * the room in the resposne body.
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
    const userId: UserId = GetRoomByUserHandler._parseCookies(
      this._accessTokenVerifier,
      req.cookies,
    );
    const room: Room = await GetRoomByUserHandler._fetchRoom(
      databaseClient,
      userId,
    );

    res.status(200).send(createJsonCompatibleRoom(room));
  }
}
