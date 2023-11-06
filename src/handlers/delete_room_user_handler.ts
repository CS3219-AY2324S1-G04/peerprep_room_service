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

export default class DeleteRoomUserHandler extends Handler {
  private _accessTokenVerifier: AccessTokenVerifier;

  public constructor(accessTokenVerifier: AccessTokenVerifier) {
    super();
    this._accessTokenVerifier = accessTokenVerifier;
  }
  public override get method(): HttpMethod {
    return HttpMethod.delete;
  }

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
