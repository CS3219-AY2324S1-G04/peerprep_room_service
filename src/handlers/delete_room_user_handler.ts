/**
 * @file Defines {@link DeleteRoomUserHandler}.
 */
import express from 'express';

import HttpErrorInfo from '../data_structs/http_error_info';
import Room from '../data_structs/room';
import UserId from '../data_structs/user_id';
import AccessTokenVerifier, {
  UserProfile,
} from '../services/access_token_verifier';
import DatabaseClient from '../services/database_client';
import MqClient from '../services/mq_client';
import { accessTokenKey } from '../utils/parameter_keys';
import Handler, { HttpMethod } from './handler';

/**
 * Handles REST API requests for removing the user who made the request from
 * the room he/she is in.
 */
export default class DeleteRoomUserHandler extends Handler {
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
    return HttpMethod.delete;
  }

  /** @inheritdoc */
  public override get subPath(): string {
    return 'room/user';
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

  private static async _removeRoomUser(
    databaseClient: DatabaseClient,
    userId: UserId,
  ): Promise<Room> {
    const room: Room | undefined =
      await databaseClient.fetchRoomFromUserId(userId);

    if (room === undefined || !(await databaseClient.removeRoomUser(userId))) {
      throw new HttpErrorInfo(404);
    }

    return {
      roomId: room.roomId,
      userIds: room.userIds.filter((id) => id.toNumber() !== userId.toNumber()),
      questionId: room.questionId,
      questionLangSlug: room.questionLangSlug,
      roomExpiry: room.roomExpiry,
    };
  }

  /**
   * Removes the user whose access token was specified from the room he/she is
   * in. Sends a HTTP 200 response and publishes a "remove user from room" event
   * in the MQ.
   * @param req - Information about the request.
   * @param res - For creating and sending the response.
   * @param next - Called to let the next handler (if any) handle the request.
   * @param databaseClient - Client for communicating with the database.
   * @param mqClient - Client for communicating with the message queue.
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
    mqClient: MqClient,
  ): Promise<void> {
    const userId: UserId = DeleteRoomUserHandler._parseCookies(
      this._accessTokenVerifier,
      req.cookies,
    );

    const room: Room = await DeleteRoomUserHandler._removeRoomUser(
      databaseClient,
      userId,
    );
    await mqClient.publishRemoveUserEvent(room, userId);

    res.sendStatus(200);
  }
}
